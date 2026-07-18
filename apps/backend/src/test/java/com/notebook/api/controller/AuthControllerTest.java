package com.notebook.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notebook.api.config.SecurityConfig;
import com.notebook.api.dto.request.LoginReq;
import com.notebook.api.dto.request.RegisterReq;
import com.notebook.api.dto.response.JwtAuthRes;
import com.notebook.api.security.AuthenticatedUserResolver;
import com.notebook.api.security.JwtAuthenticationFilter;
import com.notebook.api.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// excludeFilters not needed here since AuthController's endpoints are permitAll in SecurityConfig,
// but the filter/resolver beans still need to exist in the context for it to start up.
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AuthService authService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private AuthenticatedUserResolver authenticatedUserResolver;

    @Test
    void register_returns201_withValidPayload() throws Exception {
        RegisterReq req = new RegisterReq("saurabh", "saurabh@example.com", "password123");
        JwtAuthRes res = new JwtAuthRes("fake-jwt", new JwtAuthRes.UserSummaryRes(UUID.randomUUID(), "saurabh"));
        when(authService.register(any())).thenReturn(res);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("fake-jwt"));
    }

    @Test
    void register_returns400_whenPasswordTooShort() throws Exception {
        RegisterReq req = new RegisterReq("saurabh", "saurabh@example.com", "short");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("validation_failed"));
    }

    @Test
    void register_returns400_whenEmailIsMalformed() throws Exception {
        RegisterReq req = new RegisterReq("saurabh", "not-an-email", "password123");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_returns200_withValidCredentials() throws Exception {
        LoginReq req = new LoginReq("saurabh@example.com", "password123");
        JwtAuthRes res = new JwtAuthRes("fake-jwt", new JwtAuthRes.UserSummaryRes(UUID.randomUUID(), "saurabh"));
        when(authService.login(any())).thenReturn(res);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("saurabh"));
    }
}
