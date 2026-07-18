package com.notebook.api.controller;

import com.notebook.api.dto.request.CreateCommentReq;
import com.notebook.api.dto.request.UpdateStatusReq;
import com.notebook.api.dto.response.ReviewCommentRes;
import com.notebook.api.security.AuthenticatedUserResolver;
import com.notebook.api.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping("/{blockId}/comments")
    public ResponseEntity<List<ReviewCommentRes>> list(@PathVariable UUID blockId) {
        return ResponseEntity.ok(reviewService.listComments(blockId));
    }

    @PostMapping("/{blockId}/comments")
    public ResponseEntity<ReviewCommentRes> addComment(
            Authentication auth, @PathVariable UUID blockId, @Valid @RequestBody CreateCommentReq req) {
        UUID authorId = userResolver.resolveUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.addComment(blockId, authorId, req));
    }

    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<ReviewCommentRes> updateStatus(
            @PathVariable UUID commentId, @Valid @RequestBody UpdateStatusReq req) {
        return ResponseEntity.ok(reviewService.updateAssociatedReviewStatus(commentId, req));
    }
}
