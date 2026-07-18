package com.notebook.api.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Per-user token bucket for the AI Prompt endpoint (TRD §5 / LLD §5).
 *
 * In-memory and keyed by userId — correct for a single Render instance. If this app ever runs
 * on more than one instance, swap the backing map for a Bucket4j Redis/JCache backend, since
 * an in-memory map means each instance would enforce its own separate limit.
 */
@Component
public class AiRateLimiter {

    private final ConcurrentHashMap<UUID, Bucket> buckets = new ConcurrentHashMap<>();
    private final int capacity;
    private final int refillPerMinute;

    public AiRateLimiter(
            @Value("${app.ai.rate-limit.capacity}") int capacity,
            @Value("${app.ai.rate-limit.refill-per-minute}") int refillPerMinute) {
        this.capacity = capacity;
        this.refillPerMinute = refillPerMinute;
    }

    /**
     * @return true if the request is allowed (a token was consumed), false if the user's bucket is empty
     */
    public boolean tryConsume(UUID userId) {
        Bucket bucket = buckets.computeIfAbsent(userId, id -> newBucket());
        return bucket.tryConsume(1);
    }

    /**
     * Best-effort estimate for the Retry-After header / error body when a request is denied.
     */
    public long estimateSecondsUntilRefill(UUID userId) {
        Bucket bucket = buckets.get(userId);
        if (bucket == null) {
            return 0;
        }
        // Bucket4j doesn't expose exact time-to-next-token directly on the simple API;
        // the refill window itself is the safe upper-bound estimate to report to the client.
        return Duration.ofMinutes(1).getSeconds();
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.classic(capacity,
                io.github.bucket4j.Refill.intervally(refillPerMinute, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}
