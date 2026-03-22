import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRODY LAB",
  description: "Agent workbench",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
