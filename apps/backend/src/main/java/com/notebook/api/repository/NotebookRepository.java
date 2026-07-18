package com.notebook.api.repository;

import com.notebook.api.entity.Notebook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotebookRepository extends JpaRepository<Notebook, UUID> {
    List<Notebook> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
