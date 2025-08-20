export function formatSol(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  return sol.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

export function shortenAddress({
  number = 4,
  addr,
}: {
  number?: number;
  addr?: string | null;
}): string {
  return addr
    ? addr.slice(0, number) + "..." + addr.slice(-number)
    : "Connect wallet";
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
