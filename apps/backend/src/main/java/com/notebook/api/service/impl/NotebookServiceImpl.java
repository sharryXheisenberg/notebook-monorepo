package com.notebook.api.service.impl;

import com.notebook.api.dto.mapper.NotebookMapper;
import com.notebook.api.dto.request.CreateNotebookReq;
import com.notebook.api.dto.request.UpdateNotebookReq;
import com.notebook.api.dto.response.NotebookRes;
import com.notebook.api.entity.Notebook;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.exception.UnauthorizedException;
import com.notebook.api.repository.NotebookRepository;
import com.notebook.api.service.NotebookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotebookServiceImpl implements NotebookService {

    private final NotebookRepository notebookRepository;
    private final NotebookMapper notebookMapper;

    @Override
    @Transactional
    public NotebookRes create(UUID userId, CreateNotebookReq req) {
        Notebook notebook = Notebook.builder()
                .userId(userId)
                .title(req.title())
                .parentFolderId(req.parentFolderId())
                .build();
        return notebookMapper.toRes(notebookRepository.save(notebook));
    }

    @Override
    public List<NotebookRes> listForUser(UUID userId) {
        return notebookRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notebookMapper::toRes)
                .toList();
    }

    @Override
    @Transactional
    public NotebookRes update(UUID userId, UUID notebookId, UpdateNotebookReq req) {
        Notebook notebook = findOwned(userId, notebookId);
        notebook.setTitle(req.title());
        notebook.setParentFolderId(req.parentFolderId());
        return notebookMapper.toRes(notebookRepository.save(notebook));
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID notebookId) {
        Notebook notebook = findOwned(userId, notebookId);
        notebookRepository.delete(notebook);
    }

    private Notebook findOwned(UUID userId, UUID notebookId) {
        Notebook notebook = notebookRepository.findById(notebookId)
                .orElseThrow(() -> new ResourceNotFoundException("Notebook not found"));
        if (!notebook.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not own this notebook");
        }
        return notebook;
    }
}
