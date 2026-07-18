import { create } from "zustand";

interface AiState {
  isRateLimited: boolean;
  retryAfterSeconds: number;
  setRateLimited: (retryAfterSeconds: number) => void;
  clearRateLimit: () => void;
}

// Tracks rate-limit UI state (see docs/API.md's 429 response for /ai/prompt) so any
// component using the AI Prompt Block can disable itself and show a countdown,
// without each block re-implementing its own timer logic.
export const useAiStore = create<AiState>((set) => ({
  isRateLimited: false,
  retryAfterSeconds: 0,

  setRateLimited: (retryAfterSeconds) => set({ isRateLimited: true, retryAfterSeconds }),
  clearRateLimit: () => set({ isRateLimited: false, retryAfterSeconds: 0 }),
}));
