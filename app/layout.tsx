import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "단어장 - 초등 어휘 학습",
  description: "매일 새로운 단어를 배우는 초등 어휘 학습 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
