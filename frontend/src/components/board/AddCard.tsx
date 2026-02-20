import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X } from "lucide-react";
import { CreateCard } from "../../../wailsjs/go/adapter/Handler";
import { useBoard } from "@/hooks/useBoard";

interface AddCardProps {
  columnId: string;
}

export function AddCard({ columnId }: AddCardProps) {
  const { activeBoardId, loadBoard } = useBoard();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await CreateCard(columnId, trimmed);
    setTitle("");
    setIsAdding(false);
    if (activeBoardId) await loadBoard(activeBoardId);
  };

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-1 text-xs text-muted-foreground h-7"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        新增卡片
      </Button>
    );
  }

  return (
    <div className="space-y-1.5">
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
        placeholder="卡片標題..."
        className="h-8 text-sm"
        autoFocus
      />
      <div className="flex gap-1">
        <Button size="sm" className="h-6 text-xs px-2" onClick={handleAdd}>
          <Check className="h-3 w-3 mr-1" />
          新增
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs px-2"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
