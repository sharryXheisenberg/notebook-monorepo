package com.notebook.api.repository;

import com.notebook.api.entity.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShareLinkRepository extends JpaRepository<ShareLink, UUID> {
    Optional<ShareLink> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
