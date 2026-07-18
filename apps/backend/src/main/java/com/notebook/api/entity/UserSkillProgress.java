package com.notebook.api.entity;

import com.notebook.api.util.MasteryLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_skill_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "skill_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkillProgress {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "skill_id", nullable = false)
    private UUID skillId;

    @Enumerated(EnumType.STRING)
    @Column(name = "mastery_level", nullable = false, length = 20)
    private MasteryLevel masteryLevel;

    @Column(name = "streak_count", nullable = false)
    @Builder.Default
    private Integer streakCount = 0;

    @Column(name = "last_practiced_at")
    private Instant lastPracticedAt;
}
