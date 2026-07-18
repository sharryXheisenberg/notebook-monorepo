import type { Block } from "./block";

export interface CreateShareReq {
  expiresAt: string | null;
}

export interface ShareLinkRes {
  slug: string;
  url: string;
}

export interface PublicNotebookRes {
  title: string;
  blocks: Block[];
}
