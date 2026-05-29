import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "VideoTools — Free Browser-Based Video Tools",
  description: "Process videos privately in your browser. Convert, trim, compress, rotate, crop and more — no upload, no server."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
