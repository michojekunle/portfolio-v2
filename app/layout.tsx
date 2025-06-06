import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Michael Ojekunle | Frontend & Web3 Developer",
  description:
    "Portfolio of Michael Ojekunle - Frontend & Web3 Developer passionate about Solidity, JavaScript/TypeScript, React.js, Next.js, Rust, Cairo, and exploring Haskell, Erlang, and Python.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
          <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
