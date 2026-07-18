package com.notebook.api.dto.mapper;

import com.notebook.api.dto.response.SkillProgressRes;
import com.notebook.api.entity.Skill;
import com.notebook.api.entity.UserSkillProgress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SkillProgressMapper {

    @Mapping(target = "skillName", source = "skill.name")
    @Mapping(target = "masteryLevel", source = "progress.masteryLevel")
    @Mapping(target = "streakCount", source = "progress.streakCount")
    SkillProgressRes toRes(UserSkillProgress progress, Skill skill);
}
