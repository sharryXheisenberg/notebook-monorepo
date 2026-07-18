import { apiRequest } from "./client";
import type { CreateShareReq, PublicNotebookRes, ShareLinkRes } from "@/types/share";

export const shareApi = {
  createLink: (notebookId: string, req: CreateShareReq) =>
    apiRequest<ShareLinkRes>(`/notebooks/${notebookId}/share`, { method: "POST", body: req }),

  // Public — no auth token attached, matches the backend's permitAll() on /share/**
  resolve: (slug: string) =>
    apiRequest<PublicNotebookRes>(`/share/${slug}`, { auth: false }),
};
