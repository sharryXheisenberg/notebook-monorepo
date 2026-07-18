package com.notebook.api.repository;

import com.notebook.api.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlockRepository extends JpaRepository<Block, UUID> {
    List<Block> findByNotebookIdOrderByOrderIndexAsc(UUID notebookId);

    // Used by BlockService.reorder() to know the current max index before inserting/moving
    long countByNotebookId(UUID notebookId);
}
