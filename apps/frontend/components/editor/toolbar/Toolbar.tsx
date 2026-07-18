"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ToolbarProps {
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * Per-block hover toolbar — drag handle (for reordering, per FRD §3.1) and delete.
 * Deliberately minimal for MVP; duplicate/comment-on-block actions are natural v1.5 additions
 * once the block model has settled from real usage.
 */
export function Toolbar({ onDelete, dragHandleProps }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <div
        {...dragHandleProps}
        className="cursor-grab text-ink-muted hover:text-ink-primary p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </div>
      <Button variant="ghost" onClick={onDelete} aria-label="Delete block">
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
