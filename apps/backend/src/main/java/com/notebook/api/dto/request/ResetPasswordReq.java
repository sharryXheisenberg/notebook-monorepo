package com.notebook.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordReq(
        @NotBlank String token,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String newPassword
) {}
