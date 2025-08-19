import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import UserInfo from "@/modules/my-collection//UserInfo";
import { useWallet } from "@/hooks/useWallet";
import type { NFT } from "@/services/types";
import NftGrid from "@/modules/my-collection//NftGrid";
import { useLoading } from "@/providers/LoadingProvider";
import { useCollectionAddress } from "@/stores/config";
import { themeClasses } from "@/providers/ThemeProvider";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { BLOCKCHAIN_CONFIG } from "@/services";

function normalizeNftImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
  }
  if (url.startsWith("ar://")) {
    return `https://arweave.net/${url.replace("ar://", "")}`;
  }
  return url;
}

const MyCollectionPage = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(20);
  const router = useRouter();

  const { solAddress } = useWallet();
  const { showLoading, hideLoading } = useLoading();

  const collectionAddress = useCollectionAddress();

  const items = nfts.slice(0, visible);
  const totalCount = nfts.length;

  const handleHistoryClick = () => {
    router.push("/my-collection/history");
  };

  useEffect(() => {
    const loadNfts = async () => {
      if (!solAddress) {
        return;
      }

      try {
        setError(null);
        showLoading();

        const connection = new Connection(BLOCKCHAIN_CONFIG.SOLANA_RPC);
        const metaplex = Metaplex.make(connection);

        const owner = new PublicKey(solAddress);
        const all = await metaplex.nfts().findAllByOwner({ owner });

        const detailed: NFT[] = [];
        for (const item of all) {
          try {
            const mintAddress = (item as any).mintAddress?.toString?.() || (item as any).mint?.address?.toString?.();
            const name = (item as any).name || "Unknown";
            let imageUrl = "";
            let description = "";
            let attributes: any = [];

            const uri = (item as any).uri;
            if (uri) {
              try {
                const resp = await fetch(uri);
                const json = await resp.json();
                imageUrl = normalizeNftImageUrl(json.image || json.image_url || json?.properties?.files?.[0]?.uri);
                description = json.description || "";
                attributes = json.attributes || [];
              } catch {}
            }

            if (mintAddress) {
              detailed.push({
                _id: mintAddress,
                walletAddress: solAddress,
                nftAddress: mintAddress,
                name,
                imageUrl,
                description,
                attributes,
                createdAt: new Date().toISOString(),
              } as unknown as NFT);
            }
          } catch {}
        }

        setNfts(detailed);
      } catch (err) {
        console.error("❌ Error loading NFTs via Metaplex:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setNfts([]);
      } finally {
        hideLoading();
      }
    };

    loadNfts();
  }, [solAddress, showLoading, hideLoading]);

  return (
    <main className={clsx("min-h-screen", themeClasses.bg.page)}>
      <section className="relative w-full h-[414px] overflow-hidden">
        <Image
          src="/images/my-collection/collection-banner.png"
          alt="banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/60 pointer-events-none z-0" />
      </section>

      <section className="main-container mt-4">
        <UserInfo
          contract={collectionAddress || ""}
          walletAddress={solAddress || undefined}
          onHistoryClick={handleHistoryClick}
        />
      </section>

      <section className="main-container pt-5 md:pt-10 pb-20">
        {totalCount === 0 ? (
          <div className="text-center flex flex-col items-center pb-12">
            <Image
              src="/images/mint/random-cat.svg"
              width={200}
              height={200}
              alt="Random Cat"
              className="opacity-50"
            />

            <h3 className={clsx("text-xl font-semibold my-2")}>
              No NFTs in your collection yet
            </h3>
            <p className={clsx("mb-6")}>
              Collect your first BELPY and watch your gallery grow.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "px-6 py-3 font-semibold rounded-2xl cursor-pointer",
                themeClasses.button.gradient
              )}
              onClick={() => (window.location.href = "/mint")}
            >
              Mint Your First BELPY
            </motion.button>
          </div>
        ) : (
          <>
            <div className="text-right text-xs text-primary-muted mb-2">
              {totalCount} Items
            </div>

            <NftGrid items={items} />

            {visible < totalCount && (
              <div className="flex justify-center py-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "px-8 py-3 rounded-2xl font-semibold shadow-md hover:shadow-lg transition cursor-pointer",
                    themeClasses.button.accent
                  )}
                  onClick={() =>
                    setVisible((v) => Math.min(v + 20, totalCount))
                  }
                >
                  See more
                </motion.button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default MyCollectionPage;
