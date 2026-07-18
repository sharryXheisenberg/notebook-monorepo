package com.notebook.api.service;

import com.notebook.api.dto.request.CreateShareReq;
import com.notebook.api.dto.response.PublicNotebookRes;
import com.notebook.api.dto.response.ShareLinkRes;

import java.util.UUID;

public interface ShareService {
    ShareLinkRes createLink(UUID notebookId, CreateShareReq req);

    /**
     * @throws com.notebook.api.exception.ResourceNotFoundException if the slug is invalid or expired
     */
    PublicNotebookRes resolve(String slug);
}
