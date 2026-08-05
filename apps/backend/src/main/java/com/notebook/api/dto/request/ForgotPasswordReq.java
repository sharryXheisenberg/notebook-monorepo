package com.notebook.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordReq(
        @NotBlank @Email String email
) {}
