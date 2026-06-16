'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { changePasswordSchema } from '@/lib/validators';
import { formatCpf } from '@/lib/cpf';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaymentMethod } from '@/types';
import { Plus, Star, Trash2 } from 'lucide-react';
import { z } from 'zod';

const methodSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['cash', 'debit', 'credit', 'pix', 'transfer', 'other']),
});

const typeLabels: Record<string, string> = {
  cash: 'Dinheiro',
  debit: 'Débito',
  credit: 'Crédito',
  pix: 'PIX',
  transfer: 'Transferência',
  other: 'Outro',
};

export default function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { data: user } = useAuth();

  const { data: methods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
  });

  const passwordForm = useForm({ resolver: zodResolver(changePasswordSchema) });
  const methodForm = useForm({ resolver: zodResolver(methodSchema), defaultValues: { type: 'cash' } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Configurações</h1>
        <p className="text-sm text-slate-500">Perfil, senha e métodos de pagamento</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-slate-500">Nome</p>
            <p className="font-medium">{user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">CPF</p>
            <p className="font-medium">{user?.cpf ? formatCpf(user.cpf) : '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Email</p>
            <p className="font-medium">{user?.email || '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Alterar senha</CardTitle></CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(async (data) => {
              await api.patch('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
              });
              setMessage('Senha alterada com sucesso!');
              passwordForm.reset();
            })}
            className="max-w-md space-y-4"
          >
            <div className="space-y-2"><Label>Senha atual</Label><Input type="password" {...passwordForm.register('currentPassword')} /></div>
            <div className="space-y-2"><Label>Nova senha</Label><Input type="password" {...passwordForm.register('newPassword')} /></div>
            <div className="space-y-2"><Label>Confirmar nova senha</Label><Input type="password" {...passwordForm.register('confirmPassword')} /></div>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            <Button type="submit">Alterar senha</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Métodos de pagamento</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto"><Plus className="h-4 w-4" /> Adicionar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo método</DialogTitle></DialogHeader>
              <form
                onSubmit={methodForm.handleSubmit(async (data) => {
                  await api.post('/payment-methods', data);
                  await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
                  methodForm.reset();
                  setOpen(false);
                })}
                className="space-y-4"
              >
                <div className="space-y-2"><Label>Nome</Label><Input placeholder="Ex: Nubank Crédito" {...methodForm.register('name')} /></div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={methodForm.watch('type')} onValueChange={(v) => methodForm.setValue('type', v as never)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {methods?.map((m) => (
            <div key={m.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <div className="min-w-0">
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-slate-500">{typeLabels[m.type]}</p>
              </div>
              <div className="flex items-center justify-end gap-1">
                {m.isDefault ? (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                ) : (
                  <Button size="sm" variant="ghost" onClick={async () => {
                    await api.patch(`/payment-methods/${m.id}/default`);
                    await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
                  }}>
                    Tornar padrão
                  </Button>
                )}
                {!m.isDefault && (
                  <Button size="icon" variant="ghost" onClick={async () => {
                    await api.delete(`/payment-methods/${m.id}`);
                    await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
                  }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
