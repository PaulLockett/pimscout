import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PimScout",
  description: "Scout Relationship Orchestration Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
