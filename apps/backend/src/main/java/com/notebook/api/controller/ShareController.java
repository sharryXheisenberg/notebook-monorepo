package com.notebook.api.controller;

import com.notebook.api.dto.request.CreateShareReq;
import com.notebook.api.dto.response.PublicNotebookRes;
import com.notebook.api.dto.response.ShareLinkRes;
import com.notebook.api.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    // Requires auth (not under /share/**, so SecurityConfig's permitAll doesn't apply here)
    @PostMapping("/api/v1/notebooks/{notebookId}/share")
    public ResponseEntity<ShareLinkRes> createLink(
            @PathVariable UUID notebookId, @RequestBody(required = false) CreateShareReq req) {
        CreateShareReq body = req != null ? req : new CreateShareReq(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(shareService.createLink(notebookId, body));
    }

    // Public per SecurityConfig's permitAll on /api/v1/share/** — no auth required
    @GetMapping("/api/v1/share/{slug}")
    public ResponseEntity<PublicNotebookRes> resolve(@PathVariable String slug) {
        return ResponseEntity.ok(shareService.resolve(slug));
    }
}
