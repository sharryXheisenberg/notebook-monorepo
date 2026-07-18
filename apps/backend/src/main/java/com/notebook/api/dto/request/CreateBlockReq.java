package com.notebook.api.dto.request;

import com.notebook.api.util.BlockTypeEnum;
import jakarta.validation.constraints.NotNull;

public record CreateBlockReq(
        @NotNull BlockTypeEnum blockType,
        String language,          // required only when blockType = CODE, validated in BlockService
        @NotNull String content   // raw JSON string — shape depends on blockType, see LLD §8
) {}
