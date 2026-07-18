package com.notebook.api.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record UpdateNotebookReq(
        @NotBlank String title,
        UUID parentFolderId
) {}
