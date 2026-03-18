/** @type {import('next').NextConfig} */
const nextConfig = {
  // 強制關閉可能會出錯的加速引擎，改用穩定模式
  transpilePackages: ["@next/swc-win32-x64-msvc"],
  experimental: {
    turbo: false as any
  }
};

export default nextConfig;