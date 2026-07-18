package com.notebook.api.service.impl;

import com.notebook.api.dto.request.LoginReq;
import com.notebook.api.dto.request.RegisterReq;
import com.notebook.api.dto.response.JwtAuthRes;
import com.notebook.api.entity.User;
import com.notebook.api.exception.DuplicateResourceException;
import com.notebook.api.exception.UnauthorizedException;
import com.notebook.api.repository.UserRepository;
import com.notebook.api.security.JwtTokenProvider;
import com.notebook.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public JwtAuthRes register(RegisterReq req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (userRepository.existsByUsername(req.username())) {
            throw new DuplicateResourceException("Username already taken");
        }

        User user = User.builder()
                .username(req.username())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .build();
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new JwtAuthRes(token, new JwtAuthRes.UserSummaryRes(user.getId(), user.getUsername()));
    }

    @Override
    public JwtAuthRes login(LoginReq req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            // Deliberately identical message to the "user not found" case above —
            // don't reveal which part (email vs password) was wrong.
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new JwtAuthRes(token, new JwtAuthRes.UserSummaryRes(user.getId(), user.getUsername()));
    }
}
