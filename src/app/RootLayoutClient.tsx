"use client";

import "../styles/globals.css";
import "swiper/css";
import "swiper/css/navigation";

import BelpHeader from "@/components/Header";
import { ConfigProvider } from "@/providers/ConfigProvider";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { Oxanium } from "next/font/google";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
});

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className={clsx("font-gmarket antialiased", oxanium.variable)}>
        <BelpHeader />
        <div
          className={clsx(
            !["/", "/my-collection"].includes(pathname) && "mt-16"
          )}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
