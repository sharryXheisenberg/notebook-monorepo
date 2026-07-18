package com.notebook.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notebook.api.dto.request.AiPromptReq;
import com.notebook.api.exception.RateLimitExceededException;
import com.notebook.api.security.AuthenticatedUserResolver;
import com.notebook.api.security.JwtAuthenticationFilter;
import com.notebook.api.service.AiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies the controller returns 429 with the documented error shape when the service
 * throws RateLimitExceededException — per API.md's documented 429 response for /ai/prompt.
 */
@WebMvcTest(AiController.class)
class AiControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AiService aiService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private AuthenticatedUserResolver authenticatedUserResolver;

    @Test
    @WithMockUser
    void prompt_returns429_withRetryAfterSeconds_whenRateLimited() throws Exception {
        when(authenticatedUserResolver.resolveUserId(any())).thenReturn(UUID.randomUUID());
        when(aiService.prompt(any(), any())).thenThrow(new RateLimitExceededException(42L));

        AiPromptReq req = new AiPromptReq("Explain this function", UUID.randomUUID());

        mockMvc.perform(post("/api/v1/ai/prompt")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("rate_limited"))
                .andExpect(jsonPath("$.retryAfterSeconds").value(42));
    }

    @Test
    @WithMockUser
    void prompt_returns400_whenPromptIsBlank() throws Exception {
        AiPromptReq req = new AiPromptReq("", UUID.randomUUID());

        mockMvc.perform(post("/api/v1/ai/prompt")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
