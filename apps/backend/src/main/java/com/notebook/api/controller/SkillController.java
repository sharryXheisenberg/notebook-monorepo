package com.notebook.api.controller;

import com.notebook.api.dto.response.SkillProgressRes;
import com.notebook.api.security.AuthenticatedUserResolver;
import com.notebook.api.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping("/progress")
    public ResponseEntity<List<SkillProgressRes>> progress(Authentication auth) {
        return ResponseEntity.ok(skillService.getProgressForUser(userResolver.resolveUserId(auth)));
    }
}
