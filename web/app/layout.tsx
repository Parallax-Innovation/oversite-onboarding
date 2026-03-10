import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OverSite Training",
  description: "AI-powered onboarding for OverSite engineers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0e0d0c] text-[#fcfcfc]">{children}</body>
    </html>
  );
}
