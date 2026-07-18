package com.notebook.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReorderReq(
        @NotNull @Min(0) Integer newIndex
) {}
