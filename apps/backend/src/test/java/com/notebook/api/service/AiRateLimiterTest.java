package com.notebook.api.service;

import com.notebook.api.ratelimit.AiRateLimiter;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AiRateLimiterTest {

    @Test
    void sixthRequestWithinWindow_isDenied_whenCapacityIsFive() {
        AiRateLimiter limiter = new AiRateLimiter(5, 5);
        UUID userId = UUID.randomUUID();

        for (int i = 0; i < 5; i++) {
            assertThat(limiter.tryConsume(userId)).as("request #%d should be allowed", i + 1).isTrue();
        }

        assertThat(limiter.tryConsume(userId)).as("6th request should be denied").isFalse();
    }

    @Test
    void differentUsers_haveIndependentBuckets() {
        AiRateLimiter limiter = new AiRateLimiter(1, 1);
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();

        assertThat(limiter.tryConsume(userA)).isTrue();
        assertThat(limiter.tryConsume(userA)).isFalse(); // userA's single token is used

        // userB should be unaffected by userA exhausting their bucket
        assertThat(limiter.tryConsume(userB)).isTrue();
    }
}
