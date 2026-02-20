import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X } from "lucide-react";
import { CreateColumn } from "../../../wailsjs/go/adapter/Handler";
import { useBoard } from "@/hooks/useBoard";

export function AddColumn() {
  const { activeBoardId, loadBoard } = useBoard();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = async () => {
    const trimmed = title.trim();
    if (!trimmed || !activeBoardId) return;
    await CreateColumn(activeBoardId, trimmed);
    setTitle("");
    setIsAdding(false);
    await loadBoard(activeBoardId);
  };

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        className="w-72 shrink-0 h-10 justify-start gap-2 text-muted-foreground/60 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/30 hover:text-primary/60 hover:bg-primary/5 transition-all"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4" />
        新增欄位
      </Button>
    );
  }

  return (
    <div className="w-72 shrink-0 bg-[var(--color-column-bg)] rounded-xl border border-border/40 p-3 space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") {
            setIsAdding(false);
            setTitle("");
          }
        }}
        placeholder="欄位名稱..."
        className="h-8 text-sm"
        autoFocus
      />
      <div className="flex gap-1">
        <Button size="sm" className="h-7 text-xs" onClick={handleAdd}>
          <Check className="h-3.5 w-3.5 mr-1" />
          新增
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
