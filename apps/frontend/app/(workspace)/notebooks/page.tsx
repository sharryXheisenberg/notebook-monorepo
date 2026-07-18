"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notebooksApi } from "@/lib/api/notebooks";
import { useNotebookStore } from "@/lib/store/notebookStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

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

  useEffect(() => {
    notebooksApi.list().then((data) => {
      setNotebooks(data);
      setIsLoading(false);
    });
  }, [setNotebooks]);

  async function handleCreate() {
    setIsCreating(true);
    const notebook = await notebooksApi.create({ title: "Untitled notebook" });
    upsertNotebook(notebook);
    setIsCreating(false);
    router.push(`/notebooks/${notebook.id}`);
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
              className="cursor-pointer hover:border-signal transition-colors"
              onClick={() => router.push(`/notebooks/${notebook.id}`)}
            >
              <h2 className="font-medium">{notebook.title}</h2>
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
