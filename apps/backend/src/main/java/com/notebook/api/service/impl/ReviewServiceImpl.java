package com.notebook.api.service.impl;

import com.notebook.api.dto.mapper.ReviewCommentMapper;
import com.notebook.api.dto.request.CreateCommentReq;
import com.notebook.api.dto.request.UpdateStatusReq;
import com.notebook.api.dto.response.ReviewCommentRes;
import com.notebook.api.entity.CodeReview;
import com.notebook.api.entity.ReviewComment;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.repository.CodeReviewRepository;
import com.notebook.api.repository.ReviewCommentRepository;
import com.notebook.api.service.ReviewService;
import com.notebook.api.util.ReviewStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final CodeReviewRepository codeReviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final ReviewCommentMapper reviewCommentMapper;

    @Override
    @Transactional
    public ReviewCommentRes addComment(UUID blockId, UUID authorId, CreateCommentReq req) {
        // Find-or-create the CodeReview thread for this exact block+line, so repeated
        // comments on the same line attach to one thread instead of creating duplicates.
        CodeReview codeReview = codeReviewRepository.findByBlockIdAndLineNumber(blockId, req.lineNumber())
                .orElseGet(() -> codeReviewRepository.save(
                        CodeReview.builder()
                                .blockId(blockId)
                                .lineNumber(req.lineNumber())
                                .status(ReviewStatus.PENDING)
                                .build()
                ));

        ReviewComment comment = ReviewComment.builder()
                .codeReviewId(codeReview.getId())
                .authorId(authorId)
                .body(req.body())
                .build();

        return reviewCommentMapper.toRes(reviewCommentRepository.save(comment));
    }

    @Override
    @Transactional
    public ReviewCommentRes updateAssociatedReviewStatus(UUID commentId, UpdateStatusReq req) {
        ReviewComment comment = reviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        CodeReview codeReview = codeReviewRepository.findById(comment.getCodeReviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent review not found"));

        codeReview.setStatus(req.status());
        codeReviewRepository.save(codeReview);

        return reviewCommentMapper.toRes(comment);
    }

    @Override
    public List<ReviewCommentRes> listComments(UUID blockId) {
        return codeReviewRepository.findByBlockId(blockId).stream()
                .flatMap(review -> reviewCommentRepository
                        .findByCodeReviewIdOrderByCreatedAtAsc(review.getId())
                        .stream())
                .map(reviewCommentMapper::toRes)
                .toList();
    }
}
