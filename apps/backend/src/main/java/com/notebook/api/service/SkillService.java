package com.notebook.api.service;

import com.notebook.api.dto.response.SkillProgressRes;

import java.util.List;
import java.util.UUID;

public interface SkillService {
    List<SkillProgressRes> getProgressForUser(UUID userId);
}
