"use client";
import Image from "next/image";
import Spinner from "./Spinner";

type Props = {
  logo: { src: string; alt: string; width?: number; height?: number };
  title: string;
  subtitle?: string;
  onClick: () => void;
  loading?: boolean;
  installedHint?: string | null;
};

export default function ProviderRow({
  logo,
  title,
  subtitle,
  onClick,
  loading,
  installedHint,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={!!loading}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#f2eaff] border border-[#e6d9ff] transition disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
    >
      {logo.src.startsWith("http") ? (
        // với link remote
        <img src={logo.src} alt={logo.alt} className="w-8 h-8" />
      ) : (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width ?? 32}
          height={logo.height ?? 32}
        />
      )}

      <div className="flex-1 text-left">
        <div className="font-semibold text-[#411A7A]">{title}</div>
        {subtitle && <div className="text-xs text-[#6B6475]">{subtitle}</div>}
      </div>

      {installedHint && (
        <span className="text-xs text-[#B24DFF]">{installedHint}</span>
      )}
      {loading && <Spinner className="ml-2" />}
    </button>
  );
}
