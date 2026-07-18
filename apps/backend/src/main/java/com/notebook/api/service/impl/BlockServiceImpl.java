package com.notebook.api.service.impl;

import com.notebook.api.dto.mapper.BlockMapper;
import com.notebook.api.dto.request.CreateBlockReq;
import com.notebook.api.dto.request.UpdateBlockContentReq;
import com.notebook.api.dto.response.BlockRes;
import com.notebook.api.entity.Block;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.repository.BlockRepository;
import com.notebook.api.service.BlockService;
import com.notebook.api.util.BlockTypeEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlockServiceImpl implements BlockService {

    private final BlockRepository blockRepository;
    private final BlockMapper blockMapper;

    @Override
    @Transactional
    public BlockRes addBlock(UUID notebookId, CreateBlockReq req) {
        if (req.blockType() == BlockTypeEnum.CODE && req.language() == null) {
            throw new IllegalArgumentException("language is required for CODE blocks");
        }

        long currentCount = blockRepository.countByNotebookId(notebookId);

        Block block = Block.builder()
                .notebookId(notebookId)
                .blockType(req.blockType())
                .language(req.language())
                .content(req.content())
                .orderIndex((int) currentCount) // append at the end
                .build();

        return blockMapper.toRes(blockRepository.save(block));
    }

    @Override
    public List<BlockRes> listForNotebook(UUID notebookId) {
        return blockRepository.findByNotebookIdOrderByOrderIndexAsc(notebookId)
                .stream()
                .map(blockMapper::toRes)
                .toList();
    }

    @Override
    @Transactional
    public BlockRes updateContent(UUID blockId, UpdateBlockContentReq req) {
        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));
        block.setContent(req.content());
        return blockMapper.toRes(blockRepository.save(block));
    }

    @Override
    @Transactional
    public void reorder(UUID blockId, int newIndex) {
        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        // Simple approach for MVP scale: shift every block between the old and new position
        // by one. Fine for a single notebook's block count; revisit if notebooks grow to
        // thousands of blocks and this becomes a hot path worth optimizing.
        List<Block> siblings = blockRepository.findByNotebookIdOrderByOrderIndexAsc(block.getNotebookId());
        int oldIndex = block.getOrderIndex();

        if (newIndex == oldIndex) {
            return;
        }

        for (Block sibling : siblings) {
            if (sibling.getId().equals(blockId)) {
                continue;
            }
            int idx = sibling.getOrderIndex();
            if (oldIndex < newIndex && idx > oldIndex && idx <= newIndex) {
                sibling.setOrderIndex(idx - 1);
                blockRepository.save(sibling);
            } else if (newIndex < oldIndex && idx >= newIndex && idx < oldIndex) {
                sibling.setOrderIndex(idx + 1);
                blockRepository.save(sibling);
            }
        }

        block.setOrderIndex(newIndex);
        blockRepository.save(block);
    }
}
