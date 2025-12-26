import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested
import "./globals.css";
import { Providers } from "@/components/providers";
import { LockScreen } from "@/components/auth/LockScreen";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Ledgerly",
  description: "Premium Personal Finance Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <LockScreen />
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
