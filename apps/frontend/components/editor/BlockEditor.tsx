"use client";

import { useMemo, useState } from "react";
import { useBlockStore } from "@/lib/store/blockStore";
import { blocksApi } from "@/lib/api/blocks";
import { debounce } from "@/lib/debounce";
import { TextBlock } from "./blocks/TextBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { AiPromptBlock } from "./blocks/AiPromptBlock";
import { Toolbar } from "./toolbar/Toolbar";
import { SlashMenu } from "./slash-menu/SlashMenu";
import type { Block, BlockType } from "@/types/block";

interface BlockEditorProps {
  notebookId: string;
  blocks: Block[];
}

const DEFAULT_CONTENT: Record<BlockType, string> = {
  TEXT: JSON.stringify({ markdown: "" }),
  CODE: JSON.stringify({ language: "python", source: "" }),
  AI_PROMPT: JSON.stringify({ prompt: "", targetBlockId: null }),
  REVIEW: JSON.stringify({}),
  DIAGRAM: JSON.stringify({}),
};

/**
 * Renders the notebook's block array as a vertical stack of independent block components —
 * see TextBlock.tsx for why this is a block array, not one shared ProseMirror document.
 */
export function BlockEditor({ notebookId, blocks }: BlockEditorProps) {
  const { updateBlockContent, addBlock } = useBlockStore();
  const [slashMenuFor, setSlashMenuFor] = useState<string | null>(null);

  async function handleInsertBlock(afterBlockType: BlockType) {
    const newBlock = await blocksApi.create(notebookId, {
      blockType: afterBlockType,
      language: afterBlockType === "CODE" ? "python" : undefined,
      content: DEFAULT_CONTENT[afterBlockType],
    });
    addBlock(notebookId, newBlock);
    setSlashMenuFor(null);
  }

  function handleContentChange(blockId: string, content: string) {
    // Update local state immediately so typing feels instant...
    updateBlockContent(notebookId, blockId, content);
    // ...then persist to the backend after a pause in typing, not on every keystroke.
    debouncedSave(blockId, content);
  }

  const debouncedSave = useMemo(
    () =>
      debounce((blockId: string, content: string) => {
        blocksApi.updateContent(blockId, content).catch(() => {
          // Silent failure for now — a "saving…/saved" indicator in the toolbar is the
          // natural next addition here so a lost connection isn't invisible to the user.
        });
      }, 800),
    []
  );

  return (
    <div className="space-y-3 max-w-3xl mx-auto py-8">
      {blocks.map((block) => (
        <div key={block.id} className="group relative flex gap-2">
          <Toolbar onDelete={() => {/* wire to a delete endpoint when added */}} />

          <div className="flex-1">
            {block.blockType === "TEXT" && (
              <TextBlock
                content={block.content}
                onChange={(content) => handleContentChange(block.id, content)}
              />
            )}
            {block.blockType === "CODE" && (
              <CodeBlock
                content={block.content}
                language={block.language}
                onChange={(content) => handleContentChange(block.id, content)}
              />
            )}
            {block.blockType === "AI_PROMPT" && (
              <AiPromptBlock
                content={block.content}
                onChange={(content) => handleContentChange(block.id, content)}
              />
            )}
          </div>
        </div>
      ))}

      <button
        onClick={() => setSlashMenuFor("new")}
        className="text-ink-muted text-sm hover:text-ink-primary relative"
      >
        + Type / for a new block
        {slashMenuFor === "new" && (
          <SlashMenu
            position={{ top: 24, left: 0 }}
            onSelect={handleInsertBlock}
            onClose={() => setSlashMenuFor(null)}
          />
        )}
      </button>
    </div>
  );
}
