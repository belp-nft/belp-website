import "moment/locale/vi";

export function formatNumber(
  number: number | bigint | string | undefined,
  maximumFractionDigits: number = 2
): string {
  if (!number) return "0";

  return new Intl.NumberFormat("en", {
    maximumFractionDigits,

    // @ts-ignore
    roundingMode: "floor",
  }).format(parseFloat(number as string));
}
