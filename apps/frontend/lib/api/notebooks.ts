import { apiRequest } from "./client";
import type { CreateNotebookReq, Notebook, UpdateNotebookReq } from "@/types/notebook";

export const notebooksApi = {
  list: () => apiRequest<Notebook[]>("/notebooks"),

  create: (req: CreateNotebookReq) =>
    apiRequest<Notebook>("/notebooks", { method: "POST", body: req }),

  update: (id: string, req: UpdateNotebookReq) =>
    apiRequest<Notebook>(`/notebooks/${id}`, { method: "PUT", body: req }),

  remove: (id: string) => apiRequest<void>(`/notebooks/${id}`, { method: "DELETE" }),
};
