package com.notebook.api.service;

import com.notebook.api.dto.request.CreateBlockReq;
import com.notebook.api.dto.request.UpdateBlockContentReq;
import com.notebook.api.dto.response.BlockRes;

import java.util.List;
import java.util.UUID;

public interface BlockService {
    BlockRes addBlock(UUID notebookId, CreateBlockReq req);
    List<BlockRes> listForNotebook(UUID notebookId);
    void reorder(UUID blockId, int newIndex);
    BlockRes updateContent(UUID blockId, UpdateBlockContentReq req);
}
