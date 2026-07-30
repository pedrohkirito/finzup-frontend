'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';

export function ItemActions({
  onEdit,
  onDelete,
  readOnly = false,
  itemName,
  confirmTitle = 'Confirmar exclusão',
}: {
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  readOnly?: boolean;
  itemName?: string;
  confirmTitle?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (readOnly) return null;

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label="Editar"
          className="h-7 w-7 dark:hover:bg-white/[0.06]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConfirmOpen(true)}
          aria-label="Excluir"
          className="h-7 w-7 dark:hover:bg-white/[0.06]"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !deleting && setConfirmOpen(open)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>
              {itemName ? (
                <>
                  Remover{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{itemName}</span>?
                  Essa ação não pode ser desfeita.
                </>
              ) : (
                'Tem certeza que deseja remover este item? Essa ação não pode ser desfeita.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Removendo…' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
