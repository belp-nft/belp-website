"use client";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

const menu = [
  { label: "HOME", href: "/", active: true },
  { label: "DOC", href: "/doc" },
  { label: "MINT", href: "/mint" },
  { label: "COLLECTION", href: "/collection" },
];

export default function BelpHeader() {
  return (
    <header
      className={clsx(
        "flex items-center justify-between w-full",
        "py-2 md:py-8 px-4 md:px-14"
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2 h-[40px] min-w-[120px] md:ml-1"
      >
        <Image
          src="/belp-logo.svg"
          alt="belp logo"
          width={151}
          height={51}
          className="rounded-md"
          priority
        />
      </Link>
      {/* Menu */}
      <nav className="flex-1 flex items-center justify-end h-full">
        <ul className="flex gap-2 md:gap-6 items-center">
          {menu.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={clsx(
                  "uppercase text-[14px] md:text-base tracking-wider px-2 py-1 font-semibold transition-all duration-200",
                  item.active
                    ? "text-white underline underline-offset-4 decoration-2"
                    : "text-gray-300 hover:text-white"
                )}
                aria-current={item.active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
