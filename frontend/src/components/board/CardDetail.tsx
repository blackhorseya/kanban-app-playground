import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpdateCard, DeleteCard } from "../../../wailsjs/go/adapter/Handler";
import { domain } from "../../../wailsjs/go/models";
import { useBoard } from "@/hooks/useBoard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CalendarIcon, Trash2, X } from "lucide-react";

interface CardDetailProps {
  card: domain.Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "低", className: "text-green-600" },
  { value: "medium", label: "中", className: "text-yellow-600" },
  { value: "high", label: "高", className: "text-red-600" },
];

export function CardDetail({ card, open, onOpenChange }: CardDetailProps) {
  const { activeBoardId, loadBoard } = useBoard();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
    }
  }, [card]);

  const saveField = useCallback(
    async (updates: Record<string, string | undefined>) => {
      if (!card) return;
      const cardUpdate = new domain.CardUpdate(updates);
      await UpdateCard(card.id, cardUpdate);
      if (activeBoardId) await loadBoard(activeBoardId);
    },
    [card, activeBoardId, loadBoard]
  );

  const handleTitleBlur = async () => {
    const trimmed = title.trim();
    if (!trimmed || !card || trimmed === card.title) return;
    await saveField({ title: trimmed });
  };

  const handleDescriptionBlur = async () => {
    if (!card || description === (card.description ?? "")) return;
    await saveField({ description });
  };

  const handlePriorityChange = async (value: string) => {
    await saveField({ priority: value });
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    const dateStr = date.toISOString().split("T")[0];
    await saveField({ due_date: dateStr });
  };

  const handleClearDate = async () => {
    await saveField({ due_date: "" });
  };

  const handleDelete = async () => {
    if (!card) return;
    await DeleteCard(card.id);
    setShowDelete(false);
    onOpenChange(false);
    if (activeBoardId) await loadBoard(activeBoardId);
  };

  if (!card) return null;

  const dueDate = card.due_date ? new Date(card.due_date) : undefined;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">卡片詳細資訊</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
              placeholder="卡片標題..."
            />

            {/* Description */}
            <div>
              <label className="text-xs text-muted-foreground font-medium">描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                className="mt-1 w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                placeholder="新增描述..."
              />
            </div>

            {/* Priority & Due Date Row */}
            <div className="flex gap-4">
              {/* Priority */}
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-medium">優先級</label>
                <Select value={card.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className={opt.className}>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-medium">到期日</label>
                <div className="mt-1 flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate
                          ? dueDate.toLocaleDateString("zh-TW")
                          : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={handleDateSelect}
                      />
                    </PopoverContent>
                  </Popover>
                  {dueDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={handleClearDate}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                刪除卡片
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="刪除卡片"
        description={`確定要刪除「${card.title}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        onConfirm={handleDelete}
      />
    </>
  );
}
