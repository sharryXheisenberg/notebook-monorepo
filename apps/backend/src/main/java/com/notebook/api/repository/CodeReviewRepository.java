package com.notebook.api.repository;

import com.notebook.api.entity.CodeReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CodeReviewRepository extends JpaRepository<CodeReview, UUID> {
    List<CodeReview> findByBlockId(UUID blockId);
    Optional<CodeReview> findByBlockIdAndLineNumber(UUID blockId, Integer lineNumber);
}
