package com.notebook.api.service.impl;

import com.notebook.api.dto.mapper.SkillProgressMapper;
import com.notebook.api.dto.response.SkillProgressRes;
import com.notebook.api.entity.Skill;
import com.notebook.api.entity.UserSkillProgress;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.repository.SkillRepository;
import com.notebook.api.repository.UserSkillProgressRepository;
import com.notebook.api.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final UserSkillProgressRepository userSkillProgressRepository;
    private final SkillRepository skillRepository;
    private final SkillProgressMapper skillProgressMapper;

    @Override
    public List<SkillProgressRes> getProgressForUser(UUID userId) {
        List<UserSkillProgress> progressList = userSkillProgressRepository.findByUserId(userId);

        return progressList.stream()
                .map(progress -> {
                    Skill skill = skillRepository.findById(progress.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
                    return skillProgressMapper.toRes(progress, skill);
                })
                .toList();
    }
}
