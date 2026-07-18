package com.notebook.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record NotebookRes(
        UUID id,
        String title,
        UUID parentFolderId,
        Instant createdAt,
        Instant updatedAt
) {}
