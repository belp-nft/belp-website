"use client";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import WalletModal from "./WalletModal";
import WalletButton from "./WalletButton";
import { Connected, useWallet } from "@/hooks/useWallet";

type Props = {
  className?: string;
  onConnected?: (info: Connected) => void;
};

type WalletType = "phantom" | "solflare" | "backpack" | "glow" | "okx";

export default function ConnectWallet({ className, onConnected }: Props) {
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
    () => (solAddress && shorten(solAddress)) || "",
    [solAddress, shorten]
  );

  useEffect(() => {
    const initializeWallet = async () => {
      const savedWallet = localStorage.getItem("wallet") as WalletType | null;

      if (savedWallet && !solAddress) {
        try {
          await connectWallet(savedWallet);
          console.log(`Auto-reconnected to ${savedWallet} wallet`);
        } catch (error) {
          console.error("Failed to reconnect wallet:", error);
          localStorage.removeItem("wallet");
        }
      }
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeWallet();
    }
  }, [connectWallet, solAddress, isInitialized]);

  useEffect(() => {
    if (solAddress) {
      const savedWallet = localStorage.getItem("wallet");
      if (!savedWallet) {
        localStorage.setItem("wallet", "phantom");
      }
    }
  }, [solAddress]);

  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    localStorage.removeItem("wallet");
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
      <WalletButton
        isOpen={showMenu}
        label={label}
        balance={solAddress ? solBalanceText : undefined}
        loadingBalance={loading === "sol-balance"}
        isConnecting={isConnecting}
        onClick={() => {
          if (solAddress) {
            setShowMenu((prev) => !prev);
          } else {
            setOpen(true);
            setShowMenu(false);
          }
        }}
        className={className}
      />
      {solAddress && showMenu && (
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
      )}

      <WalletModal
        open={open}
        onClose={() => setOpen(false)}
        hasPhantom={hasPhantom}
        hasSolflare={hasSolflare}
        hasBackpack={hasBackpack}
        hasGlow={hasGlow}
        hasOKX={hasOKX}
        loading={loading}
        connectPhantom={() => handleWalletConnection("phantom")}
        connectSolflare={() => handleWalletConnection("solflare")}
        connectBackpack={() => handleWalletConnection("backpack")}
        connectGlow={() => handleWalletConnection("glow")}
        connectOKX={() => handleWalletConnection("okx")}
      />
    </>
  );
}
