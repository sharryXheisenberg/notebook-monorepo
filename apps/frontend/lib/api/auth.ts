import { apiRequest } from "./client";
import type { ForgotPasswordReq, JwtAuthRes, LoginReq, RegisterReq, ResetPasswordReq } from "@/types/auth";

export const authApi = {
  register: (req: RegisterReq) =>
    apiRequest<JwtAuthRes>("/auth/register", { method: "POST", body: req, auth: false }),

  login: (req: LoginReq) =>
    apiRequest<JwtAuthRes>("/auth/login", { method: "POST", body: req, auth: false }),

  forgotPassword: (req: ForgotPasswordReq) =>
    apiRequest<void>("/auth/forgot-password", { method: "POST", body: req, auth: false }),

  resetPassword: (req: ResetPasswordReq) =>
    apiRequest<void>("/auth/reset-password", { method: "POST", body: req, auth: false }),
};
