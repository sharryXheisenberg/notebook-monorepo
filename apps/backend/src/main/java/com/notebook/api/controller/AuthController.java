package com.notebook.api.controller;

import com.notebook.api.dto.request.LoginReq;
import com.notebook.api.dto.request.RegisterReq;
import com.notebook.api.dto.response.JwtAuthRes;
import com.notebook.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<JwtAuthRes> register(@Valid @RequestBody RegisterReq req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthRes> login(@Valid @RequestBody LoginReq req) {
        return ResponseEntity.ok(authService.login(req));
    }
}
