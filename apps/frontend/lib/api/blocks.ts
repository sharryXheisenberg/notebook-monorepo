import { apiRequest } from "./client";
import type { Block, CreateBlockReq } from "@/types/block";

export const blocksApi = {
  list: (notebookId: string) => apiRequest<Block[]>(`/notebooks/${notebookId}/blocks`),

  create: (notebookId: string, req: CreateBlockReq) =>
    apiRequest<Block>(`/notebooks/${notebookId}/blocks`, { method: "POST", body: req }),

  reorder: (blockId: string, newIndex: number) =>
    apiRequest<void>(`/blocks/${blockId}/reorder`, { method: "PATCH", body: { newIndex } }),

  updateContent: (blockId: string, content: string) =>
    apiRequest<Block>(`/blocks/${blockId}`, { method: "PATCH", body: { content } }),
};

// Added after the initial scaffold — the backend had no way to persist edits to
// existing block content, only create new blocks. See blocksApi.updateContent usage
// in BlockEditor.tsx for the debounced call site.
