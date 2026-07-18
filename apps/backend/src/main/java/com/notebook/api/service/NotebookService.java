package com.notebook.api.service;

import com.notebook.api.dto.request.CreateNotebookReq;
import com.notebook.api.dto.request.UpdateNotebookReq;
import com.notebook.api.dto.response.NotebookRes;

import java.util.List;
import java.util.UUID;

public interface NotebookService {
    NotebookRes create(UUID userId, CreateNotebookReq req);
    List<NotebookRes> listForUser(UUID userId);
    NotebookRes update(UUID userId, UUID notebookId, UpdateNotebookReq req);
    void delete(UUID userId, UUID notebookId);
}
