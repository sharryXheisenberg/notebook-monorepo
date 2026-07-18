package com.notebook.api.dto.request;

import java.time.Instant;

public record CreateShareReq(
        Instant expiresAt   // null = never expires
) {}
