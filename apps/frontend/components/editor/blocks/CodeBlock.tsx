"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";
import { pyodideRunner } from "@/lib/execution/pyodideRunner";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { CodeBlockContent } from "@/types/block";

interface CodeBlockProps {
  content: string;
  language: string | null;
  onChange: (content: string) => void;
}

const SUPPORTED_LANGUAGES = ["python", "javascript", "java", "cpp"] as const;

/**
 * MVP scope per TRD v2: only Python actually executes (via Pyodide). Other languages get
 * syntax highlighting + storage, but the Run button is disabled — WebContainers-based
 * multi-language execution is a v2 decision pending its own licensing review (see FRD v2 §3.3).
 */
export function CodeBlock({ content, language, onChange }: CodeBlockProps) {
  const parsed: CodeBlockContent = safeParse(content, language ?? "python");
  const [output, setOutput] = useState(parsed.lastOutput ?? "");
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  function handleEditorChange(value: string | undefined) {
    onChange(JSON.stringify({ ...parsed, source: value ?? "" } satisfies CodeBlockContent));
  }

  return (
    <div className="rounded-md border border-border-subtle overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-raised">
        <span className="text-xs font-mono text-ink-muted uppercase">{language ?? "python"}</span>
        <Button variant="secondary" onClick={handleRun} disabled={!canExecute || isRunning}>
          {isRunning ? <Spinner /> : "Execute"}
        </Button>
      </div>

      <Editor
        height="200px"
        language={language ?? "python"}
        value={parsed.source}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "var(--font-jetbrains-mono)" }}
      />

      {output && (
        <div
          className={`px-3 py-2 font-mono text-xs whitespace-pre-wrap border-t border-border-subtle ${
            hasError ? "text-red-300 bg-red-950/30" : "text-ink-muted bg-canvas"
          }`}
        >
          {output}
        </div>
      )}
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
