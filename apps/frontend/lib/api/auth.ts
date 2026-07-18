import { apiRequest } from "./client";
import type { JwtAuthRes, LoginReq, RegisterReq } from "@/types/auth";

export const authApi = {
  register: (req: RegisterReq) =>
    apiRequest<JwtAuthRes>("/auth/register", { method: "POST", body: req, auth: false }),

  login: (req: LoginReq) =>
    apiRequest<JwtAuthRes>("/auth/login", { method: "POST", body: req, auth: false }),
};
