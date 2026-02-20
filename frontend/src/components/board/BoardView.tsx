import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { LayoutDashboard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoard } from "@/hooks/useBoard";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { Column } from "@/components/board/Column";
import { Card } from "@/components/board/Card";
import { AddCard } from "@/components/board/AddCard";
import { AddColumn } from "@/components/board/AddColumn";
import { CardDetail } from "@/components/board/CardDetail";
import { SearchBar } from "@/components/common/SearchBar";
import { domain } from "../../../wailsjs/go/models";

export function BoardView() {
  const { activeBoard } = useBoard();
  const { activeCard, onDragStart, onDragOver, onDragEnd } = useDragAndDrop();
  const [selectedCard, setSelectedCard] = useState<domain.Card | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Client-side card filtering
  const matchingCardIds = useMemo(() => {
    if (!activeBoard || (!searchQuery && priorityFilter === "all")) return null;
    const query = searchQuery.toLowerCase();
    const ids = new Set<string>();
    for (const col of activeBoard.columns) {
      for (const card of col.cards) {
        const matchesSearch =
          !query ||
          card.title.toLowerCase().includes(query) ||
          (card.description ?? "").toLowerCase().includes(query);
        const matchesPriority =
          priorityFilter === "all" || card.priority === priorityFilter;
        if (matchesSearch && matchesPriority) {
          ids.add(card.id);
        }
      }
    }
    return ids;
  }, [activeBoard, searchQuery, priorityFilter]);

  const isFiltering = matchingCardIds !== null;

  if (!activeBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-5">
        <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center">
          <LayoutDashboard className="h-10 w-10 text-primary/30" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-lg font-semibold text-foreground/60">選擇一個看板開始</p>
          <p className="text-sm text-muted-foreground">從左側欄選擇看板，或建立一個新的看板</p>
        </div>
      </div>
    );
  }

  const columnCount = activeBoard.columns.length;

  const currentSelectedCard = selectedCard
    ? activeBoard.columns
        .flatMap((col) => col.cards)
        .find((c) => c.id === selectedCard.id) ?? null
    : null;

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-6 py-3.5 border-b border-border/50 bg-card/60 backdrop-blur-sm flex items-center gap-4">
        <h1 className="text-lg font-bold text-foreground/90">{activeBoard.board.title}</h1>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="w-48">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-28 h-8 text-sm rounded-lg">
              <SelectValue placeholder="篩選優先級" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="high"><span className="text-rose-500 font-medium">高優先</span></SelectItem>
              <SelectItem value="medium"><span className="text-amber-500 font-medium">中優先</span></SelectItem>
              <SelectItem value="low"><span className="text-emerald-500 font-medium">低優先</span></SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 h-full items-start">
            {activeBoard.columns.map((colData) => {
              const visibleCardIds = isFiltering
                ? colData.cards.filter((c) => matchingCardIds.has(c.id)).map((c) => c.id)
                : colData.cards.map((c) => c.id);

              return (
                <div key={colData.column.id} className="group/col">
                  <Column
                    id={colData.column.id}
                    title={colData.column.title}
                    cardIds={visibleCardIds}
                    cardCount={colData.cards.length}
                    isLast={columnCount <= 1}
                  >
                    {colData.cards.map((card) => {
                      const dimmed = isFiltering && !matchingCardIds.has(card.id);
                      return (
                        <div
                          key={card.id}
                          className={dimmed ? "opacity-20 pointer-events-none" : ""}
                        >
                          <Card
                            card={card}
                            onClick={() => setSelectedCard(card)}
                          />
                        </div>
                      );
                    })}
                    <AddCard columnId={colData.column.id} />
                  </Column>
                </div>
              );
            })}
            <AddColumn />
          </div>

          <DragOverlay>
            {activeCard ? <Card card={activeCard} isDragOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CardDetail
        card={currentSelectedCard}
        open={currentSelectedCard !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCard(null);
        }}
      />
    </div>
  );
}
