package com.notebook.api.controller;

import com.notebook.api.dto.request.CreateNotebookReq;
import com.notebook.api.dto.request.UpdateNotebookReq;
import com.notebook.api.dto.response.NotebookRes;
import com.notebook.api.security.AuthenticatedUserResolver;
import com.notebook.api.service.NotebookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notebooks")
@RequiredArgsConstructor
public class NotebookController {

    private final NotebookService notebookService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public ResponseEntity<List<NotebookRes>> list(Authentication auth) {
        return ResponseEntity.ok(notebookService.listForUser(userResolver.resolveUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<NotebookRes> create(Authentication auth, @Valid @RequestBody CreateNotebookReq req) {
        NotebookRes created = notebookService.create(userResolver.resolveUserId(auth), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotebookRes> update(
            Authentication auth, @PathVariable UUID id, @Valid @RequestBody UpdateNotebookReq req) {
        return ResponseEntity.ok(notebookService.update(userResolver.resolveUserId(auth), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable UUID id) {
        notebookService.delete(userResolver.resolveUserId(auth), id);
        return ResponseEntity.noContent().build();
    }
}
