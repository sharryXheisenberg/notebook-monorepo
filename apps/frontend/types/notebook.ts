export interface Notebook {
  id: string;
  title: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotebookReq {
  title: string;
  parentFolderId?: string | null;
}

export interface UpdateNotebookReq {
  title: string;
  parentFolderId?: string | null;
}
