import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Navbar from "./components/layout/navbar";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Sachin Deshpande | Frontend Developer",
    template: "%s | Sachin Deshpande",
  },
  description:
    "Portfolio of Sachin Deshpande — building scalable, accessible web applications with React, Next.js and TypeScript.",
  openGraph: {
    title: "Sachin Deshpande | Frontend Developer",
    description:
      "Explore projects, skills and experience in frontend engineering.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>

          <Navbar />
          {children}

      </body>
    </html>
  );
}
