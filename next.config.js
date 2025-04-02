/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Ignore TypeScript errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure static files are properly served
  assetPrefix: process.env.NODE_ENV === "production" ? undefined : "",
  // Other Next.js config options
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

export default nextConfig;
