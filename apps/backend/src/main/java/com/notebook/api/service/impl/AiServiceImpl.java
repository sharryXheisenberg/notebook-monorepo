package com.notebook.api.service.impl;

import com.notebook.api.dto.request.AiPromptReq;
import com.notebook.api.dto.response.AiPromptRes;
import com.notebook.api.exception.RateLimitExceededException;
import com.notebook.api.ratelimit.AiRateLimiter;
import com.notebook.api.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private static final String DEFAULT_MODEL = "meta-llama/llama-3-8b-instruct:free";

    private final AiRateLimiter aiRateLimiter;
    private final RestTemplate restTemplate;

    @Value("${app.ai.openrouter-api-key}")
    private String openRouterApiKey;

    @Value("${app.ai.openrouter-base-url}")
    private String openRouterBaseUrl;

    @Override
    public AiPromptRes prompt(UUID userId, AiPromptReq req) {
        // Rate limit check MUST happen before any call reaches OpenRouter (LLD §7) —
        // both for cost control on OpenRouter's side and so a denied request stays fast.
        if (!aiRateLimiter.tryConsume(userId)) {
            throw new RateLimitExceededException(aiRateLimiter.estimateSecondsUntilRefill(userId));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openRouterApiKey);

        Map<String, Object> body = Map.of(
                "model", DEFAULT_MODEL,
                "messages", List.of(Map.of("role", "user", "content", req.prompt()))
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(
                openRouterBaseUrl + "/chat/completions", entity, Map.class);

        String content = extractContent(response);
        return new AiPromptRes(content, DEFAULT_MODEL);
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> response) {
        if (response == null) {
            return "";
        }
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            return "";
        }
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return message != null ? (String) message.get("content") : "";
    }
}
