package com.notebook.api.service;

import com.notebook.api.dto.mapper.BlockMapper;
import com.notebook.api.entity.Block;
import com.notebook.api.repository.BlockRepository;
import com.notebook.api.service.impl.BlockServiceImpl;
import com.notebook.api.util.BlockTypeEnum;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BlockServiceImplTest {

    @Mock private BlockRepository blockRepository;
    @Mock private BlockMapper blockMapper;

    @InjectMocks
    private BlockServiceImpl blockService;

    @Test
    void reorder_movingForward_shiftsOnlyBlocksInBetween_noDuplicateIndices() {
        UUID notebookId = UUID.randomUUID();
        UUID movingBlockId = UUID.randomUUID();

        Block moving = Block.builder().id(movingBlockId).notebookId(notebookId)
                .blockType(BlockTypeEnum.TEXT).content("{}").orderIndex(0).build();
        Block b1 = Block.builder().id(UUID.randomUUID()).notebookId(notebookId)
                .blockType(BlockTypeEnum.TEXT).content("{}").orderIndex(1).build();
        Block b2 = Block.builder().id(UUID.randomUUID()).notebookId(notebookId)
                .blockType(BlockTypeEnum.TEXT).content("{}").orderIndex(2).build();

        List<Block> siblings = new ArrayList<>(List.of(moving, b1, b2));

        when(blockRepository.findById(movingBlockId)).thenReturn(java.util.Optional.of(moving));
        when(blockRepository.findByNotebookIdOrderByOrderIndexAsc(notebookId)).thenReturn(siblings);
        when(blockRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        blockService.reorder(movingBlockId, 2); // move "moving" from index 0 to index 2

        assertThat(moving.getOrderIndex()).isEqualTo(2);
        assertThat(b1.getOrderIndex()).isEqualTo(0); // shifted back by one
        assertThat(b2.getOrderIndex()).isEqualTo(1); // shifted back by one

        // No two blocks should end up with the same index after the move
        List<Integer> indices = siblings.stream().map(Block::getOrderIndex).sorted().toList();
        assertThat(indices).containsExactly(0, 1, 2);
    }
}
