"use client";

import * as Avatar from "@radix-ui/react-avatar";
import { useState } from "react";
import type { ReviewComment } from "@/types/review";

interface CollaborationPanelProps {
  comments: ReviewComment[];
  collaborators: { id: string; username: string; isOnline: boolean }[];
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/**
 * Right-side panel from the wireframe: online collaborators as stacked avatars, the
 * comment feed, and a Review Mode toggle. Collaborators here reflects whoever has an
 * active session viewing this notebook — real presence requires the v2 realtime service
 * (see TRD v2 on why that's a separate Yjs/y-websocket service, not built into Spring Boot);
 * until then this shows the notebook owner plus anyone who's left a comment, not live presence.
 */
export function CollaborationPanel({ comments, collaborators }: CollaborationPanelProps) {
  const [reviewMode, setReviewMode] = useState(false);

  return (
    <aside className="w-72 shrink-0 border-l border-border-subtle h-[calc(100vh-49px)] overflow-y-auto p-4">
      <h2 className="text-sm font-medium text-ink-primary mb-3">Collaboration & review</h2>

      <div className="flex items-center -space-x-2 mb-4">
        {collaborators.map((person) => (
          <Avatar.Root
            key={person.id}
            className="w-7 h-7 rounded-full bg-surface-raised border-2 border-canvas flex items-center justify-center text-[10px] font-medium text-ink-primary"
            title={person.username}
          >
            <Avatar.Fallback>{initials(person.username)}</Avatar.Fallback>
            {person.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-signal border border-canvas" />
            )}
          </Avatar.Root>
        ))}
      </div>

      <div className="space-y-2 mb-4">
        {comments.length === 0 && (
          <p className="text-xs text-ink-muted">No comments yet — highlight a line in a code block to start one.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="bg-surface rounded-md p-2.5 border border-border-subtle">
            <p className="text-xs text-ink-muted mb-1">Line comment</p>
            <p className="text-sm text-ink-primary">{comment.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <span className="text-sm text-ink-primary">Review mode</span>
        <button
          onClick={() => setReviewMode((v) => !v)}
          role="switch"
          aria-checked={reviewMode}
          className={`w-9 h-5 rounded-full relative transition-colors ${reviewMode ? "bg-signal" : "bg-surface-raised"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-canvas transition-transform ${
              reviewMode ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
