import type { Config } from "tailwindcss";

// Design tokens for the "developer notebook" identity — a real notebook's margin-note
// metaphor (amber annotations against dark paper) rather than a generic dashboard palette.
// See app/globals.css for the font pairing (Inter for UI, JetBrains Mono for code).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#14161C",       // page background — near-black, not pure black
        surface: "#1C1F27",      // block/card background
        "surface-raised": "#242833",
        border: {
          subtle: "#2A2E38",
        },
        ink: {
          primary: "#E8E6E1",    // warm off-white "paper" text
          muted: "#9CA0AC",
        },
        annotation: {
          DEFAULT: "#E8A33D",    // amber — margin notes, AI suggestions, review comments
          muted: "#8A6A35",
        },
        signal: {
          DEFAULT: "#4FB8AF",    // teal — execution state, success, secondary actions
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
