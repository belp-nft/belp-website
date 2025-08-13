"use client";
import { formatNumber } from "@/lib/helpers/format-helpers";
import clsx from "clsx";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SiSolana } from "react-icons/si";

type Props = {
  label?: string;
  balance?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  isOpen?: boolean;
};

export default function WalletButton({
  label,
  balance,
  onClick,
  className,
  isOpen,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-fit font-bold text-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer",
        !label &&
          "bg-gradient-to-b from-[#F896FF] to-[#AE4DCE] py-2 px-8 rounded-2xl shadow-lg",
        className
      )}
      style={{ minWidth: 180 }}
    >
      {!!label && (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1C007C] mr-2 animate-fade-in">
          <SiSolana size={20} color="white" />
        </span>
      )}
      <div className="flex-1 flex flex-col">
        <span
          className={
            label ? "font-bold tracking-wide animate-fade-in" : "text-white"
          }
        >
          {label || "Connect wallet"}
        </span>
        {balance && (
          <span className="text-left text-sm font-normal">
            {formatNumber(balance)} SOL
          </span>
        )}
      </div>
      {!!label && (
        <span
          className={clsx(
            "ml-2 animate-fade-in transition-transform duration-500",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        >
          <MdKeyboardArrowDown size={22} />
        </span>
      )}
    </button>
  );
}
