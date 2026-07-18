package com.notebook.api.controller;

import com.notebook.api.dto.request.AiPromptReq;
import com.notebook.api.dto.response.AiPromptRes;
import com.notebook.api.security.AuthenticatedUserResolver;
import com.notebook.api.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final AuthenticatedUserResolver userResolver;

    @PostMapping("/prompt")
    public ResponseEntity<AiPromptRes> prompt(Authentication auth, @Valid @RequestBody AiPromptReq req) {
        // RateLimitExceededException (429) is thrown inside the service and handled by
        // GlobalExceptionHandler — nothing to catch here.
        return ResponseEntity.ok(aiService.prompt(userResolver.resolveUserId(auth), req));
    }
}
