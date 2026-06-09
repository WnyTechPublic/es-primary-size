import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ES Storage Matrix v2",
  description: "Elasticsearch 옵션 조합별 저장 효율 비교 (v2)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
