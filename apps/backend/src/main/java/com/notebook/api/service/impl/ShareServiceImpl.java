package com.notebook.api.service.impl;

import com.notebook.api.dto.mapper.BlockMapper;
import com.notebook.api.dto.request.CreateShareReq;
import com.notebook.api.dto.response.PublicNotebookRes;
import com.notebook.api.dto.response.ShareLinkRes;
import com.notebook.api.entity.Notebook;
import com.notebook.api.entity.ShareLink;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.repository.BlockRepository;
import com.notebook.api.repository.NotebookRepository;
import com.notebook.api.repository.ShareLinkRepository;
import com.notebook.api.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareServiceImpl implements ShareService {

    private static final String SLUG_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int SLUG_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ShareLinkRepository shareLinkRepository;
    private final NotebookRepository notebookRepository;
    private final BlockRepository blockRepository;
    private final BlockMapper blockMapper;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public ShareLinkRes createLink(UUID notebookId, CreateShareReq req) {
        notebookRepository.findById(notebookId)
                .orElseThrow(() -> new ResourceNotFoundException("Notebook not found"));

        String slug = generateUniqueSlug();

        ShareLink link = ShareLink.builder()
                .notebookId(notebookId)
                .slug(slug)
                .expiresAt(req.expiresAt())
                .viewOnly(true)
                .build();
        shareLinkRepository.save(link);

        return new ShareLinkRes(slug, frontendBaseUrl + "/share/" + slug);
    }

    @Override
    public PublicNotebookRes resolve(String slug) {
        ShareLink link = shareLinkRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Share link not found"));

        if (link.isExpired()) {
            // Deliberately the same exception/message as "not found" — an expired link
            // shouldn't be distinguishable from a nonexistent one to an anonymous viewer.
            throw new ResourceNotFoundException("Share link not found");
        }

        Notebook notebook = notebookRepository.findById(link.getNotebookId())
                .orElseThrow(() -> new ResourceNotFoundException("Notebook not found"));

        var blocks = blockRepository.findByNotebookIdOrderByOrderIndexAsc(notebook.getId())
                .stream()
                .map(blockMapper::toRes)
                .toList();

        return new PublicNotebookRes(notebook.getTitle(), blocks);
    }

    private String generateUniqueSlug() {
        String slug;
        do {
            StringBuilder sb = new StringBuilder(SLUG_LENGTH);
            for (int i = 0; i < SLUG_LENGTH; i++) {
                sb.append(SLUG_CHARS.charAt(RANDOM.nextInt(SLUG_CHARS.length())));
            }
            slug = sb.toString();
        } while (shareLinkRepository.existsBySlug(slug));
        return slug;
    }
}
