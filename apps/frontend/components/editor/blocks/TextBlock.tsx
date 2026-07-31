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
  autoFocus?: boolean;
}

/**
 * Rich text block using Tiptap, per TRD v2's frontend stack. Each TEXT block gets its own
 * Tiptap editor instance rather than one shared document across the whole notebook — this
 * matches the backend's data model (Block is the unit of storage, not a single ProseMirror
 * doc spanning the notebook), which is what makes reordering/inserting blocks a simple
 * array operation instead of ProseMirror transaction surgery.
 *
 * Styling note: this used to rely on Tailwind Typography's "prose prose-invert" classes,
 * but that plugin was never actually installed in tailwind.config.ts — so those classes were
 * no-ops, leaving the editor with no explicit text color at all against the dark background.
 * Fixed by styling .ProseMirror directly in globals.css instead of depending on a plugin
 * that isn't there.
 */
export function TextBlock({ content, onChange, autoFocus = false }: TextBlockProps) {
  const parsed: TextBlockContent = safeParse(content);

  const editor = useEditor({
    immediatelyRender: false, // required in Next.js App Router — otherwise Tiptap renders
                               // during SSR and mismatches the client render on hydration
    autofocus: autoFocus ? "start" : false,
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
      <div className="notebook-editor-content">
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
