package com.notebook.api.dto.response;

import java.util.List;

/**
 * Read-only payload returned by GET /share/{slug} — intentionally excludes userId,
 * timestamps, and anything else that identifies the owner. See HLD §6.6.
 */
public record PublicNotebookRes(
        String title,
        List<BlockRes> blocks
) {}
