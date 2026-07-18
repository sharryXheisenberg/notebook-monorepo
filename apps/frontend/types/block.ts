// Mirrors com.notebook.api.util.BlockTypeEnum on the backend — keep in sync manually
// until types/ is generated from the OpenAPI spec (see TRD v2 note on this tradeoff).
export type BlockType = "TEXT" | "CODE" | "AI_PROMPT" | "REVIEW" | "DIAGRAM";

export interface Block {
  id: string;
  blockType: BlockType;
  language: string | null;
  content: string; // raw JSON string — parse per blockType, see docs/LLD.md §8
  orderIndex: number;
}

export interface TextBlockContent {
  markdown: string;
}

export interface CodeBlockContent {
  language: string;
  source: string;
  lastOutput?: string;
}

export interface AiPromptBlockContent {
  prompt: string;
  targetBlockId: string | null;
  response?: string;
}

export interface CreateBlockReq {
  blockType: BlockType;
  language?: string | null;
  content: string;
}
