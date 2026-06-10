/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy API calls to the Python hub during local dev. In production on Vercel,
  // set NEXT_PUBLIC_API_BASE to your deployed backend URL instead.
  async rewrites() {
    const hub = process.env.PYTHON_HUB_URL || "http://127.0.0.1:8787";
    return [
      {
        source: "/hub/:path*",
        destination: `${hub}/:path*`,
      },
    ];
  },
};

export default nextConfig;
