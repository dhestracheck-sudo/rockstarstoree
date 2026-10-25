import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: false,
  experimental: {
    // Limit build/dev worker fan-out on this machine to avoid exhausting RAM.
    cpus: 2,
  },
};

export default nextConfig;
