"use client";

import { useState } from "react";
import { aiApi } from "@/lib/api/ai";
import { useAiStore } from "@/lib/store/aiStore";
import { ApiError } from "@/types/api-error";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import type { AiPromptBlockContent } from "@/types/block";

interface AiPromptBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function AiPromptBlock({ content, onChange }: AiPromptBlockProps) {
  const parsed: AiPromptBlockContent = safeParse(content);
  const [prompt, setPrompt] = useState(parsed.prompt);
  const [isLoading, setIsLoading] = useState(false);
  const { isRateLimited, retryAfterSeconds, setRateLimited, clearRateLimit } = useAiStore();

  async function handleSubmit() {
    setIsLoading(true);
    try {
      const result = await aiApi.prompt({ prompt, targetBlockId: parsed.targetBlockId ?? null });
      clearRateLimit();
      onChange(
        JSON.stringify({
          prompt,
          targetBlockId: parsed.targetBlockId ?? null,
          response: result.response,
        } satisfies AiPromptBlockContent)
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setRateLimited(err.body.retryAfterSeconds ?? 60);
      }
      // Other error types (network, 401) surface as a generic failure state for now —
      // a toast/notification system is a reasonable v1.5 addition here.
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-annotation/40 bg-annotation/5 p-3 space-y-2">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to explain, refactor, or test this code…"
          disabled={isRateLimited}
        />
        <Button onClick={handleSubmit} disabled={isLoading || isRateLimited || !prompt.trim()}>
          {isLoading ? <Spinner /> : "Ask"}
        </Button>
      </div>

      {isRateLimited && (
        <p className="text-xs text-annotation">
          Too many AI requests — try again in about {retryAfterSeconds}s.
        </p>
      )}

      {parsed.response && (
        <div className="text-sm text-ink-primary border-t border-annotation/20 pt-2 whitespace-pre-wrap">
          {parsed.response}
        </div>
      )}
    </div>
  );
}

function safeParse(content: string): AiPromptBlockContent {
  try {
    return JSON.parse(content);
  } catch {
    return { prompt: "", targetBlockId: null };
  }
}
