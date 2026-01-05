import React from 'react';
import { cn } from '@/lib/utils';
import { DragItem, DropZone as DropZoneType, useDragAndDrop } from '@/hooks/useDragAndDrop';

interface DragAndDropContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DragAndDropContainer: React.FC<DragAndDropContainerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("relative min-h-screen", className)}>
      {children}
    </div>
  );
};

interface DraggableItemProps {
  item: DragItem;
  children: React.ReactNode;
  className?: string;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: () => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  children,
  className,
  onDragStart,
  onDragEnd
}) => {
  const { startDrag, endDrag, isDragging } = useDragAndDrop();

  return (
    <div
      draggable
      className={cn(
        "cursor-move transition-all duration-200",
        isDragging(item.id) && "opacity-50 scale-95",
        className
      )}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
        startDrag(item);
        onDragStart?.(item);
      }}
      onDragEnd={() => {
        endDrag();
        onDragEnd?.();
      }}
    >
      {children}
    </div>
  );
};

interface DropZoneContainerProps {
  zone: DropZoneType;
  children: React.ReactNode;
  className?: string;
  onDrop?: (dragItem: DragItem, dropZone: DropZoneType) => void;
  onDragOver?: (dropZone: DropZoneType) => void;
  onDragLeave?: () => void;
}

export const DropZoneContainer: React.FC<DropZoneContainerProps> = ({
  zone,
  children,
  className,
  onDrop,
  onDragOver,
  onDragLeave
}) => {
  const { canDrop, isDropZoneActive, enterDropZone, leaveDropZone } = useDragAndDrop();

  return (
    <div
      className={cn(
        "transition-all duration-200",
        canDrop(zone) && "ring-2 ring-primary/50",
        isDropZoneActive(zone.id) && "bg-primary/5",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (canDrop(zone)) {
          e.dataTransfer.dropEffect = 'move';
          enterDropZone(zone.id);
          onDragOver?.(zone);
        }
      }}
      onDragLeave={() => {
        leaveDropZone();
        onDragLeave?.();
      }}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (canDrop(zone)) {
            onDrop?.(dragData, zone);
          }
        } catch (error) {
          console.error('Error parsing drag data:', error);
        }
        leaveDropZone();
      }}
    >
      {children}
    </div>
  );
};