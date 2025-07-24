/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "cheerio"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        "pdf-parse": "commonjs pdf-parse",
        cheerio: "commonjs cheerio",
      })
    }
    return config
  },
}

export default nextConfig
