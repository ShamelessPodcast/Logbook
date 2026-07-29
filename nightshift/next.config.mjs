/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // The nightly run is the product; a lint nit shouldn't block a deploy of it.
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
