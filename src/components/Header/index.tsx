"use client";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import {
  MdHome,
  MdShoppingBag,
  MdDescription,
  MdClose,
  MdMenu,
  MdSmartButton,
} from "react-icons/md";
import { useRouter } from "next/router";
import ConnectWallet from "../Wallet/ConnectWallet";

const menu = [
  { label: "HOME", href: "/", icon: <MdHome size={22} /> },
  { label: "MINT", href: "/mint", icon: <MdSmartButton size={22} /> },
  { label: "LORE", href: "/lore", icon: <MdShoppingBag size={22} /> },
  {
    label: "DOC",
    href: "https://maindocs.gitbook.io/belp/documentation",
    icon: <MdDescription size={22} />,
  },
];

export default function BelpHeader() {
  const router = useRouter();
  const pathname = router.pathname;

  const [open, setOpen] = useState(false);

  // Fast navigation handler
  const handleNavigation = useCallback(
    (href: string, closeMenu = false) => {
      if (closeMenu) {
        setOpen(false);
      }

      // Don't navigate if already on the same page
      if (pathname === href) {
        return;
      }

      // Use router.push for faster navigation
      router.push(href);
    },
    [router, pathname]
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[89] bg-black"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className={clsx(
                "fixed top-0 left-0 h-full w-full sm:max-w-[400px] bg-[#f6effb] z-[99] shadow-2xl",
                "border-r border-[#d3b0f7] flex flex-col"
              )}
              style={{ minHeight: "100dvh" }}
            >
              <div className="flex flex-col items-center px-5 pt-6 pb-3 border-b border-[#c69dff] relative">
                <img
                  src="/belp-logo.svg"
                  alt="belp logo"
                  width={120}
                  height={36}
                  className="mb-3"
                />
                <button
                  className="absolute top-4 right-4 text-[#9933dd] rounded-full hover:bg-[#e0caff] p-2 transition cursor-pointer"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <MdClose size={28} />
                </button>
              </div>
              <div className="px-6">
                <div className="flex items-center justify-center my-5 w-full">
                  <ConnectWallet
                    hasCollapse
                    onConnected={(info) => console.log("Connected:", info)}
                  />
                </div>
              </div>
              <nav className="flex-1 w-full">
                <ul className="flex flex-col gap-2 px-6">
                  {menu.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <motion.li
                        key={item.label}
                        initial={{ x: -24, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -32, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 180,
                          delay: 0.05,
                        }}
                      >
                        {item.label === "DOC" ? (
                          <Link
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className={clsx(
                              "flex items-center gap-3 py-2 px-2 rounded-lg font-semibold uppercase tracking-wider text-[18px]",
                              "text-[#6B6475] hover:bg-[#e8d8fb] transition-all"
                            )}
                          >
                            <span className="opacity-80">{item.icon}</span>
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleNavigation(item.href, true)}
                            className={clsx(
                              "flex items-center gap-3 py-2 px-2 rounded-lg font-semibold uppercase tracking-wider text-[18px] w-full text-left cursor-pointer",
                              isActive
                                ? "font-extrabold"
                                : "text-[#6B6475] hover:bg-[#e8d8fb] transition-all"
                            )}
                          >
                            <span className="opacity-80">{item.icon}</span>
                            {item.label}
                          </button>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header
        className={clsx(
          "w-full z-50 absolute top-0 left-0 py-2 md:py-3 px-4 sm:px-6 lg:px-10",
          "flex items-center justify-between",
          "bg-gradient-to-b from-[#FFE7FF80] to-[#FEF5FE]"
        )}
        style={{ left: 0, right: 0 }}
      >
        <div className="flex flex-1 md:hidden items-center justify-between relative h-[52px]">
          <button
            className="block md:hidden rounded-xl p-2 bg-[#f6effb] border border-[#d3b0f7] shadow-sm transition active:scale-95 cursor-pointer"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <MdMenu size={28} color="#5B357D" />
          </button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-2 cursor-pointer"
              tabIndex={-1}
            >
              <img
                src="/belp-logo.svg"
                alt="belp logo"
                width={120}
                height={36}
              />
            </button>
          </div>
          <div className="w-[44px] h-[44px]" />
        </div>

        <button
          onClick={() => handleNavigation("/")}
          className="hidden md:flex items-center gap-2 h-[40px] min-w-[120px] md:ml-1 cursor-pointer"
        >
          <img src="/belp-logo.svg" alt="belp logo" width={151} height={51} />
        </button>

        <nav className="hidden md:block">
          <ul className="flex gap-12 items-center">
            {menu.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.label}>
                  {item.label === "DOC" ? (
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clsx(
                        "uppercase text-[16px] lg:text-[20px] xl:text-[24px] font-bold tracking-[.08em] transition-all duration-150 px-1 bg-gradient-to-b from-[#a44bfd] to-[#1C007C] bg-clip-text text-transparent",
                        "hover:text-[#5B357D]"
                      )}
                      style={{ letterSpacing: 2 }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={clsx(
                        "uppercase text-[16px] lg:text-[20px] xl:text-[24px] font-bold tracking-[.08em] transition-all duration-150 px-1 bg-gradient-to-b from-[#a44bfd] to-[#1C007C] bg-clip-text text-transparent cursor-pointer",
                        clsx(
                          "hover:text-[#5B357D]",
                          isActive &&
                            "underline underline-offset-[9px] decoration-2 decoration-[#5B357D]"
                        )
                      )}
                      style={{ letterSpacing: 2 }}
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden md:block">
          <ConnectWallet
            onConnected={(info) => console.log("Connected:", info)}
          />
        </div>
      </header>
    </>
  );
}
