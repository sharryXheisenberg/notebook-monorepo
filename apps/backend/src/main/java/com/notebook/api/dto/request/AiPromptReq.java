package com.notebook.api.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record AiPromptReq(
        @NotBlank String prompt,
        UUID targetBlockId
) {}
