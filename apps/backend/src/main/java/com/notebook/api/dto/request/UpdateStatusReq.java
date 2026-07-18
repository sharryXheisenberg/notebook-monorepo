package com.notebook.api.dto.request;

import com.notebook.api.util.ReviewStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusReq(
        @NotNull ReviewStatus status
) {}
