import { useState } from "react";
import { useBoard } from "@/hooks/useBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Plus, Pencil, Trash2, LayoutDashboard, Check, X } from "lucide-react";

export function Sidebar() {
  const { boards, activeBoardId, loadBoard, createBoard, updateBoard, deleteBoard } = useBoard();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleCreate = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    await createBoard(trimmed);
    setNewTitle("");
    setIsAdding(false);
  };

  const handleUpdate = async (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    await updateBoard(id, trimmed);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBoard(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="px-4 py-3 border-b border-border/60">
        <h2 className="font-bold text-[11px] text-muted-foreground uppercase tracking-[0.15em]">
          看板列表
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {boards.map((board) => (
          <div key={board.id} className="group relative">
            {editingId === board.id ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(board.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleUpdate(board.id)}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => loadBoard(board.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeBoardId === board.id
                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="h-3 w-3 text-primary" />
                </div>
                <span className="truncate flex-1 text-left">{board.title}</span>
                <span className="hidden group-hover:flex items-center gap-0.5">
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(board.id);
                      setEditTitle(board.title);
                    }}
                    className="p-0.5 rounded hover:bg-background"
                  >
                    <Pencil className="h-3 w-3" />
                  </span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ id: board.id, title: board.title });
                    }}
                    className="p-0.5 rounded hover:bg-background text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </span>
                </span>
              </button>
            )}
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-border/60">
        {isAdding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewTitle("");
                }
              }}
              placeholder="看板名稱..."
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCreate}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => {
                setIsAdding(false);
                setNewTitle("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-muted-foreground"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
            新增看板
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="刪除看板"
        description={`確定要刪除「${deleteTarget?.title}」嗎？所有欄位和卡片也會一併刪除，此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
      />
    </>
  );
}
