package com.notebook.api.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateBlockContentReq(
        @NotNull String content
) {}
