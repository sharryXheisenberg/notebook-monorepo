package com.notebook.api.service.impl;

import com.notebook.api.dto.request.ForgotPasswordReq;
import com.notebook.api.dto.request.LoginReq;
import com.notebook.api.dto.request.RegisterReq;
import com.notebook.api.dto.request.ResetPasswordReq;
import com.notebook.api.dto.response.JwtAuthRes;
import com.notebook.api.entity.PasswordResetToken;
import com.notebook.api.entity.User;
import com.notebook.api.exception.DuplicateResourceException;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.exception.UnauthorizedException;
import com.notebook.api.repository.PasswordResetTokenRepository;
import com.notebook.api.repository.UserRepository;
import com.notebook.api.security.JwtTokenProvider;
import com.notebook.api.service.AuthService;
import com.notebook.api.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String TOKEN_CHARS =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int TOKEN_LENGTH = 48;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MailService mailService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;


    // No explicit constructor here — @RequiredArgsConstructor above already generates one
    // for all five `final` fields. Writing both is what caused root cause #1 (see chat).

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
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new JwtAuthRes(token, new JwtAuthRes.UserSummaryRes(user.getId(), user.getUsername()));
    }

    @Override
    @Transactional
    public void requestPasswordReset(ForgotPasswordReq req) {
        userRepository.findByEmail(req.email()).ifPresent(user -> {
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .userId(user.getId())
                    .token(generateToken())
                    .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken.getToken();
            mailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        });
        // Deliberately no branch for "email not found" — same response either way,
        // so this endpoint can't be used to check which emails have accounts.
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordReq req) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(req.token())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired reset link"));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            // Same exception/message whether used or expired — no need for the caller
            // to distinguish, and it avoids leaking timing details about the token.
            throw new ResourceNotFoundException("Invalid or expired reset link");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private String generateToken() {
        StringBuilder sb = new StringBuilder(TOKEN_LENGTH);
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            sb.append(TOKEN_CHARS.charAt(RANDOM.nextInt(TOKEN_CHARS.length())));
        }
        return sb.toString();
    }
}