import { create } from "zustand";
import type { Block } from "@/types/block";

interface BlockState {
  blocksByNotebook: Record<string, Block[]>;
  setBlocks: (notebookId: string, blocks: Block[]) => void;
  addBlock: (notebookId: string, block: Block) => void;
  updateBlockContent: (notebookId: string, blockId: string, content: string) => void;
  reorderLocal: (notebookId: string, blockId: string, newIndex: number) => void;
}

export const useBlockStore = create<BlockState>((set) => ({
  blocksByNotebook: {},

  setBlocks: (notebookId, blocks) =>
    set((state) => ({
      blocksByNotebook: { ...state.blocksByNotebook, [notebookId]: blocks },
    })),

  addBlock: (notebookId, block) =>
    set((state) => ({
      blocksByNotebook: {
        ...state.blocksByNotebook,
        [notebookId]: [...(state.blocksByNotebook[notebookId] ?? []), block],
      },
    })),

  updateBlockContent: (notebookId, blockId, content) =>
    set((state) => ({
      blocksByNotebook: {
        ...state.blocksByNotebook,
        [notebookId]: (state.blocksByNotebook[notebookId] ?? []).map((b) =>
          b.id === blockId ? { ...b, content } : b
        ),
      },
    })),

  // Optimistic local reorder — call blocksApi.reorder() separately to persist;
  // this just keeps the UI responsive without waiting on the round trip.
  reorderLocal: (notebookId, blockId, newIndex) =>
    set((state) => {
      const blocks = [...(state.blocksByNotebook[notebookId] ?? [])];
      const fromIndex = blocks.findIndex((b) => b.id === blockId);
      if (fromIndex === -1) return state;

      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(newIndex, 0, moved);
      const reindexed = blocks.map((b, i) => ({ ...b, orderIndex: i }));

      return {
        blocksByNotebook: { ...state.blocksByNotebook, [notebookId]: reindexed },
      };
    }),
}));
