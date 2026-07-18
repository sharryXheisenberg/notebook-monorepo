package com.notebook.api.service;

import com.notebook.api.dto.request.LoginReq;
import com.notebook.api.dto.request.RegisterReq;
import com.notebook.api.dto.response.JwtAuthRes;
import com.notebook.api.entity.User;
import com.notebook.api.exception.DuplicateResourceException;
import com.notebook.api.exception.UnauthorizedException;
import com.notebook.api.repository.UserRepository;
import com.notebook.api.security.JwtTokenProvider;
import com.notebook.api.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterReq registerReq;

    @BeforeEach
    void setUp() {
        registerReq = new RegisterReq("saurabh", "saurabh@example.com", "password123");
    }

    @Test
    void register_throwsDuplicateResourceException_whenEmailAlreadyExists() {
        when(userRepository.existsByEmail(registerReq.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerReq))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throwsDuplicateResourceException_whenUsernameAlreadyExists() {
        when(userRepository.existsByEmail(registerReq.email())).thenReturn(false);
        when(userRepository.existsByUsername(registerReq.username())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerReq))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void register_succeeds_andReturnsToken() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(jwtTokenProvider.generateToken(any(), any())).thenReturn("fake-jwt");

        JwtAuthRes result = authService.register(registerReq);

        assertThat(result.token()).isEqualTo("fake-jwt");
        assertThat(result.user().username()).isEqualTo("saurabh");
    }

    @Test
    void login_throwsUnauthorized_whenPasswordDoesNotMatch() {
        User existing = User.builder().id(UUID.randomUUID()).email("saurabh@example.com")
                .passwordHash("hashed").username("saurabh").build();
        LoginReq loginReq = new LoginReq("saurabh@example.com", "wrongpassword");

        when(userRepository.findByEmail(loginReq.email())).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches(loginReq.password(), existing.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginReq))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_throwsUnauthorized_whenUserDoesNotExist() {
        LoginReq loginReq = new LoginReq("nobody@example.com", "password123");
        when(userRepository.findByEmail(loginReq.email())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginReq))
                .isInstanceOf(UnauthorizedException.class);
    }
}
