package com.notebook.api.repository;

import com.notebook.api.entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewCommentRepository extends JpaRepository<ReviewComment, UUID> {
    List<ReviewComment> findByCodeReviewIdOrderByCreatedAtAsc(UUID codeReviewId);
}
