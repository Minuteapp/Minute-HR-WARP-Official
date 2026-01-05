import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';

export interface CardPosition {
  cardId: string;
  column: number;
  order: number;
}

export const useTodayDragAndDrop = () => {
  const [cardPositions, setCardPositions] = useState<CardPosition[]>([
    // Linke Spalte (column 0)
    { cardId: 'aiInsights', column: 0, order: 0 },
    { cardId: 'tasks', column: 0, order: 1 },
    { cardId: 'goals', column: 0, order: 2 },
    
    // Mittlere Spalte (column 1)
    { cardId: 'timeTracking', column: 1, order: 0 },
    { cardId: 'notifications', column: 1, order: 1 },
    { cardId: 'training', column: 1, order: 2 },
    { cardId: 'teamStatus', column: 1, order: 3 },
    
    // Rechte Spalte (column 2)
    { cardId: 'calendar', column: 2, order: 0 },
    { cardId: 'projects', column: 2, order: 1 },
    { cardId: 'approvals', column: 2, order: 2 },
    { cardId: 'documents', column: 2, order: 3 },
  ]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = parseInt(source.droppableId.replace('column-', ''));
    const destColumn = parseInt(destination.droppableId.replace('column-', ''));
    
    setCardPositions((prev) => {
      const newPositions = [...prev];
      const movedCard = newPositions.find(
        (pos) => pos.cardId === draggableId.replace('card-', '')
      );

      if (!movedCard) return prev;

      // Aktualisiere die Position der verschobenen Karte
      movedCard.column = destColumn;
      movedCard.order = destination.index;

      // Passe die Order-Werte in der Ziel-Spalte an
      newPositions
        .filter((pos) => pos.column === destColumn && pos.cardId !== movedCard.cardId)
        .forEach((pos) => {
          if (pos.order >= destination.index) {
            pos.order += 1;
          }
        });

      // Passe die Order-Werte in der Quell-Spalte an (falls verschieden)
      if (sourceColumn !== destColumn) {
        newPositions
          .filter((pos) => pos.column === sourceColumn)
          .forEach((pos) => {
            if (pos.order > source.index) {
              pos.order -= 1;
            }
          });
      }

      // Normalisiere die Order-Werte
      [0, 1, 2].forEach((col) => {
        const colCards = newPositions
          .filter((pos) => pos.column === col)
          .sort((a, b) => a.order - b.order);
        colCards.forEach((card, idx) => {
          card.order = idx;
        });
      });

      return newPositions;
    });
  }, []);

  const getCardsForColumn = useCallback(
    (column: number) => {
      return cardPositions
        .filter((pos) => pos.column === column)
        .sort((a, b) => a.order - b.order)
        .map((pos) => pos.cardId);
    },
    [cardPositions]
  );

  return {
    cardPositions,
    handleDragEnd,
    getCardsForColumn,
  };
};
