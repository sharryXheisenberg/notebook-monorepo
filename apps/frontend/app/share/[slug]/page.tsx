"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { shareApi } from "@/lib/api/share";
import { Spinner } from "@/components/ui/Spinner";
import type { PublicNotebookRes } from "@/types/share";

/**
 * Public read-only view — no auth, no nav bar, no edit controls. Per HLD §6.6, this
 * calls GET /share/{slug} with auth: false, matching the backend's permitAll() rule.
 */
export default function PublicSharePage() {
  const { slug } = useParams<{ slug: string }>();
  const [notebook, setNotebook] = useState<PublicNotebookRes | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    shareApi
      .resolve(slug)
      .then(setNotebook)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">This share link doesn't exist or has expired.</p>
      </main>
    );
  }

  if (!notebook) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 text-xs text-ink-muted uppercase tracking-wide">Read-only view</div>
      <h1 className="text-xl font-semibold mb-6">{notebook.title}</h1>

      <div className="space-y-4">
        {notebook.blocks.map((block) => (
          <div key={block.id} className="rounded-md border border-border-subtle p-3">
            {block.blockType === "CODE" ? (
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {JSON.parse(block.content).source}
              </pre>
            ) : (
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: JSON.parse(block.content).markdown ?? "" }}
              />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
