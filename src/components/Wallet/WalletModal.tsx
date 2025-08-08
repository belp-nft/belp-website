"use client";
import { AnimatePresence, motion } from "framer-motion";
import ProviderRow from "./ProviderRow";
import { LoadingKind } from "@/hooks/useWallet";

type Props = {
  open: boolean;
  onClose: () => void;
  hasPhantom: boolean;
  loading: LoadingKind;
  connectPhantom: () => void;
};

export default function WalletModal({
  open,
  onClose,
  hasPhantom,
  loading,
  connectPhantom,
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
              <h3 className="text-[#411A7A] text-xl font-extrabold">
                Connect wallet
              </h3>
              <p className="text-[#6B6475] text-sm">
                Choose a wallet provider to continue.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <ProviderRow
                logo={{
                  src: "https://raw.githubusercontent.com/phantom-labs/phantom-brand/master/Phantom%20Primary%20Logo%20Mark/Primary_Lockup.svg",
                  alt: "Phantom",
                }}
                title="Phantom"
                subtitle="Solana"
                onClick={connectPhantom}
                loading={loading === "phantom"}
                installedHint={hasPhantom ? null : "Install"}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="text-[#7A4BD6] font-semibold px-3 py-2 hover:opacity-80"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
