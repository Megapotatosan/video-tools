import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Tools",
  description: "Open-source browser-local video tools powered by MediaBunny and FFmpeg.wasm."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
