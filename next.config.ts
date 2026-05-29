import type { NextConfig } from "next";

const coopCoep = [
  { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" }
];

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Headers only apply during `next dev` — static export uses vercel.json / public/_headers.
  async headers() {
    return [{ source: "/(.*)", headers: coopCoep }];
  }
};

export default nextConfig;
