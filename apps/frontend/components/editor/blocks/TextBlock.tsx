"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { RichTextToolbar } from "@/components/editor/toolbar/RichTextToolbar";
import type { TextBlockContent } from "@/types/block";

interface TextBlockProps {
  content: string; // raw JSON string, parsed to TextBlockContent
  onChange: (content: string) => void;
}

/**
 * Rich text block using Tiptap, per TRD v2's frontend stack. Each TEXT block gets its own
 * Tiptap editor instance rather than one shared document across the whole notebook — this
 * matches the backend's data model (Block is the unit of storage, not a single ProseMirror
 * doc spanning the notebook), which is what makes reordering/inserting blocks a simple
 * array operation instead of ProseMirror transaction surgery.
 */
export function TextBlock({ content, onChange }: TextBlockProps) {
  const parsed: TextBlockContent = safeParse(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write notes, or type / for commands…" }),
    ],
    content: parsed.markdown,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify({ markdown: editor.getHTML() } satisfies TextBlockContent));
    },
  });

  // Keep editor content in sync if the block's content changes from outside
  // (e.g. loaded from the server after the editor instance was created)
  useEffect(() => {
    if (editor && parsed.markdown !== editor.getHTML()) {
      editor.commands.setContent(parsed.markdown, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return (
    <div>
      <RichTextToolbar editor={editor} />
      <div className="prose prose-invert prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function safeParse(content: string): TextBlockContent {
  try {
    return JSON.parse(content);
  } catch {
    return { markdown: "" };
  }
}
