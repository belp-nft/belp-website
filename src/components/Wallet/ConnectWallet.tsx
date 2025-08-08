"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import WalletModal from "./WalletModal";
import WalletButton from "./WalletButton";
import { Connected, useWallet } from "@/hooks/useWallet";
import { useSolflareProvider } from "@/hooks/useSolflareProvider";
import { useBackpackProvider } from "@/hooks/useBackpackProvider";
import { useGlowProvider } from "@/hooks/useGlowProvider";
import { useOKXProvider } from "@/hooks/useOKXProvider";

type Props = {
  className?: string;
  onConnected?: (info: Connected) => void;
};

export default function ConnectWallet({ className, onConnected }: Props) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    solAddress,
    hasPhantom,
    loading,
    connectPhantom,
    shorten,
    disconnect,
    solBalanceText,
  } = useWallet(onConnected);

  const {
    solflare,
    isConnected: isSolflareConnected,
    connect: connectSolflare,
    disconnect: disconnectSolflare,
  } = useSolflareProvider();
  const {
    backpack,
    isConnected: isBackpackConnected,
    connect: connectBackpack,
    disconnect: disconnectBackpack,
  } = useBackpackProvider();
  const {
    glow,
    isConnected: isGlowConnected,
    connect: connectGlow,
    disconnect: disconnectGlow,
  } = useGlowProvider();
  const {
    okx,
    isConnected: isOKXConnected,
    connect: connectOKX,
    disconnect: disconnectOKX,
  } = useOKXProvider();

  const label = useMemo(
    () => (solAddress && shorten(solAddress)) || "",
    [solAddress, shorten]
  );

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

  return (
    <>
      <div className="relative inline-block">
        <WalletButton
          isOpen={showMenu}
          label={label}
          balance={solAddress ? solBalanceText : undefined}
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
                `block px-2 py-2 rounded-lg transition ` +
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
              className="block w-full text-left px-2 py-2 rounded-lg text-[#401B79] hover:bg-[#F6F0FF] transition font-medium"
              onClick={() => {
                disconnect();
                window.localStorage.removeItem("wallet");
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      <WalletModal
        open={open}
        onClose={() => setOpen(false)}
        hasPhantom={hasPhantom}
        hasSolflare={!!solflare}
        hasBackpack={!!backpack}
        hasGlow={!!glow}
        hasOKX={!!okx}
        loading={loading}
        connectPhantom={async () => {
          await connectPhantom();
          setOpen(false);
          setShowMenu(false);
        }}
        connectSolflare={async () => {
          await connectSolflare();
          setOpen(false);
          setShowMenu(false);
        }}
        connectBackpack={async () => {
          await connectBackpack();
          setOpen(false);
          setShowMenu(false);
        }}
        connectGlow={async () => {
          await connectGlow();
          setOpen(false);
          setShowMenu(false);
        }}
        connectOKX={async () => {
          await connectOKX();
          setOpen(false);
          setShowMenu(false);
        }}
      />
    </>
  );
}
