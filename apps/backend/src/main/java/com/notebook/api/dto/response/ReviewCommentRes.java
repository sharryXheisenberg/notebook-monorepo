package com.notebook.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ReviewCommentRes(
        UUID id,
        UUID codeReviewId,
        UUID authorId,
        String body,
        Instant createdAt
) {}
