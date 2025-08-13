"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MdContentCopy, MdHistory } from "react-icons/md";

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
  const [imgErr, setImgErr] = useState(false);

  const displayWalletFull = walletAddress ?? "—";
  const displayWalletShort = useMemo(
    () => shortenMiddle(displayWalletFull, 6, 6),
    [displayWalletFull]
  );

  const displayContractFull = contract ?? "—";
  const displayContractShort = useMemo(
    () => shortenMiddle(displayContractFull, 6, 6),
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

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 rounded-full bg-[#ede4ff] grid place-content-center overflow-hidden w-10 h-10 sm:w-12 sm:h-12">
          <Image
            src={
              imgErr || !walletAddress
                ? "/avatars/user-placeholder.svg"
                : `https://cdn.stamp.fyi/avatar/${walletAddress}?s=96`
            }
            alt="User avatar"
            width={48}
            height={48}
            className="object-cover w-full h-full"
            onError={() => setImgErr(true)}
            priority
          />
        </div>

        <div className="min-w-0">
          <div className="font-semibold text-primary-text truncate">
            <span className="sm:hidden">{displayWalletShort}</span>
            <span className="hidden sm:inline">{displayWalletFull}</span>
          </div>

          <div className="mt-0.5 text-sm text-[#7466a1] flex items-center gap-2">
            <span className="shrink-0">Contract</span>
            <code className="bg-white border border-[#e9defd] rounded-md px-2 py-0.5 text-[#5b3e9e] whitespace-nowrap">
              <span className="sm:hidden">{displayContractShort}</span>
              <span className="hidden sm:inline">{displayContractFull}</span>
            </code>
            <button
              onClick={copy}
              className="p-1 rounded hover:bg-[#efe7ff] text-[#5b3e9e] shrink-0 cursor-pointer"
              aria-label="Copy contract"
              title="Copy"
            >
              <MdContentCopy />
            </button>
            {copied && (
              <span className="text-primary-accent text-xs shrink-0">
                Copied!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={onHistoryClick}
          className="sm:hidden p-2 rounded-lg bg-white border border-[#e9defd] text-[#5b3e9e] hover:bg-[#f7f2ff] cursor-pointer"
          aria-label="History"
          title="History"
        >
          <MdHistory />
        </button>

        <button
          onClick={onHistoryClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#e9defd] text-[#5b3e9e] hover:bg-[#f7f2ff] cursor-pointer"
        >
          <MdHistory /> History
        </button>
      </div>
    </div>
  );
}
