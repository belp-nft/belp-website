"use client";
import { AnimatePresence, motion } from "framer-motion";
import ProviderRow from "./ProviderRow";
import { LoadingKind } from "@/hooks/useWallet";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  showGoHomeButton?: boolean;
  goHomeButtonText?: string;
  onGoHome?: () => void;
  hasPhantom: boolean;
  hasSolflare?: boolean;
  hasBackpack?: boolean;
  hasGlow?: boolean;
  hasOKX?: boolean;
  loading: LoadingKind;
  connectPhantom: () => void;
  connectSolflare: () => void;
  connectBackpack: () => void;
  connectGlow: () => void;
  connectOKX: () => void;
};

export default function WalletModal({
  open,
  onClose,
  title = "Connect wallet",
  subtitle = "Choose a wallet provider to continue.",
  showGoHomeButton = false,
  goHomeButtonText = "Go to Home",
  onGoHome,
  hasPhantom,
  hasSolflare,
  hasBackpack,
  hasGlow,
  hasOKX,
  loading,
  connectPhantom,
  connectSolflare,
  connectBackpack,
  connectGlow,
  connectOKX,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[99] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[100] left-1/2 top-1/2 w-[92vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#f6effb] border border-[#d9c2ff] shadow-2xl p-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4">
              <h3 className="text-[#411A7A] text-xl font-extrabold">{title}</h3>
              <p className="text-[#6B6475] text-sm">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-3">
              <ProviderRow
                logo={{ src: "/icons/phantom.svg", alt: "Phantom" }}
                title="Phantom"
                subtitle="Solana"
                onClick={connectPhantom}
                loading={loading === "phantom"}
                installedHint={hasPhantom ? null : "Install"}
              />
              <ProviderRow
                logo={{ src: "/icons/solflare.svg", alt: "Solflare" }}
                title="Solflare"
                subtitle="Solana"
                onClick={connectSolflare}
                loading={loading === "solflare"}
                installedHint={hasSolflare ? null : "Install"}
              />
              <ProviderRow
                logo={{ src: "/icons/backpack.svg", alt: "Backpack" }}
                title="Backpack"
                subtitle="Solana"
                onClick={connectBackpack}
                loading={loading === "backpack"}
                installedHint={hasBackpack ? null : "Install"}
              />
              <ProviderRow
                logo={{ src: "/icons/glow.jpg", alt: "Glow" }}
                title="Glow"
                subtitle="Solana"
                onClick={connectGlow}
                loading={loading === "glow"}
                installedHint={hasGlow ? null : "Install"}
              />
              <ProviderRow
                logo={{ src: "/icons/okx.svg", alt: "OKX" }}
                title="OKX"
                subtitle="Solana"
                onClick={connectOKX}
                loading={loading === "okx"}
                installedHint={hasOKX ? null : "Install"}
              />
            </div>

            {/* Go to Home Button */}
            {showGoHomeButton && onGoHome && (
              <div className="mt-4 pt-3 border-t border-[#E3D6F6]">
                <button
                  onClick={onGoHome}
                  className="w-full py-2.5 px-4 rounded-lg border border-[#d9c2ff] bg-white text-[#6B6475] hover:bg-[#f6effb] hover:text-[#411A7A] transition-colors text-sm font-medium"
                >
                  {goHomeButtonText}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
