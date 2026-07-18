"use client";

import { useState } from "react";
import { reviewsApi } from "@/lib/api/reviews";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ReviewComment } from "@/types/review";

interface ThreadedCommentProps {
  blockId: string;
  lineNumber: number;
  comments: ReviewComment[];
  onCommentAdded: (comment: ReviewComment) => void;
}

/**
 * GitHub PR-style threaded discussion on a specific code line, per FRD §3.2's Code Review Mode.
 */
export function ThreadedComment({ blockId, lineNumber, comments, onCommentAdded }: ThreadedCommentProps) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!draft.trim()) return;
    setIsSubmitting(true);
    try {
      const comment = await reviewsApi.addComment(blockId, { lineNumber, body: draft });
      onCommentAdded(comment);
      setDraft("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="ml-4 pl-3 border-l-2 border-border-subtle space-y-2 my-2">
      <div className="text-xs text-ink-muted">Line {lineNumber}</div>

      {comments.map((comment) => (
        <div key={comment.id} className="text-sm text-ink-primary bg-surface rounded p-2">
          {comment.body}
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting || !draft.trim()}>
          Reply
        </Button>
      </div>
    </div>
  );
}
