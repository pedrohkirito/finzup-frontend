'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DragHandle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        'flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-800 dark:hover:text-slate-300',
        className,
      )}
      aria-label="Arrastar para reordenar"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (props: { dragHandle: ReactNode }) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : undefined,
  };

  const dragHandle = (
    <span {...attributes} {...listeners}>
      <DragHandle />
    </span>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'relative z-10 opacity-60')}
    >
      {children({ dragHandle })}
    </div>
  );
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
  sortable = true,
}: {
  items: T[];
  onReorder: (items: T[]) => void | Promise<void>;
  children: (item: T, dragHandle: ReactNode) => ReactNode;
  sortable?: boolean;
}) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  if (!sortable) {
    if (items.length === 0) return null;
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id}>{children(item, null)}</div>
        ))}
      </div>
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localItems.findIndex((item) => item.id === active.id);
    const newIndex = localItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(reordered);
    void onReorder(reordered);
  };

  if (localItems.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {localItems.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {({ dragHandle }) => children(item, dragHandle)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
