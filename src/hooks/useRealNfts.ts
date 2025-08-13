import { useState, useEffect, useCallback } from "react";
import { UserService, AuthService } from "@/services";

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

export function useRealNfts(walletAddress?: string | null) {
  const [nfts, setNfts] = useState<RealNftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendNfts, setBackendNfts] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadBackendNfts = useCallback(async () => {
    if (!walletAddress || !AuthService.hasToken()) {
      setBackendNfts([]);
      return;
    }

    try {
      setSyncing(true);
      console.log("Loading NFTs from backend...", { walletAddress });

      const result = await UserService.getNfts(walletAddress, { limit: 100 });
      if (result.success && result.data) {
        setBackendNfts(result.data);
        console.log("✅ Backend NFTs loaded:", result.data.length, "NFTs");
      } else {
        setBackendNfts([]);
      }
    } catch (error) {
      console.error("⚠️ Failed to load NFTs from backend:", error);
      setBackendNfts([]);
    } finally {
      setSyncing(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    const loadLocalNfts = () => {
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

    loadLocalNfts();

    // Listen for storage changes (when new NFTs are minted)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mintedNfts") {
        loadLocalNfts();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    loadBackendNfts();
  }, [loadBackendNfts]);

  const addNft = useCallback(
    async (nft: RealNftItem) => {
      const updatedNfts = [...nfts, nft];
      setNfts(updatedNfts);
      localStorage.setItem("mintedNfts", JSON.stringify(updatedNfts));

      if (walletAddress && nft.mintSignature) {
        try {
          console.log("Saving NFT to backend...", { nft, walletAddress });

          await UserService.saveTransaction({
            walletAddress,
            transactionSignature: nft.mintSignature,
            candyMachineAddress: nft.id,
            timestamp: nft.mintedAt || new Date().toISOString(),
          });

          console.log("NFT saved to backend");

          await loadBackendNfts();
        } catch (error) {
          console.error("Failed to save NFT to backend:", error);
        }
      }
    },
    [nfts, walletAddress, loadBackendNfts]
  );

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
    backendNfts,
    loading,
    syncing,
    addNft,
    removeNft,
    getNftById,
    loadBackendNfts,
    totalCount: nfts.length,
    backendCount: backendNfts.length,
  };
}
