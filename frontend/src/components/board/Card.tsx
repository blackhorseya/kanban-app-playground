import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { domain } from "../../../wailsjs/go/models";
import { GripVertical, CalendarClock } from "lucide-react";

interface CardProps {
  card: domain.Card;
  onClick?: () => void;
  isDragOverlay?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-rose-400",
};

function getDueDateInfo(dueDateStr?: string): { label: string; isNearDue: boolean; isOverdue: boolean } | null {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const label = due.toLocaleDateString("zh-TW", { month: "short", day: "numeric" });

  if (diffDays < 0) return { label, isNearDue: false, isOverdue: true };
  if (diffDays <= 3) return { label, isNearDue: true, isOverdue: false };
  return { label, isNearDue: false, isOverdue: false };
}

export function Card({ card, onClick, isDragOverlay }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColor = PRIORITY_COLORS[card.priority] ?? PRIORITY_COLORS.medium;
  const dueDateInfo = getDueDateInfo(card.due_date);

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      {...(!isDragOverlay ? { ...attributes, ...listeners } : {})}
      className={`bg-card rounded-lg border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-grab active:cursor-grabbing
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-primary/25 hover:-translate-y-px
        active:translate-y-0 active:shadow-sm
        transition-all duration-200 group/card flex items-start gap-0 overflow-hidden ${
        isDragOverlay ? "shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-primary/15 rotate-[2deg]" : ""
      }`}
      onClick={onClick}
    >
      {/* Priority color bar */}
      <div className={`w-1 self-stretch shrink-0 rounded-l-lg ${priorityColor}`} />

      <div className="flex items-start gap-2 flex-1 py-2.5 pl-2.5 pr-3">
        <span
          className="mt-0.5 text-muted-foreground/40 opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] leading-snug text-foreground/90" title={card.title}>
            {card.title}
          </p>

          {/* Due date badge */}
          {dueDateInfo && (
            <span
              className={`inline-flex items-center gap-1 mt-1.5 text-[11px] rounded-md px-1.5 py-0.5 font-medium ${
                dueDateInfo.isOverdue
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                  : dueDateInfo.isNearDue
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <CalendarClock className="h-3 w-3" />
              {dueDateInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
