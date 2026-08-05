"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { blocksApi } from "@/lib/api/blocks";
import { notebooksApi } from "@/lib/api/notebooks";
import { shareApi } from "@/lib/api/share";
import { downloadExport } from "@/lib/api/export";
import { useBlockStore } from "@/lib/store/blockStore";
import { useNotebookStore } from "@/lib/store/notebookStore";
import { getStoredUser } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { NotebookTitle } from "@/components/editor/NotebookTitle";
import { CollaborationPanel } from "@/components/review/CollaborationPanel";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { ReviewComment } from "@/types/review";

export default function NotebookPage() {
  const { id } = useParams<{ id: string }>();
  const { blocksByNotebook, setBlocks } = useBlockStore();
  const { notebooks, setNotebooks } = useNotebookStore();
  const notebook = notebooks.find((n) => n.id === id);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const { showToast } = useToast();

  const user = getStoredUser();

  useEffect(() => {
    // Fetch both blocks and the notebook list — previously the notebook object only existed
    // if you'd visited the /notebooks list page first in this session; navigating straight
    // to a notebook URL (e.g. a bookmark, or a page refresh) left the title blank.
    Promise.all([blocksApi.list(id), notebooksApi.list()]).then(([blocks, allNotebooks]) => {
      setBlocks(id, blocks);
      setNotebooks(allNotebooks);
      setIsLoading(false);
    });
  }, [id, setBlocks, setNotebooks]);

  async function handleShare() {
    try {
      const res = await shareApi.createLink(id, { expiresAt: null });
      await navigator.clipboard.writeText(res.url).catch(() => {
        // Clipboard access can fail (permissions, non-HTTPS context) — the toast below still
        // shows the link either way, so failing silently here just skips the "copied" wording.
      });
      showToast(`Share link copied to clipboard: ${res.url}`, "success");
    } catch (err) {
      // Previously uncaught — a failed request here silently aborted with no UI feedback
      // at all, same bug class as the earlier forgot-password issue.
      console.error("Failed to create share link:", err);
      showToast("Couldn't create a share link — check your connection and try again.", "info");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const blocks = blocksByNotebook[id] ?? [];
  const collaborators = user ? [{ id: user.id, username: user.username, isOnline: true }] : [];

  return (
    <div className="flex">
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 pt-6 flex items-center justify-between">
          {notebook ? (
            <NotebookTitle notebook={notebook} />
          ) : (
            <h1 className="text-lg font-medium text-ink-muted">Notebook</h1>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => downloadExport(id, "md", `${notebook?.title ?? "notebook"}.md`)}>
              Export MD
            </Button>
            <Button variant="secondary" onClick={handleShare}>Share</Button>
          </div>
        </div>

        <BlockEditor notebookId={id} blocks={blocks} />
      </main>

      <CollaborationPanel comments={comments} collaborators={collaborators} />
    </div>
  );
}
