package com.notebook.api.dto.response;

import com.notebook.api.util.MasteryLevel;

public record SkillProgressRes(
        String skillName,
        MasteryLevel masteryLevel,
        Integer streakCount
) {}
