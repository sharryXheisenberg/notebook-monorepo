"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignRight, Link2, Code } from "lucide-react";

interface RichTextToolbarProps {
  editor: Editor | null;
}

/**
 * The rich Markdown toolbar from FRD §3.1 (bold, italic, lists, alignment, embed) — was
 * previously missing entirely; TextBlock rendered Tiptap with no visible formatting controls,
 * so nothing beyond typing plain text was actually reachable by a user.
 */
export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  if (!editor) return null;

  const buttons = [
    { icon: Bold, label: "Bold", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, label: "Italic", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: List, label: "Bullet list", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { icon: ListOrdered, label: "Numbered list", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { icon: AlignLeft, label: "Align left", action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }) },
    { icon: AlignRight, label: "Align right", action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }) },
    { icon: Code, label: "Inline code", action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code") },
    {
      icon: Link2,
      label: "Embed link",
      action: () => {
        const url = window.prompt("URL");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
      active: editor.isActive("link"),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 mb-2 p-1 rounded-md bg-surface border border-border-subtle w-fit">
      {buttons.map(({ icon: Icon, label, action, active }) => (
        <button
          key={label}
          onClick={action}
          title={label}
          aria-label={label}
          className={`p-1.5 rounded ${active ? "bg-annotation/20 text-annotation" : "text-ink-muted hover:text-ink-primary hover:bg-surface-raised"}`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
