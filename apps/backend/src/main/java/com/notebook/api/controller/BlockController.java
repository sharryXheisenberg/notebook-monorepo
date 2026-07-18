package com.notebook.api.controller;

import com.notebook.api.dto.request.CreateBlockReq;
import com.notebook.api.dto.request.ReorderReq;
import com.notebook.api.dto.request.UpdateBlockContentReq;
import com.notebook.api.dto.response.BlockRes;
import com.notebook.api.service.BlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// TODO (before this leaves MVP): these endpoints don't currently verify that the
// authenticated user owns notebookId — any logged-in user can read/write blocks on any
// notebook if they know its UUID. Add an ownership check here (mirroring
// NotebookServiceImpl.findOwned) before this handles anything beyond your own local testing.
@RestController
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @GetMapping("/api/v1/notebooks/{notebookId}/blocks")
    public ResponseEntity<List<BlockRes>> list(@PathVariable UUID notebookId) {
        return ResponseEntity.ok(blockService.listForNotebook(notebookId));
    }

    @PostMapping("/api/v1/notebooks/{notebookId}/blocks")
    public ResponseEntity<BlockRes> create(
            @PathVariable UUID notebookId, @Valid @RequestBody CreateBlockReq req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blockService.addBlock(notebookId, req));
    }

    @PatchMapping("/api/v1/blocks/{blockId}/reorder")
    public ResponseEntity<Void> reorder(@PathVariable UUID blockId, @Valid @RequestBody ReorderReq req) {
        blockService.reorder(blockId, req.newIndex());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/v1/blocks/{blockId}")
    public ResponseEntity<BlockRes> updateContent(
            @PathVariable UUID blockId, @Valid @RequestBody UpdateBlockContentReq req) {
        return ResponseEntity.ok(blockService.updateContent(blockId, req));
    }
}
