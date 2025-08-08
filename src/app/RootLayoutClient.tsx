"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import "swiper/css";
import "swiper/css/navigation";

import BelpHeader from "@/components/Header";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-[#1C007C]`}
      >
        <BelpHeader />
        <div
          className={clsx(
            !["/", "/my-collection"].includes(pathname) && "mt-24"
          )}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
