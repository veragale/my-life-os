/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 部署：无需 output: "export"
  // API Routes 自动转为 Serverless Functions
  // 静态页面自动享受 ISR / 边缘缓存
};

module.exports = nextConfig;
