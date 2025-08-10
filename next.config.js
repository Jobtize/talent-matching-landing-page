/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@azure/storage-blob'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@azure/storage-blob');
    }
    return config;
  }
}

export default nextConfig
