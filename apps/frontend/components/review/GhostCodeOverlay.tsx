"use client";

import { reviewsApi } from "@/lib/api/reviews";
import type { ReviewComment, ReviewStatus } from "@/types/review";

interface GhostCodeOverlayProps {
  commentId: string;
  suggestionText: string;
  status: ReviewStatus;
  onStatusChange: (comment: ReviewComment) => void;
}

/**
 * The "hover transparently until accepted" ghost-code UI from FRD §4.1. Kept as a thin
 * wrapper around ReviewBlock's rendering — this component owns the accept/reject API calls,
 * ReviewBlock (components/editor/blocks/ReviewBlock.tsx) owns the visual presentation,
 * since the same suggestion needs to render both inline (in the code block) and here
 * (in a dedicated review panel) without duplicating the API logic in both places.
 */
export function GhostCodeOverlay({ commentId, suggestionText, status, onStatusChange }: GhostCodeOverlayProps) {
  async function respond(newStatus: ReviewStatus) {
    const updated = await reviewsApi.updateStatus(commentId, { status: newStatus });
    onStatusChange(updated);
  }

  if (status !== "PENDING") {
    return null; // resolved suggestions collapse once acted on, per the ghost-code UX intent
  }

  return (
    <div className="absolute inset-x-0 -top-1 opacity-70 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto">
      <pre className="text-xs font-mono bg-annotation/20 text-annotation border border-annotation/40 rounded px-2 py-1">
        {suggestionText}
      </pre>
      <div className="flex gap-2 mt-1">
        <button onClick={() => respond("ACCEPTED")} className="text-xs text-signal underline">
          Accept
        </button>
        <button onClick={() => respond("REJECTED")} className="text-xs text-ink-muted underline">
          Dismiss
        </button>
      </div>
    </div>
  );
}
