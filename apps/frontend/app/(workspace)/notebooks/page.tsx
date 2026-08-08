"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notebooksApi } from "@/lib/api/notebooks";
import { useNotebookStore } from "@/lib/store/notebookStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Pencil, Check, X } from "lucide-react";
import type { Notebook } from "@/types/notebook";

/**
 * Not explicitly in the TRD v2 tree (which only listed notebooks/[id]/page.tsx), but
 * required as the landing point after login/middleware redirect — the list view a user
 * sees before picking a notebook to open.
 */
export default function NotebooksListPage() {
  const router = useRouter();
  const { notebooks, setNotebooks, upsertNotebook } = useNotebookStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    notebooksApi.list().then((data) => {
      setNotebooks(data);
      setIsLoading(false);
    }).catch((err) => {
      // 403 almost always means the JWT cookie is expired or was issued before a
      // password reset — redirect to login so the user gets a fresh token.
      setIsLoading(false);
      if (err?.status === 403 || err?.status === 401) {
        router.push("/login");
      }
    });
  }, [setNotebooks, router]);

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  async function handleCreate() {
    setIsCreating(true);
    const notebook = await notebooksApi.create({ title: "Untitled notebook" });
    upsertNotebook(notebook);
    setIsCreating(false);
    router.push(`/notebooks/${notebook.id}`);
  }

  function startEditing(e: React.MouseEvent, notebook: Notebook) {
    e.stopPropagation(); // don't trigger the card's navigate-on-click
    setEditingId(notebook.id);
    setDraft(notebook.title);
  }

  async function saveRename(e: React.MouseEvent | React.KeyboardEvent, notebook: Notebook) {
    e.stopPropagation();
    const trimmed = draft.trim();
    if (trimmed && trimmed !== notebook.title) {
      const updated = await notebooksApi.update(notebook.id, {
        title: trimmed,
        parentFolderId: notebook.parentFolderId,
      });
      upsertNotebook(updated);
    }
    setEditingId(null);
  }

  function cancelRename(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Your notebooks</h1>
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? "Creating…" : "+ New notebook"}
        </Button>
      </div>

      {notebooks.length === 0 ? (
        <p className="text-ink-muted">No notebooks yet — create your first one above.</p>
      ) : (
        <div className="grid gap-3">
          {notebooks.map((notebook) => (
            <Card
              key={notebook.id}
              className="group cursor-pointer hover:border-signal transition-colors"
              onClick={() => editingId !== notebook.id && router.push(`/notebooks/${notebook.id}`)}
            >
              {editingId === notebook.id ? (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(e, notebook);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="font-medium bg-transparent border-b border-signal outline-none text-ink-primary px-0.5 flex-1"
                  />
                  <button onClick={(e) => saveRename(e, notebook)} className="text-signal hover:text-signal/80" aria-label="Save">
                    <Check size={15} />
                  </button>
                  <button onClick={cancelRename} className="text-ink-muted hover:text-ink-primary" aria-label="Cancel">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h2 className="font-medium">{notebook.title}</h2>
                  <button
                    onClick={(e) => startEditing(e, notebook)}
                    className="text-ink-muted opacity-0 group-hover:opacity-100 hover:text-ink-primary transition-opacity"
                    aria-label="Rename notebook"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}
              <p className="text-xs text-ink-muted mt-1">
                Updated {new Date(notebook.updatedAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}