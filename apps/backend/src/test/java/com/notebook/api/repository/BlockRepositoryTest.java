package com.notebook.api.repository;

import com.notebook.api.entity.Block;
import com.notebook.api.util.BlockTypeEnum;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BlockRepositoryTest {

    @Autowired
    private BlockRepository blockRepository;

    @Test
    void findByNotebookIdOrderByOrderIndexAsc_returnsInCorrectOrder() {
        UUID notebookId = UUID.randomUUID();

        blockRepository.save(Block.builder().notebookId(notebookId).blockType(BlockTypeEnum.TEXT)
                .content("{}").orderIndex(2).build());
        blockRepository.save(Block.builder().notebookId(notebookId).blockType(BlockTypeEnum.TEXT)
                .content("{}").orderIndex(0).build());
        blockRepository.save(Block.builder().notebookId(notebookId).blockType(BlockTypeEnum.CODE)
                .content("{}").orderIndex(1).language("python").build());

        List<Block> blocks = blockRepository.findByNotebookIdOrderByOrderIndexAsc(notebookId);

        assertThat(blocks).extracting(Block::getOrderIndex).containsExactly(0, 1, 2);
    }

    @Test
    void countByNotebookId_reflectsOnlyThatNotebooksBlocks() {
        UUID notebookId = UUID.randomUUID();
        blockRepository.save(Block.builder().notebookId(notebookId).blockType(BlockTypeEnum.TEXT)
                .content("{}").orderIndex(0).build());
        blockRepository.save(Block.builder().notebookId(UUID.randomUUID()).blockType(BlockTypeEnum.TEXT)
                .content("{}").orderIndex(0).build());

        assertThat(blockRepository.countByNotebookId(notebookId)).isEqualTo(1);
    }
}
