import { useState, useCallback } from 'react';

export interface DragItem {
  id: string;
  type: string;
  data: any;
}

export interface DropZone {
  id: string;
  type: string;
  accepts: string[];
  data?: any;
}

export interface DragEvent {
  dragItem: DragItem;
  dropZone: DropZone;
}

export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const startDrag = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);

  const endDrag = useCallback(() => {
    setDraggedItem(null);
    setDraggedOver(null);
  }, []);

  const enterDropZone = useCallback((dropZoneId: string) => {
    setDraggedOver(dropZoneId);
  }, []);

  const leaveDropZone = useCallback(() => {
    setDraggedOver(null);
  }, []);

  const canDrop = useCallback((dropZone: DropZone): boolean => {
    if (!draggedItem) return false;
    return dropZone.accepts.includes(draggedItem.type);
  }, [draggedItem]);

  const isDragging = useCallback((itemId: string): boolean => {
    return draggedItem?.id === itemId;
  }, [draggedItem]);

  const isDropZoneActive = useCallback((dropZoneId: string): boolean => {
    return draggedOver === dropZoneId;
  }, [draggedOver]);

  return {
    draggedItem,
    startDrag,
    endDrag,
    enterDropZone,
    leaveDropZone,
    canDrop,
    isDragging,
    isDropZoneActive
  };
};