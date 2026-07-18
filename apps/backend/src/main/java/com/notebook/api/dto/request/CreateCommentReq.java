package com.notebook.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCommentReq(
        @NotNull @Min(1) Integer lineNumber,
        @NotBlank String body
) {}
