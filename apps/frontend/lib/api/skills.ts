import { apiRequest } from "./client";
import type { SkillProgress } from "@/types/skill";

export const skillsApi = {
  getProgress: () => apiRequest<SkillProgress[]>("/skills/progress"),
};
