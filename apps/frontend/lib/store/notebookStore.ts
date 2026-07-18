import { create } from "zustand";
import type { Notebook } from "@/types/notebook";

interface NotebookState {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  setNotebooks: (notebooks: Notebook[]) => void;
  upsertNotebook: (notebook: Notebook) => void;
  removeNotebook: (id: string) => void;
  setActiveNotebook: (id: string | null) => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  notebooks: [],
  activeNotebookId: null,

  setNotebooks: (notebooks) => set({ notebooks }),

  upsertNotebook: (notebook) =>
    set((state) => {
      const exists = state.notebooks.some((n) => n.id === notebook.id);
      return {
        notebooks: exists
          ? state.notebooks.map((n) => (n.id === notebook.id ? notebook : n))
          : [notebook, ...state.notebooks],
      };
    }),

  removeNotebook: (id) =>
    set((state) => ({ notebooks: state.notebooks.filter((n) => n.id !== id) })),

  setActiveNotebook: (id) => set({ activeNotebookId: id }),
}));
