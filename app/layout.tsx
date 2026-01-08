import type React from "react";

import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Web3Provider } from "@/components/providers/web3-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { WalletListener } from "@/components/wallet/wallet-listener";
import { Toaster } from "@/components/ui/sonner";

const inter = localFont({
  src: "../public/font/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`antialiased bg-background text-foreground ${inter.variable} font-sans`}
      >
        <Web3Provider>
          <ReduxProvider>
            <WalletListener />
            {children}
            <Toaster />
          </ReduxProvider>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  );
}
