package com.notebook.api.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * Standard error body shape — matches API.md "Standard Error Shape" and LLD §9.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String error,
        String message,
        Map<String, String> fields,
        Long retryAfterSeconds
) {
    public static ErrorResponse of(String error, String message) {
        return new ErrorResponse(error, message, null, null);
    }

    public static ErrorResponse validation(Map<String, String> fields) {
        return new ErrorResponse("validation_failed", "One or more fields are invalid", fields, null);
    }

    public static ErrorResponse rateLimited(long retryAfterSeconds) {
        return new ErrorResponse("rate_limited", "Too many AI prompt requests", null, retryAfterSeconds);
    }
}
