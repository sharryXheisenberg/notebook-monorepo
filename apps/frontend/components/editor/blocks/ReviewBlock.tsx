"use client";

// Renders the "ghost code" suggestion overlay for a single CodeReview thread — the
// actual threaded-comment list lives in components/review/ThreadedComment.tsx, kept
// separate since a code block can have many review threads (one per flagged line),
// each rendering this same overlay.

import { ReviewStatus } from "@/types/review";
import { Button } from "@/components/ui/Button";

interface ReviewBlockProps {
  lineNumber: number;
  suggestionText: string;
  status: ReviewStatus;
  onAccept: () => void;
  onReject: () => void;
}

export function ReviewBlock({ lineNumber, suggestionText, status, onAccept, onReject }: ReviewBlockProps) {
  return (
    <div className="ml-4 pl-3 border-l-2 border-annotation/50 my-1">
      <div className="text-xs text-ink-muted mb-1">Line {lineNumber} · ghost suggestion</div>
      <pre className="text-xs font-mono text-annotation bg-annotation/10 rounded p-2 whitespace-pre-wrap">
        {suggestionText}
      </pre>

      {status === "PENDING" && (
        <div className="flex gap-2 mt-1">
          <Button variant="secondary" onClick={onAccept} className="text-xs py-1">
            Accept
          </Button>
          <Button variant="ghost" onClick={onReject} className="text-xs py-1">
            Reject
          </Button>
        </div>
      )}

      {status !== "PENDING" && (
        <span className={`text-xs ${status === "ACCEPTED" ? "text-signal" : "text-ink-muted"}`}>
          {status === "ACCEPTED" ? "Accepted" : "Rejected"}
        </span>
      )}
    </div>
  );
}
