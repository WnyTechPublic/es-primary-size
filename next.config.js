/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/es-primary-size",
  assetPrefix: "/es-primary-size/",
  images: {
    unoptimized: true,
  },
  // results.json 은 빌드 시 클라이언트 번들에 포함되어 GitHub Pages에서 API 없이 동작
};
module.exports = nextConfig;
