package com.notebook.api.dto.response;

import com.notebook.api.util.BlockTypeEnum;

import java.util.UUID;

public record BlockRes(
        UUID id,
        BlockTypeEnum blockType,
        String language,
        String content,     // raw JSON string, shape per LLD §8
        Integer orderIndex
) {}
