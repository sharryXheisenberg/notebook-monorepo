package com.notebook.api.service;

import com.notebook.api.dto.request.AiPromptReq;
import com.notebook.api.dto.response.AiPromptRes;

import java.util.UUID;

public interface AiService {
    /**
     * @throws com.notebook.api.exception.RateLimitExceededException if the user's bucket is empty —
     *         must be checked before any call reaches OpenRouter, per LLD §7.
     */
    AiPromptRes prompt(UUID userId, AiPromptReq req);
}
