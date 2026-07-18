package com.notebook.api.security;

import com.notebook.api.entity.User;
import com.notebook.api.exception.UnauthorizedException;
import com.notebook.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Controllers receive an Authentication whose principal name is the user's email
 * (see JwtAuthenticationFilter), but services are written against userId (UUID).
 * This is the single place that bridges the two, rather than every controller
 * doing its own repository lookup.
 */
@Component
@RequiredArgsConstructor
public class AuthenticatedUserResolver {

    private final UserRepository userRepository;

    public UUID resolveUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
        return user.getId();
    }
}
