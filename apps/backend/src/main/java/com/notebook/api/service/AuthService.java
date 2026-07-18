package com.notebook.api.service;

import com.notebook.api.dto.request.LoginReq;
import com.notebook.api.dto.request.RegisterReq;
import com.notebook.api.dto.response.JwtAuthRes;

public interface AuthService {
    JwtAuthRes register(RegisterReq req);
    JwtAuthRes login(LoginReq req);
}
