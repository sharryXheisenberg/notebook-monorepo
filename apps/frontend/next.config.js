/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pyodide runs inside a Web Worker and needs SharedArrayBuffer for good performance —
  // these headers enable cross-origin isolation. Vercel respects these via next.config.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
