"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignRight, Link2, Code } from "lucide-react";

interface RichTextToolbarProps {
  editor: Editor | null;
}

/**
 * The rich Markdown toolbar from FRD §3.1 (bold, italic, lists, alignment, embed).
 *
 * Two fixes here versus the original version:
 * 1. onMouseDown with preventDefault on every button — without this, clicking a button
 *    blurs the editor and collapses its selection *before* onClick fires, so commands
 *    silently ran against an empty/lost selection and appeared to do nothing.
 * 2. A transaction listener forces a re-render on every selection change, so the
 *    active-state highlighting (e.g. Bold lit up while your cursor sits in bold text)
 *    actually tracks the cursor instead of only updating when content changes.
 */
export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const [, forceRerender] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const rerender = () => forceRerender((n) => n + 1);
    editor.on("transaction", rerender);
    return () => {
      editor.off("transaction", rerender);
    };
  }, [editor]);

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
          type="button"
          onMouseDown={(e) => e.preventDefault()}
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
