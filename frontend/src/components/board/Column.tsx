import { useState, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import { UpdateColumn, DeleteColumn } from "../../../wailsjs/go/adapter/Handler";
import { useBoard } from "@/hooks/useBoard";

interface ColumnProps {
  id: string;
  title: string;
  cardIds: string[];
  cardCount: number;
  isLast: boolean;
  children: ReactNode;
}

export function Column({ id, title, cardIds, cardCount, isLast, children }: ColumnProps) {
  const { activeBoardId, loadBoard } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id });

  const handleRename = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === title) {
      setIsEditing(false);
      setEditTitle(title);
      return;
    }
    await UpdateColumn(id, trimmed);
    setIsEditing(false);
    if (activeBoardId) await loadBoard(activeBoardId);
  };

  const handleDelete = async () => {
    await DeleteColumn(id, "");
    setShowDelete(false);
    if (activeBoardId) await loadBoard(activeBoardId);
  };

  return (
    <>
      <div
        className={`w-72 shrink-0 bg-[var(--color-column-bg)] rounded-xl flex flex-col max-h-full border border-border/40 transition-all ${
          isOver ? "ring-2 ring-primary/30 bg-primary/5 border-primary/20" : ""
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditTitle(title);
                  }
                }}
                className="h-7 text-sm font-medium"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleRename}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { setIsEditing(false); setEditTitle(title); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-[13px] flex-1 px-1 truncate text-foreground/80">
                {title}
                <span className="ml-2 text-[11px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-medium align-middle">
                  {cardCount}
                </span>
              </h3>
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover/col:opacity-100 transition-opacity"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-8 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[120px]">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                        onClick={() => {
                          setIsEditing(true);
                          setEditTitle(title);
                          setShowMenu(false);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        重新命名
                      </button>
                      {!isLast && (
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-accent"
                          onClick={() => {
                            setShowDelete(true);
                            setShowMenu(false);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          刪除欄位
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Cards Container with SortableContext */}
        <div ref={setNodeRef} className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-2 min-h-[60px]">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {children}
          </SortableContext>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="刪除欄位"
        description={`確定要刪除「${title}」嗎？欄位中的 ${cardCount} 張卡片也會一併刪除。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
      />
    </>
  );
}
