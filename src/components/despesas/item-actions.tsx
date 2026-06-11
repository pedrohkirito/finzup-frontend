import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export function ItemActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}
