"use client";

import Editor from "@monaco-editor/react";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { pyodideRunner } from "@/lib/execution/pyodideRunner";
import { aiApi } from "@/lib/api/ai";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { CodeBlockContent } from "@/types/block";

interface CodeBlockProps {
  content: string;
  language: string | null;
  onChange: (content: string) => void;
}

/**
 * MVP scope per TRD v2: only Python actually executes (via Pyodide). Other languages get
 * syntax highlighting + storage, but Execute is disabled — WebContainers-based multi-language
 * execution is a v2 decision pending its own licensing review (see FRD v2 §3.3).
 *
 * The "AI Review" tab calls the real /ai/prompt endpoint with a fixed refactor-review prompt —
 * it's genuinely wired up, not a static mockup of the wireframe's suggestion list.
 */
export function CodeBlock({ content, language, onChange }: CodeBlockProps) {
  const parsed: CodeBlockContent = safeParse(content, language ?? "python");
  const [output, setOutput] = useState(parsed.lastOutput ?? "");
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const canExecute = (language ?? "python") === "python";

  async function handleRun() {
    setIsRunning(true);
    setHasError(false);
    const result = await pyodideRunner.run(parsed.source);
    setIsRunning(false);

    const combined = result.status === "error" ? result.stderr : result.stdout;
    setOutput(combined);
    setHasError(result.status === "error");

    onChange(JSON.stringify({ ...parsed, lastOutput: combined } satisfies CodeBlockContent));
  }

  async function handleAiReview() {
    setIsReviewing(true);
    try {
      const result = await aiApi.prompt({
        prompt: `Review this ${language ?? "python"} code for bugs, missing error handling, and import cleanup. Give 2-3 short bullet suggestions:\n\n${parsed.source}`,
      });
      setAiSuggestions(result.response);
    } catch {
      setAiSuggestions("Couldn't reach the AI reviewer — check your OpenRouter key or rate limit.");
    } finally {
      setIsReviewing(false);
    }
  }

  function handleEditorChange(value: string | undefined) {
    onChange(JSON.stringify({ ...parsed, source: value ?? "" } satisfies CodeBlockContent));
  }

  return (
    <div className="rounded-md border border-border-subtle overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-raised">
        <span className="text-xs font-mono text-ink-muted uppercase">{language ?? "python"}</span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleAiReview} disabled={isReviewing}>
            {isReviewing ? <Spinner /> : "Debug"}
          </Button>
          <Button variant="primary" onClick={handleRun} disabled={!canExecute || isRunning}>
            {isRunning ? <Spinner /> : "Execute"}
          </Button>
        </div>
      </div>

      <Editor
        height="200px"
        language={language ?? "python"}
        value={parsed.source}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "var(--font-jetbrains-mono)" }}
      />

      <Tabs.Root defaultValue="output" className="border-t border-border-subtle">
        <Tabs.List className="flex text-xs">
          <Tabs.Trigger
            value="output"
            className="px-3 py-1.5 text-ink-muted data-[state=active]:text-ink-primary data-[state=active]:border-b-2 data-[state=active]:border-signal"
          >
            Output
          </Tabs.Trigger>
          <Tabs.Trigger
            value="ai-review"
            className="px-3 py-1.5 text-ink-muted data-[state=active]:text-annotation data-[state=active]:border-b-2 data-[state=active]:border-annotation"
          >
            AI review
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="output">
          <div
            className={`px-3 py-2 font-mono text-xs whitespace-pre-wrap min-h-[40px] ${
              hasError ? "text-red-300 bg-red-950/30" : "text-ink-muted bg-canvas"
            }`}
          >
            {output || "Run the code to see output here."}
          </div>
        </Tabs.Content>

        <Tabs.Content value="ai-review">
          <div className="px-3 py-2 text-xs text-annotation whitespace-pre-wrap min-h-[40px] bg-annotation/5">
            {aiSuggestions ?? "Click Debug to get AI suggestions on this code."}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function safeParse(content: string, fallbackLanguage: string): CodeBlockContent {
  try {
    return JSON.parse(content);
  } catch {
    return { language: fallbackLanguage, source: "" };
  }
}
