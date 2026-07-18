export type ReviewStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ReviewComment {
  id: string;
  codeReviewId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface CreateCommentReq {
  lineNumber: number;
  body: string;
}

export interface UpdateStatusReq {
  status: ReviewStatus;
}
