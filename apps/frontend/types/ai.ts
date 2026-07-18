export interface AiPromptReq {
  prompt: string;
  targetBlockId?: string | null;
}

export interface AiPromptRes {
  response: string;
  model: string;
}
