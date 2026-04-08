import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earth VR Simulation",
  description: "A WebVR simulation of the rotating Earth using Three.js and React Three Fiber.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
