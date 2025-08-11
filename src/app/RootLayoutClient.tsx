"use client";

import "../styles/globals.css";
import "swiper/css";
import "swiper/css/navigation";

import BelpHeader from "@/components/Header";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="font-gmarket antialiased text-[#1C007C]">
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
