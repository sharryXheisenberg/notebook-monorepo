import { apiRequest } from "./client";
import type { AiPromptReq, AiPromptRes } from "@/types/ai";

export const aiApi = {
  // 429 (rate limited) surfaces as an ApiError with status 429 and
  // body.retryAfterSeconds — handle that specifically in the calling component,
  // not here, since the UI response to it (e.g. disable the button + show a countdown)
  // is a component concern.
  prompt: (req: AiPromptReq) => apiRequest<AiPromptRes>("/ai/prompt", { method: "POST", body: req }),
};
