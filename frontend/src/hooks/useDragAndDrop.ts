import { useState, useCallback, useRef } from "react";
import {
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { MoveCard } from "../../wailsjs/go/adapter/Handler";
import { domain, application } from "../../wailsjs/go/models";
import { useBoard } from "@/hooks/useBoard";

export function useDragAndDrop() {
  const { activeBoard, setActiveBoard, activeBoardId, loadBoard } = useBoard();
  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null);

  // Track the original column when drag starts — survives onDragOver state changes
  const originColumnIdRef = useRef<string | null>(null);

  const findColumnByCardId = useCallback(
    (cardId: UniqueIdentifier): application.ColumnWithCards | undefined => {
      if (!activeBoard) return undefined;
      return activeBoard.columns.find((col) =>
        col.cards.some((card) => card.id === cardId)
      );
    },
    [activeBoard]
  );

  const isColumnId = useCallback(
    (id: UniqueIdentifier): boolean => {
      if (!activeBoard) return false;
      return activeBoard.columns.some((col) => col.column.id === id);
    },
    [activeBoard]
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveCardId(event.active.id);
      // Capture original column BEFORE any state mutations
      const col = findColumnByCardId(event.active.id);
      originColumnIdRef.current = col?.column.id ?? null;
    },
    [findColumnByCardId]
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!activeBoard) return;
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      const sourceCol = findColumnByCardId(activeId);
      if (!sourceCol) return;

      let targetCol: application.ColumnWithCards | undefined;
      if (isColumnId(overId)) {
        targetCol = activeBoard.columns.find((col) => col.column.id === overId);
      } else {
        targetCol = findColumnByCardId(overId);
      }
      if (!targetCol) return;

      if (sourceCol.column.id === targetCol.column.id) return;

      const cardIndex = sourceCol.cards.findIndex((c) => c.id === activeId);
      if (cardIndex === -1) return;

      const card = sourceCol.cards[cardIndex];
      const newColumns = activeBoard.columns.map((col) => {
        if (col.column.id === sourceCol.column.id) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== activeId),
          };
        }
        if (col.column.id === targetCol!.column.id) {
          const overIndex = isColumnId(overId)
            ? col.cards.length
            : col.cards.findIndex((c) => c.id === overId);
          const insertAt = overIndex === -1 ? col.cards.length : overIndex;
          const newCards = [...col.cards];
          newCards.splice(insertAt, 0, { ...card, column_id: col.column.id } as domain.Card);
          return { ...col, cards: newCards };
        }
        return col;
      });

      setActiveBoard({
        ...activeBoard,
        columns: newColumns,
      } as application.BoardData);
    },
    [activeBoard, findColumnByCardId, isColumnId, setActiveBoard]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const draggedOriginColumnId = originColumnIdRef.current;
      setActiveCardId(null);
      originColumnIdRef.current = null;

      if (!activeBoard) return;

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id;

      // Find where the card is NOW (after onDragOver may have moved it)
      const currentCol = findColumnByCardId(activeId);
      if (!currentCol) return;

      let targetCol: application.ColumnWithCards | undefined;
      if (isColumnId(overId)) {
        targetCol = activeBoard.columns.find((col) => col.column.id === overId);
      } else {
        targetCol = findColumnByCardId(overId);
      }
      if (!targetCol) return;

      // Use the ORIGINAL column to detect cross-column moves,
      // because onDragOver already moved the card in state
      const isCrossColumn = draggedOriginColumnId !== null &&
        draggedOriginColumnId !== targetCol.column.id;

      const targetCards = targetCol.cards;
      let newPosition: number;

      if (!isCrossColumn && currentCol.column.id === targetCol.column.id) {
        // Same column reorder
        const oldIndex = targetCards.findIndex((c) => c.id === activeId);
        const newIndex = isColumnId(overId)
          ? targetCards.length - 1
          : targetCards.findIndex((c) => c.id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        const reordered = arrayMove(targetCards, oldIndex, newIndex);
        newPosition = calculatePosition(reordered, newIndex);

        const newColumns = activeBoard.columns.map((col) => {
          if (col.column.id === targetCol!.column.id) {
            return { ...col, cards: reordered };
          }
          return col;
        });
        setActiveBoard({
          ...activeBoard,
          columns: newColumns,
        } as application.BoardData);
      } else {
        // Cross-column move (state already updated in onDragOver)
        const cardIndex = targetCards.findIndex((c) => c.id === activeId);
        newPosition = calculatePosition(
          targetCards,
          cardIndex >= 0 ? cardIndex : targetCards.length - 1
        );
      }

      // Persist to backend
      try {
        await MoveCard(activeId, targetCol.column.id, newPosition);
      } catch {
        if (activeBoardId) await loadBoard(activeBoardId);
        return;
      }

      if (activeBoardId) await loadBoard(activeBoardId);
    },
    [activeBoard, findColumnByCardId, isColumnId, setActiveBoard, activeBoardId, loadBoard]
  );

  const activeCard = activeCardId
    ? activeBoard?.columns
        .flatMap((col) => col.cards)
        .find((card) => card.id === activeCardId) ?? null
    : null;

  return {
    activeCardId,
    activeCard,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}

function calculatePosition(cards: { position: number }[], index: number): number {
  if (cards.length === 0) return 1000;
  if (index <= 0) return Math.max(0, cards[0].position - 1000);
  if (index >= cards.length - 1) return cards[cards.length - 1].position + 1000;

  const before = cards[index - 1].position;
  const after = cards[index + 1].position;
  return Math.floor((before + after) / 2);
}
