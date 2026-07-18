"use client";

import { useEffect, useRef } from "react";
import type { BlockType } from "@/types/block";
import { Code2, FileText, Sparkles } from "lucide-react";

interface SlashMenuOption {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
}

const OPTIONS: SlashMenuOption[] = [
  { type: "TEXT", label: "Text", icon: <FileText size={16} /> },
  { type: "CODE", label: "Code", icon: <Code2 size={16} /> },
  { type: "AI_PROMPT", label: "AI Prompt", icon: <Sparkles size={16} /> },
];

interface SlashMenuProps {
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

/**
 * Triggered by typing "/" at the start of an empty TEXT block — matches FRD §3.1's
 * slash-command requirement. Positioned absolutely at the caret location the caller computes.
 */
export function SlashMenu({ position, onSelect, onClose }: SlashMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ top: position.top, left: position.left }}
      className="absolute z-50 w-48 rounded-md border border-border-subtle bg-surface-raised shadow-lg py-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.type}
          onClick={() => onSelect(option.type)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-primary hover:bg-canvas text-left"
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
