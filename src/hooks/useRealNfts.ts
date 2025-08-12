import { useState, useEffect } from "react";

export interface RealNftItem {
  id: string;
  name: string;
  image: string;
  price?: number;
  likes?: number;
  mintSignature?: string;
  mintedAt?: string;
  uri?: string;
}

export function useRealNfts() {
  const [nfts, setNfts] = useState<RealNftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNfts = () => {
      try {
        const mintedNfts = localStorage.getItem("mintedNfts");
        if (mintedNfts) {
          const parsedNfts = JSON.parse(mintedNfts) as RealNftItem[];
          setNfts(parsedNfts);
        } else {
          setNfts([]);
        }
      } catch (error) {
        console.error("Error loading NFTs from localStorage:", error);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    loadNfts();

    // Listen for storage changes (when new NFTs are minted)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mintedNfts") {
        loadNfts();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addNft = (nft: RealNftItem) => {
    const updatedNfts = [...nfts, nft];
    setNfts(updatedNfts);
    localStorage.setItem("mintedNfts", JSON.stringify(updatedNfts));
  };

  const removeNft = (id: string) => {
    const updatedNfts = nfts.filter((nft) => nft.id !== id);
    setNfts(updatedNfts);
    localStorage.setItem("mintedNfts", JSON.stringify(updatedNfts));
  };

  const getNftById = (id: string) => {
    return nfts.find((nft) => nft.id === id);
  };

  return {
    nfts,
    loading,
    addNft,
    removeNft,
    getNftById,
    totalCount: nfts.length,
  };
}
