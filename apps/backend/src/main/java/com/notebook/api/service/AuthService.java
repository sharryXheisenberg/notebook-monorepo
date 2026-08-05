package com.notebook.api.service;

import com.notebook.api.dto.request.ForgotPasswordReq;
import com.notebook.api.dto.request.LoginReq;
import com.notebook.api.dto.request.RegisterReq;
import com.notebook.api.dto.request.ResetPasswordReq;
import com.notebook.api.dto.response.JwtAuthRes;

public interface AuthService {
    JwtAuthRes register(RegisterReq req);
    JwtAuthRes login(LoginReq req);

    /**
     * Always returns silently regardless of whether the email exists — revealing that
     * would let anyone probe which emails have accounts (account enumeration).
     */
    void requestPasswordReset(ForgotPasswordReq req);

    /**
     * @throws com.notebook.api.exception.ResourceNotFoundException if the token is invalid,
     *         expired, or already used
     */
    void resetPassword(ResetPasswordReq req);
}
