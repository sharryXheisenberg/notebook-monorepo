package com.notebook.api.entity;

import com.notebook.api.util.ReviewStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "code_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeReview {

    @Id
    @GeneratedValue
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "block_id", nullable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID blockId;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    // Ghost-code suggestion body — hovers over original text in the UI until accepted/rejected
    @Column(name = "suggestion_text", columnDefinition = "TEXT")
    private String suggestionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) {
            this.status = ReviewStatus.PENDING;
        }
    }
}
