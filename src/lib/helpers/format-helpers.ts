import "moment/locale/vi";

export function formatNumber(
  number: number | bigint | string | undefined,
  maximumFractionDigits: number = 2
): string {
  if (!number) return "0";

  let cleanNumber = number.toString().replace(/,/g, ".");

  return new Intl.NumberFormat("en", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(parseFloat(cleanNumber));
}
