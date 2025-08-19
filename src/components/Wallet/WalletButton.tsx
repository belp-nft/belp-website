"use client";
import { formatNumber } from "@/lib/helpers/format-helpers";
import clsx from "clsx";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SiSolana } from "react-icons/si";

type Props = {
  label?: string;
  balance?: string;
  loadingBalance?: boolean;
  isConnecting?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  isOpen?: boolean;
};

export default function WalletButton({
  label,
  balance,
  loadingBalance = false,
  isConnecting = false,
  onClick,
  className,
  isOpen,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-fit font-bold sm:text-responsive-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer",
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
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Connecting...
            </div>
          ) : (
            label || "Connect wallet"
          )}
        </span>
        {(balance || loadingBalance) && (
          <span className="text-left text-sm font-normal flex items-center gap-1">
            {loadingBalance ? (
              <div className="flex gap-1 items-center">
                <svg
                  className="animate-spin h-3 w-3 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>{" "}
                SOL
              </div>
            ) : (
              `${formatNumber(balance)} SOL`
            )}
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
