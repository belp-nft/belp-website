"use client";
import Image from "next/image";
import { useState } from "react";
import { MdContentCopy, MdHistory } from "react-icons/md";

type Props = {
  username: string;
  contract: string;
  onHistoryClick?: () => void;
};

export default function UserInfo({
  username,
  contract,
  onHistoryClick,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="w-full flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#ede4ff] grid place-content-center">
          <Image
            src="/avatars/user-placeholder.svg"
            alt=""
            width={28}
            height={28}
          />
        </div>
        <div>
          <div className="font-semibold text-[#2b1a5e]">{username}</div>
          <div className="text-sm text-[#7466a1] flex items-center gap-2">
            <span>Contract</span>
            <code className="bg-white border border-[#e9defd] rounded-md px-2 py-0.5 text-[#5b3e9e]">
              {contract}
            </code>
            <button
              onClick={copy}
              className="p-1 rounded hover:bg-[#efe7ff] text-[#5b3e9e]"
              aria-label="Copy contract"
              title="Copy"
            >
              <MdContentCopy />
            </button>
            {copied && <span className="text-[#7a4bd6] text-xs">Copied!</span>}
          </div>
        </div>
      </div>

      <button
        onClick={onHistoryClick}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#e9defd] text-[#5b3e9e] hover:bg-[#f7f2ff]"
      >
        <MdHistory /> History
      </button>
    </div>
  );
}
