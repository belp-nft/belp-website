"use client";

import "../styles/globals.css";
import "swiper/css";
import "swiper/css/navigation";

import BelpHeader from "@/components/Header";
import { ConfigProvider } from "@/providers/ConfigProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { Oxanium } from "next/font/google";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
  preload: true,
});

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx("font-gmarket antialiased", oxanium.variable)}
        suppressHydrationWarning
      >
        <LoadingProvider>
          <AuthProvider>
            <ConfigProvider>
              <ThemeProvider>
                <BelpHeader />
                <div
                  className={clsx(
                    !["/", "/my-collection"].includes(pathname) && "mt-16"
                  )}
                >
                  {children}
                </div>
              </ThemeProvider>
            </ConfigProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
