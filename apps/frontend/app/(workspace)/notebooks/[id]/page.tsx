"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { blocksApi } from "@/lib/api/blocks";
import { shareApi } from "@/lib/api/share";
import { downloadExport } from "@/lib/api/export";
import { useBlockStore } from "@/lib/store/blockStore";
import { useNotebookStore } from "@/lib/store/notebookStore";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function NotebookPage() {
  const { id } = useParams<{ id: string }>();
  const { blocksByNotebook, setBlocks } = useBlockStore();
  const notebook = useNotebookStore((s) => s.notebooks.find((n) => n.id === id));
  const [isLoading, setIsLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    blocksApi.list(id).then((blocks) => {
      setBlocks(id, blocks);
      setIsLoading(false);
    });
  }, [id, setBlocks]);

  async function handleShare() {
    const res = await shareApi.createLink(id, { expiresAt: null });
    setShareUrl(res.url);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const blocks = blocksByNotebook[id] ?? [];

  return (
    <main>
      <div className="max-w-3xl mx-auto px-4 pt-6 flex items-center justify-between">
        <h1 className="text-lg font-medium">{notebook?.title ?? "Notebook"}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => downloadExport(id, "md", `${notebook?.title}.md`)}>
            Export MD
          </Button>
          <Button variant="secondary" onClick={handleShare}>Share</Button>
        </div>
      </div>

      {shareUrl && (
        <p className="max-w-3xl mx-auto px-4 text-xs text-signal mt-2">
          Share link created: <a href={shareUrl} className="underline">{shareUrl}</a>
        </p>
      )}

      <BlockEditor notebookId={id} blocks={blocks} />
    </main>
  );
}
