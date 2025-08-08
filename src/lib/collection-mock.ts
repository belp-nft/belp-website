export type NftItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  likes: number;
};

export function makeMockItems(n = 20): NftItem[] {
  const imgs = [
    "/icons/token-nft-1.svg",
    "/icons/token-nft-2.svg",
    "/icons/token-nft-3.svg",
    "/icons/token-nft-4.svg",
    "/icons/token-nft-5.svg",
  ];
  return Array.from({ length: n }, (_, i) => ({
    id: `belpy-${i + 1}`,
    name: `BELPY #${String(i + 1).padStart(4, "0")}`,
    image: imgs[i % imgs.length],
    price: 10 + ((i * 7) % 25),
    likes: 20 + ((i * 11) % 120),
  }));
}
