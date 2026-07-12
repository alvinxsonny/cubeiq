import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare, GeistPixelGrid, GeistPixelCircle, GeistPixelTriangle, GeistPixelLine } from 'geist/font/pixel';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

export const metadata: Metadata = {
  title: "CubeiQ",
  description: "Scan your Rubik's Cube with your webcam or camera and solve it in 3D. Everything runs locally in your browser — 100% private.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} ${GeistPixelGrid.variable} ${GeistPixelCircle.variable} ${GeistPixelTriangle.variable} ${GeistPixelLine.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-cloud-white text-charcoal">
        {/* Fixed background layers */}
        <div className="grid-bg" />
        <div className="glow-gradient" />
        <div className="glow-gradient-secondary" />

        {/* Header — normal flow, scrolls away with the page */}
        <Header />

        {/* Page content */}
        {children}

        {/* Shared footer on every page */}
        <Footer />

        {/* Scroll-to-top button */}
        <ScrollToTop />
      </body>
    </html>
  );
}
