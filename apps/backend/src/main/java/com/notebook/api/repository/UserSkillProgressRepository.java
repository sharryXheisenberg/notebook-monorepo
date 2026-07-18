package com.notebook.api.repository;

import com.notebook.api.entity.UserSkillProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSkillProgressRepository extends JpaRepository<UserSkillProgress, UUID> {
    List<UserSkillProgress> findByUserId(UUID userId);
    Optional<UserSkillProgress> findByUserIdAndSkillId(UUID userId, UUID skillId);
}
