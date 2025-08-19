import BreadCrumbs from "@/components/Breadcrumb";
import OptimizedImage from "@/components/OptimizedImage";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { BLOCKCHAIN_CONFIG } from "@/services";
import type { NFT } from "@/services/types";
import { BiStar } from "react-icons/bi";
import { motion } from "framer-motion";
import clsx from "clsx";
import { HiOutlineInformationCircle, HiViewGrid } from "react-icons/hi";
import { useLoading } from "@/providers/LoadingProvider";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

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

const NftDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [nft, setNft] = useState<NFT | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { showLoading, hideLoading } = useLoading();

  const openTokenOnSolscan = (tokenAddress: string) => {
    if (!tokenAddress) return;

    const isMainnet = BLOCKCHAIN_CONFIG.NETWORK === "mainnet";

    const url = `https://solscan.io/token/${tokenAddress}${
      isMainnet ? "" : "?cluster=devnet"
    }`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const loadNftDetails = async () => {
      if (!router.isReady || !id || typeof id !== "string") {
        hideLoading();
        return;
      }

      try {
        showLoading();
        setError(null);

        const connection = new Connection(BLOCKCHAIN_CONFIG.SOLANA_RPC);
        const metaplex = Metaplex.make(connection);

        const mint = new PublicKey(id);
        const asset = await metaplex.nfts().findByMint({ mintAddress: mint });

        const mintAddress = asset.mint.address.toString();
        const name = asset.name || "Unknown";
        let imageUrl = "";
        let description = "";
        let attributes: any = [];

        const uri = (asset as any).uri;
        if (uri) {
          try {
            const resp = await fetch(uri);
            const json = await resp.json();
            imageUrl = normalizeNftImageUrl(json.image || json.image_url || json?.properties?.files?.[0]?.uri);
            description = json.description || "";
            attributes = json.attributes || [];
          } catch {}
        }

        setNft({
          _id: mintAddress,
          walletAddress: "",
          nftAddress: mintAddress,
          name,
          imageUrl,
          description,
          attributes,
          createdAt: new Date().toISOString(),
        } as unknown as NFT);
      } catch (err) {
        console.error("❌ Error loading NFT details via Metaplex:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setNft(null);
      } finally {
        hideLoading();
      }
    };

    loadNftDetails();
  }, [router.isReady, id, showLoading, hideLoading]);

  if (error || !nft) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">NFT not found</h2>
        <p className="text-gray-600 mb-6">
          {error || "This NFT doesn't exist in your collection."}
        </p>
        <button
          onClick={() => (window.location.href = "/my-collection")}
          className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f2ecf6] py-8">
      <div className="main-container w-full">
        <BreadCrumbs
          breadcrumbs={[
            { href: "/my-collection", label: "My Collection" },
            { label: "NFT details" },
          ]}
        />

        <motion.h1
          className={clsx(
            "font-oxanium font-bold mb-4 mt-5 text-3xl md:text-5xl md:title-text",
            "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "var(--font-oxanium)",
          }}
        >
          {nft.name}
        </motion.h1>
        <div className="flex flex-col md:flex-row gap-6 items-start text-lg">
          {/* Left: Image + Info */}
          <div className="flex flex-col gap-4 w-full md:w-[340px] items-center">
            <OptimizedImage
              src={nft.imageUrl || "/file.svg"}
              alt={nft.name}
              width={260}
              height={260}
              className="rounded-xl object-contain w-full"
              unoptimized
              fallback="/file.svg"
            />
            {/* Backstory */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2 w-full">
              <HiOutlineInformationCircle size={20} />
              <div>
                <div className="font-bold mb-1">Backstory</div>
                <div className="text-lg">
                  {nft.description ||
                    `${nft.name} was born under the Moon of Whisker Hollow. Known
                  for its mysterious glow and trickster nature, this BELPY has a
                  hidden destiny linked to the lost Harmony Stone.`}
                </div>
              </div>
            </div>

            {/* Blockchain details */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2 w-full">
              <HiViewGrid size={20} />
              <div className="flex-1">
                <div className="font-bold mb-1">Blockchain details</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <strong>Token ID</strong> {nft.name}
                  </div>
                  <div className="flex justify-between gap-2">
                    <strong className="text-nowrap">Token Address</strong>
                    <span
                      className="cursor-pointer hover:text-[#7A4BD6] transition-colors"
                      onClick={() => openTokenOnSolscan(nft.nftAddress)}
                      title="View token on Solscan"
                    >
                      <span className="sm:hidden">
                        {nft.nftAddress.slice(0, 4)}...
                        {nft.nftAddress.slice(-4)}
                      </span>
                      <span className="hidden sm:inline">
                        {nft.nftAddress.slice(0, 8)}...
                        {nft.nftAddress.slice(-8)}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Token Standard</strong> NFT
                  </div>
                  <div className="flex justify-between">
                    <strong>Chain</strong> Solana
                  </div>
                  {nft.createdAt && (
                    <div className="flex justify-between">
                      <strong>Minted:</strong>{" "}
                      {new Date(nft.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Trait Info */}
          <div className="flex-1 flex flex-col gap-4">
            <button className="self-start px-6 py-2 rounded-xl bg-[#7a4bd6] text-white font-bold shadow text-base mb-2">
              GENESIS BELPY !
            </button>
            <div className="bg-[#E3CEF6] rounded-xl p-4">
              <div className="font-bold mb-2 flex items-center gap-2 text-base">
                <BiStar />
                Trait
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {nft.attributes
                  ?.filter((i: any) => i.value.toLowerCase() !== "none")
                  ?.map((trait: any) => (
                    <div
                      key={trait.trait_type}
                      className="bg-white rounded-lg px-3 pt-2 pb-1 text-sm flex flex-col items-start border border-[#e9defd]"
                    >
                      <p className="text-[#d3c0e4] font-semibold mb-[6px]">
                        {trait.trait_type}
                      </p>
                      <span className="text-base">{trait.value}</span>
                    </div>
                  )) || (
                  <div className="col-span-full text-center text-gray-500">
                    No traits available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftDetailPage;
