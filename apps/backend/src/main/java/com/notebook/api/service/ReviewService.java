package com.notebook.api.service;

import com.notebook.api.dto.request.CreateCommentReq;
import com.notebook.api.dto.request.UpdateStatusReq;
import com.notebook.api.dto.response.ReviewCommentRes;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewCommentRes addComment(UUID blockId, UUID authorId, CreateCommentReq req);

    /**
     * Path param is a ReviewComment id (per API.md), but the status being updated actually
     * lives on the parent CodeReview (the ghost-code suggestion state machine) — see LLD §1.
     * This looks up the comment, resolves its parent CodeReview, updates that, and returns
     * the unchanged comment for response consistency with the documented API shape.
     */
    ReviewCommentRes updateAssociatedReviewStatus(UUID commentId, UpdateStatusReq req);

    List<ReviewCommentRes> listComments(UUID blockId);
}
