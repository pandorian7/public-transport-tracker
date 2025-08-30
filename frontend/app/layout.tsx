import type React from "react";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import AuthContextProvider from "@/context/auth-provider";
import QueryContextProvider from "@/context/query-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "NextRide",
  description:
    "Real-time updates, accurate routes, and the easiest way to plan your daily travel across Sri Lanka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} antialiased`}
    >
      <body className="font-sans ">
        <AuthContextProvider>
          <QueryContextProvider>
            <Toaster />
            <SiteHeader showAuthButtons={true} />
            <div className="min-h-screen justify-between flex flex-col max-w-11/12 mx-auto">
              {children}
            </div>
            <SiteFooter />
          </QueryContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
