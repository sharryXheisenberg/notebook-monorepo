package com.notebook.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "share_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareLink {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "notebook_id", nullable = false)
    private UUID notebookId;

    // Public URL segment: /share/{slug} — see LLD §1 ShareLink
    @Column(nullable = false, unique = true, length = 20)
    private String slug;

    // Null = never expires
    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "view_only", nullable = false)
    @Builder.Default
    private boolean viewOnly = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
