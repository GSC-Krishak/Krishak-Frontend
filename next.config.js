/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore TypeScript errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Other Next.js config options
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

export default nextConfig;
