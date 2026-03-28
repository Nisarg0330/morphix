import type { Metadata } from "next";
import "./globals.css";
import { AmplifyProvider } from "@/components/AmplifyProvider";

export const metadata: Metadata = {
  title: "Morphix — Transform anything. Instantly.",
  description: "Serverless file converter powered by AWS Lambda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "Inter, system-ui, sans-serif" }}>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}