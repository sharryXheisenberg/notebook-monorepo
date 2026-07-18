import { apiRequest } from "./client";
import type { CreateCommentReq, ReviewComment, UpdateStatusReq } from "@/types/review";

export const reviewsApi = {
  listComments: (blockId: string) => apiRequest<ReviewComment[]>(`/reviews/${blockId}/comments`),

  addComment: (blockId: string, req: CreateCommentReq) =>
    apiRequest<ReviewComment>(`/reviews/${blockId}/comments`, { method: "POST", body: req }),

  updateStatus: (commentId: string, req: UpdateStatusReq) =>
    apiRequest<ReviewComment>(`/reviews/comments/${commentId}`, { method: "PATCH", body: req }),
};
