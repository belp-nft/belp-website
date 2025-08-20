"use client";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import WalletModal from "./WalletModal";
import WalletButton from "./WalletButton";
import { Connected, useWallet } from "@/hooks/useWallet";
import { AnimatePresence, motion } from "framer-motion";
import { shortenAddress } from "@/hooks/wallet/utils";

type Props = {
  className?: string;
  hasCollapse?: boolean;
  onConnected?: (info: Connected) => void;
};

type WalletType = "phantom" | "solflare" | "backpack" | "glow" | "okx";

export default function ConnectWallet({
  className,
  hasCollapse,
  onConnected,
}: Props) {
  const router = useRouter();
  const pathname = router.pathname;

  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    solAddress,
    hasPhantom,
    hasSolflare,
    hasBackpack,
    hasGlow,
    hasOKX,
    loading,
    connectWallet,
    shorten,
    disconnect,
    solBalanceText,
  } = useWallet(onConnected);

  const isConnecting = !!loading && !solAddress;

  const label = useMemo(
    () =>
      (solAddress &&
        shortenAddress({
          addr: solAddress,
          number: 4,
        })) ||
      "",
    [solAddress, shorten]
  );

  useEffect(() => {
    const initializeWallet = async () => {
      // WalletStateProvider sẽ handle auto-reconnect, chỉ cần set initialized
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeWallet();
    }
  }, [isInitialized]);

  // Remove duplicate localStorage management - WalletStateProvider handles this

  useEffect(() => {
    if (hasCollapse) return;
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu, hasCollapse]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    // localStorage management handled by WalletStateProvider
    setShowMenu(false);

    if (pathname.startsWith("/my-collection")) {
      router.push("/");
    }
  }, [disconnect, router, pathname]);

  const handleWalletConnection = useCallback(
    async (walletType: WalletType) => {
      try {
        await connectWallet(walletType);
        setOpen(false);
        setShowMenu(false);
        console.log(`Connected to ${walletType} wallet successfully`);
      } catch (error) {
        console.error(`Failed to connect to ${walletType}:`, error);
      }
    },
    [connectWallet]
  );

  if (!isInitialized) {
    return (
      <WalletButton
        isOpen={false}
        label=""
        balance={undefined}
        loadingBalance={true}
        isConnecting={false}
        onClick={() => {}}
        className={className}
      />
    );
  }

  return (
    <>
      <div className="relative w-full">
        <div className="flex items-center justify-center w-full">
          <WalletButton
            isOpen={showMenu}
            label={label}
            balance={solAddress ? solBalanceText : undefined}
            loadingBalance={loading === "sol-balance"}
            isConnecting={isConnecting}
            onClick={() => {
              if (solAddress) {
                if (hasCollapse) {
                  setShowMenu((prev) => !prev);
                } else {
                  setShowMenu(true);
                }
              } else {
                setOpen(true);
                setShowMenu(false);
              }
            }}
            className={className}
          />
        </div>
        {hasCollapse ? (
          <AnimatePresence>
            {solAddress && showMenu && (
              <motion.div
                ref={menuRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mt-2 w-full rounded-2xl bg-white shadow-xl border border-[#B6A3E6] p-3"
              >
                <a
                  href="/my-collection"
                  className={
                    `block px-2 py-2 rounded-lg transition cursor-pointer ` +
                    (pathname === "/my-collection"
                      ? "bg-[#F6F0FF] font-bold"
                      : "hover:bg-[#F6F0FF] font-medium")
                  }
                  onClick={() => setShowMenu(false)}
                >
                  My collection
                </a>
                <div className="my-2 border-t border-[#E3D6F6]" />
                <button
                  className="block w-full text-left px-2 py-2 rounded-lg text-[#401B79] hover:bg-[#F6F0FF] transition font-medium cursor-pointer"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          solAddress &&
          showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-[#B6A3E6] z-50 p-3"
            >
              <a
                href="/my-collection"
                className={
                  `block px-2 py-2 rounded-lg transition cursor-pointer ` +
                  (pathname === "/my-collection"
                    ? "bg-[#F6F0FF] font-bold"
                    : "hover:bg-[#F6F0FF] font-medium")
                }
                onClick={() => setShowMenu(false)}
              >
                My collection
              </a>
              <div className="my-2 border-t border-[#E3D6F6]" />
              <button
                className="block w-full text-left px-2 py-2 rounded-lg text-[#401B79] hover:bg-[#F6F0FF] transition font-medium cursor-pointer"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          )
        )}
      </div>
      <WalletModal
        open={open}
        onClose={() => setOpen(false)}
        hasPhantom={hasPhantom}
        hasSolflare={hasSolflare}
        hasBackpack={hasBackpack}
        hasGlow={hasGlow}
        hasOKX={hasOKX}
        loading={loading}
        connectWallet={handleWalletConnection}
      />
    </>
  );
}
