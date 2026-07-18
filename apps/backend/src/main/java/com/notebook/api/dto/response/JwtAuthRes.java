package com.notebook.api.dto.response;

import java.util.UUID;

public record JwtAuthRes(
        String token,
        UserSummaryRes user
) {
    public record UserSummaryRes(UUID id, String username) {}
}
