package com.notebook.api.entity;

import com.notebook.api.util.BlockTypeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Block {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "notebook_id", nullable = false)
    private UUID notebookId;

    @Enumerated(EnumType.STRING)
    @Column(name = "block_type", nullable = false, length = 20)
    private BlockTypeEnum blockType;

    // Raw JSON stored as text; shape varies per block_type — see LLD §8 for the schemas.
    // Kept as a String rather than a typed column so new block types don't require a migration.
    @Column(columnDefinition = "JSON", nullable = false)
    private String content;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // Only populated when blockType = CODE
    @Column(length = 30)
    private String language;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
