"use client";
import { BLOCKCHAIN_CONFIG } from "@/services";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MdContentCopy, MdHistory } from "react-icons/md";
import clsx from "clsx";

const ImageLoader = ({ src, alt, className, ...props }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
      )}
      <Image
        {...props}
        src={hasError ? "/avatars/user-placeholder.svg" : src}
        alt={alt}
        className={clsx(
          className,
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => {
          setIsLoading(false);
          // console.log("✅ Avatar loaded successfully");
        }}
        onError={() => {
          console.warn("❌ Avatar failed to load");
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

type Props = {
  contract: string;
  walletAddress?: string;
  onHistoryClick?: () => void;
};

function shortenMiddle(str = "", head = 6, tail = 6) {
  if (!str) return "";
  if (str.length <= head + tail + 3) return str;
  return `${str.slice(0, head)}...${str.slice(-tail)}`;
}

export default function UserInfo({
  contract,
  walletAddress,
  onHistoryClick,
}: Props) {
  const [copied, setCopied] = useState(false);

  const displayWalletFull = walletAddress ?? "—";

  const avatarUrl = useMemo(() => {
    if (!walletAddress) return "/avatars/user-placeholder.svg";
    return `https://cdn.stamp.fyi/avatar/${walletAddress}?s=128`;
  }, [walletAddress]);

  const displayContractFull = contract ?? "—";
  const displayContractShort = useMemo(
    () => shortenMiddle(displayContractFull, 4, 4),
    [displayContractFull]
  );

  const copy = async () => {
    try {
      if (!navigator?.clipboard) throw new Error("no-clipboard");
      await navigator.clipboard.writeText(displayContractFull);
    } catch {
      const el = document.createElement("input");
      el.value = displayContractFull;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const openSolscan = () => {
    if (!walletAddress) return;

    const isMainnet = BLOCKCHAIN_CONFIG.NETWORK === "mainnet";

    const url = `https://solscan.io/account/${walletAddress}${
      isMainnet ? "" : "?cluster=devnet"
    }`;
    window.open(url, "_blank");
  };

  const openContractOnSolscan = () => {
    if (!contract) return;

    const isMainnet = BLOCKCHAIN_CONFIG.NETWORK === "mainnet";

    const url = `https://solscan.io/token/${contract}${
      isMainnet ? "" : "?cluster=devnet"
    }`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full flex flex-row gap-4 sm:gap-6 justify-between pt-8 sm:pt-12 relative">
      <div className="flex gap-3 sm:gap-4 min-w-0 flex-1 overflow-hidden pr-2">
        <div className="shrink-0 rounded-full overflow-hidden w-20 h-20 md:w-24 md:h-24 absolute -top-14 md:-top-16 left-1/2 transform md:translate-0 -translate-x-1/2 md:left-4">
          <ImageLoader
            src={avatarUrl}
            alt="User avatar"
            width={96}
            height={96}
            className="object-cover w-full h-full rounded-full"
            priority
          />
        </div>

        <div className="mt-3 min-w-0 flex-1">
          <div
            className={clsx(
              "font-semibold text-primary-text text-lg sm:text-xl md:text-2xl",
              "cursor-pointer hover:text-[#7A4BD6] transition-colors truncate"
            )}
            onClick={openSolscan}
            title="View on Solscan"
          >
            {displayWalletFull}
          </div>

          <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold flex flex-wrap items-center gap-1 sm:gap-2">
            <span>Contract</span>
            <code
              className={clsx(
                "bg-white border border-[#e9defd] rounded-md px-1.5 sm:px-2 py-0.5",
                "text-[#5b3e9e] whitespace-nowrap cursor-pointer text-xs sm:text-sm",
                "hover:text-[#7A4BD6] hover:border-[#7A4BD6] transition-colors"
              )}
              onClick={openContractOnSolscan}
              title="View token on Solscan"
            >
              <span className="lg:hidden">{displayContractShort}</span>
              <span className="hidden lg:inline">{displayContractFull}</span>
            </code>
            <button
              onClick={copy}
              className={clsx(
                "p-1 rounded shrink-0 cursor-pointer",
                "hover:bg-[#efe7ff] text-[#5b3e9e]"
              )}
              aria-label="Copy contract"
              title="Copy"
            >
              <MdContentCopy className="text-sm" />
            </button>
            {copied && (
              <span className="text-primary-accent text-xs shrink-0">
                Copied!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start justify-end sm:justify-start gap-2 shrink-0">
        <button
          onClick={onHistoryClick}
          className={clsx(
            "sm:hidden p-2 rounded-lg bg-white border border-[#e9defd]",
            "text-[#5b3e9e] hover:bg-[#f7f2ff] transition-colors"
          )}
          aria-label="History"
          title="History"
        >
          <MdHistory className="text-lg" />
        </button>

        <button
          onClick={onHistoryClick}
          className={clsx(
            "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg",
            "bg-white border border-[#e9defd] text-[#5b3e9e] whitespace-nowrap",
            "hover:bg-[#f7f2ff] transition-colors"
          )}
        >
          <MdHistory className="text-base" />
          <span className="text-sm font-medium">History</span>
        </button>
      </div>
    </div>
  );
}
