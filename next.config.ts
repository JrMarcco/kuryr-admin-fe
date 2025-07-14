import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // async rewrites() {
  //   if (process.env.NODE_ENV === 'development') {
  //     return [
  //       {
  //         source: '/api/:path*',
  //         // 重要：将下面的 URL 替换为您的真实后端 API 地址
  //         destination: 'http://localhost:8080/api/:path*',
  //       },
  //     ]
  //   }
  //   return []
  // },
};

export default nextConfig;
