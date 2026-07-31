"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { notebooksApi } from "@/lib/api/notebooks";
import { useNotebookStore } from "@/lib/store/notebookStore";
import type { Notebook } from "@/types/notebook";

interface NotebookTitleProps {
  notebook: Notebook;
}

/**
 * Inline-editable notebook title — bug #2: there was no way to rename a notebook at all,
 * even though PUT /notebooks/{id} already existed on the backend and notebooksApi.update()
 * already existed on the frontend. This just wires an actual UI control to what was already
 * built, rather than adding new API surface.
 */
export function NotebookTitle({ notebook }: NotebookTitleProps) {
  const { upsertNotebook } = useNotebookStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(notebook.title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === notebook.title) {
      setDraft(notebook.title);
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      const updated = await notebooksApi.update(notebook.id, {
        title: trimmed,
        parentFolderId: notebook.parentFolderId,
      });
      upsertNotebook(updated);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setDraft(notebook.title);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          disabled={isSaving}
          className="text-lg font-medium bg-transparent border-b border-signal outline-none text-ink-primary px-0.5"
        />
        <button onClick={handleSave} disabled={isSaving} className="text-signal hover:text-signal/80" aria-label="Save title">
          <Check size={16} />
        </button>
        <button onClick={handleCancel} disabled={isSaving} className="text-ink-muted hover:text-ink-primary" aria-label="Cancel">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-1.5 text-left"
      aria-label="Click to rename notebook"
    >
      <h1 className="text-lg font-medium text-ink-primary">{notebook.title}</h1>
      <Pencil size={13} className="text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
