package com.notebook.api.exception;

/**
 * Thrown by AiRateLimiter when a user has exhausted their per-minute AI prompt bucket.
 * Not in the original tree explicitly, but required by LLD §9's 429 error case for /ai/prompt.
 */
public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(long retryAfterSeconds) {
        super("AI prompt rate limit exceeded");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
