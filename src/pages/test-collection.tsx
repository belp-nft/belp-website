import React, { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

interface NFTData {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  image?: string | null;
  uri?: string | null;
  owner: string;
  collection?: {
    address: string;
    name: string;
    verified: boolean;
  };
  attributes?: any[];
  creators?: any[];
  sellerFeeBasisPoints?: number;
  rawNft?: any;
}

const TestCollectionPage = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaplex, setMetaplex] = useState<Metaplex | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState(
    "71bczjoaeoNVrV7uiBCybx5MyTcdL9SPojDei7ug7vJ7"
  );

  // Initialize Metaplex
  useEffect(() => {
    const initMetaplex = async () => {
      try {
        const connection = new Connection(
          process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
          "confirmed"
        );

        const metaplexInstance = new Metaplex(connection);
        setMetaplex(metaplexInstance);
        console.log("✅ Metaplex initialized successfully");
      } catch (err) {
        console.error("❌ Failed to initialize Metaplex:", err);
        setError(`Failed to initialize Metaplex: ${err}`);
      }
    };

    initMetaplex();
  }, []);

  const loadWalletNfts = async () => {
    if (!metaplex) {
      setError("Metaplex not initialized");
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log("🔍 Fetching NFTs for wallet:", walletAddress);

      const walletKey = new PublicKey(walletAddress);

      // Get all NFTs owned by wallet
      const allNfts = await metaplex.nfts().findAllByOwner({
        owner: walletKey,
      });

      console.log(`📦 Found ${allNfts.length} NFTs in wallet`);

      // Store debug info
      setDebugInfo({
        walletAddress,
        totalNfts: allNfts.length,
        sampleNfts: allNfts.slice(0, 3).map((nft) => ({
          address: nft.address.toString(),
          name: nft.name,
          symbol: nft.symbol,
          uri: nft.uri,
          collection: nft.collection
            ? {
                address: nft.collection.address.toString(),
                verified: nft.collection.verified,
              }
            : null,
        })),
      });

      // Process NFTs with metadata
      const processedNfts: NFTData[] = await Promise.all(
        allNfts.slice(0, 50).map(async (nft: any, index: number) => {
          try {
            console.log(
              `📄 Processing NFT ${index + 1}/${Math.min(allNfts.length, 50)}: ${nft.name || "Unnamed"}`
            );

            let metadata = null;
            if (nft.uri) {
              try {
                console.log(`🔗 Fetching metadata from: ${nft.uri}`);
                const response = await fetch(nft.uri);
                if (response.ok) {
                  metadata = await response.json();
                  console.log(`✅ Metadata loaded for ${nft.name}`);
                } else {
                  console.warn(`⚠️ HTTP ${response.status} for ${nft.uri}`);
                }
              } catch (metaError) {
                console.warn(`⚠️ Failed to fetch metadata:`, metaError);
              }
            }

            return {
              id: nft.address.toString(),
              name: nft.name || metadata?.name || `NFT #${index + 1}`,
              symbol: nft.symbol || metadata?.symbol || "",
              description: metadata?.description || "No description available",
              image: metadata?.image || metadata?.image_url || null,
              uri: nft.uri || null,
              owner: walletAddress,
              collection: nft.collection
                ? {
                    address: nft.collection.address.toString(),
                    name: "Collection", // Collection name might not be available in basic fetch
                    verified: nft.collection.verified || false,
                  }
                : undefined,
              attributes: metadata?.attributes || [],
              creators: nft.creators || [],
              sellerFeeBasisPoints: nft.sellerFeeBasisPoints || 0,
              rawNft: {
                address: nft.address.toString(),
                name: nft.name,
                symbol: nft.symbol,
                uri: nft.uri,
                mint: nft.mint?.toString(),
                updateAuthority: nft.updateAuthority?.toString(),
                primarySaleHappened: nft.primarySaleHappened,
                isMutable: nft.isMutable,
              },
            };
          } catch (nftError) {
            console.error(`❌ Error processing NFT ${index}:`, nftError);
            return {
              id: nft.address?.toString() || `error-${index}`,
              name: `Error NFT #${index + 1}`,
              description: "Failed to process this NFT",
              image: null,
              uri: nft.uri || null,
              owner: walletAddress,
              attributes: [],
              creators: [],
              sellerFeeBasisPoints: 0,
            };
          }
        })
      );

      setNfts(processedNfts);
      console.log("✅ Successfully processed NFTs:", processedNfts.length);
    } catch (err) {
      console.error("❌ Error loading wallet NFTs:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#333", marginBottom: "20px" }}>
          🎨 NFT Wallet Viewer (Metaplex.js)
        </h1>

        {/* Wallet Input */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Wallet Address:
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "10px",
              fontSize: "14px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
            placeholder="Enter Solana wallet address..."
          />
        </div>

        {/* Load Button */}
        <button
          onClick={loadWalletNfts}
          disabled={loading || !metaplex || !walletAddress}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "🔄 Loading NFTs..." : "🔍 Load Wallet NFTs"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #ffcdd2",
          }}
        >
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#555", fontSize: "18px" }}>
            📊 Wallet Information
          </h2>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "5px",
              fontSize: "14px",
              border: "1px solid #e9ecef",
            }}
          >
            <div>
              <strong>Wallet:</strong> {debugInfo.walletAddress}
            </div>
            <div>
              <strong>Total NFTs Found:</strong> {debugInfo.totalNfts}
            </div>
            <div>
              <strong>Displayed:</strong> {Math.min(debugInfo.totalNfts, 50)}{" "}
              (limited to 50)
            </div>

            {debugInfo.sampleNfts && debugInfo.sampleNfts.length > 0 && (
              <details style={{ marginTop: "10px" }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                  🔍 Sample NFTs (First 3)
                </summary>
                <pre
                  style={{
                    fontSize: "12px",
                    overflow: "auto",
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "3px",
                    marginTop: "5px",
                  }}
                >
                  {JSON.stringify(debugInfo.sampleNfts, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* NFT Results */}
      {nfts.length > 0 && (
        <div>
          <h2 style={{ color: "#333", marginBottom: "20px" }}>
            🎨 Found {nfts.length} NFTs
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {nfts.map((nft, index) => (
              <div
                key={nft.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "20px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {/* NFT Image */}
                {nft.image && (
                  <div style={{ marginBottom: "15px" }}>
                    <img
                      src={nft.image}
                      alt={nft.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                      }}
                      onError={(e) => {
                        console.warn(`Failed to load image for ${nft.name}`);
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* NFT Info */}
                <div>
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "18px",
                      color: "#333",
                    }}
                  >
                    {nft.name}
                  </h3>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      lineHeight: "1.5",
                    }}
                  >
                    {nft.symbol && (
                      <div>
                        <strong>Symbol:</strong> {nft.symbol}
                      </div>
                    )}

                    <div>
                      <strong>ID:</strong> {nft.id.slice(0, 16)}...
                    </div>

                    {nft.collection && (
                      <div>
                        <strong>Collection:</strong> {nft.collection.name}
                        {nft.collection.verified && (
                          <span style={{ color: "#4CAF50" }}> ✓</span>
                        )}
                      </div>
                    )}

                    {nft.description && (
                      <div style={{ marginTop: "10px" }}>
                        <strong>Description:</strong>
                        <div
                          style={{
                            marginTop: "5px",
                            fontSize: "13px",
                            maxHeight: "60px",
                            overflow: "hidden",
                          }}
                        >
                          {nft.description}
                        </div>
                      </div>
                    )}

                    {/* Attributes */}
                    {nft.attributes && nft.attributes.length > 0 && (
                      <details style={{ marginTop: "10px" }}>
                        <summary
                          style={{ cursor: "pointer", fontWeight: "bold" }}
                        >
                          📋 Attributes ({nft.attributes.length})
                        </summary>
                        <div
                          style={{
                            marginTop: "8px",
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(120px, 1fr))",
                            gap: "5px",
                          }}
                        >
                          {nft.attributes
                            .slice(0, 8)
                            .map((attr: any, i: number) => (
                              <div
                                key={i}
                                style={{
                                  fontSize: "12px",
                                  backgroundColor: "#f8f9fa",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    color: "#495057",
                                  }}
                                >
                                  {attr.trait_type}
                                </div>
                                <div style={{ color: "#6c757d" }}>
                                  {attr.value}
                                </div>
                              </div>
                            ))}
                        </div>
                      </details>
                    )}

                    {/* Links */}
                    <div
                      style={{
                        marginTop: "15px",
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      {nft.uri && (
                        <a
                          href={nft.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "12px",
                            color: "#007acc",
                            textDecoration: "none",
                            padding: "4px 8px",
                            backgroundColor: "#e3f2fd",
                            borderRadius: "4px",
                          }}
                        >
                          🔗 Metadata
                        </a>
                      )}

                      <a
                        href={`https://solscan.io/token/${nft.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#8e24aa",
                          textDecoration: "none",
                          padding: "4px 8px",
                          backgroundColor: "#f3e5f5",
                          borderRadius: "4px",
                        }}
                      >
                        🔍 Solscan
                      </a>
                    </div>

                    {/* Technical Details */}
                    <details style={{ marginTop: "10px" }}>
                      <summary
                        style={{
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "#888",
                        }}
                      >
                        🔧 Technical Details
                      </summary>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          marginTop: "5px",
                        }}
                      >
                        <div>
                          <strong>Seller Fee:</strong>{" "}
                          {(nft.sellerFeeBasisPoints || 0) / 100}%
                        </div>
                        <div>
                          <strong>Creators:</strong> {nft.creators?.length || 0}
                        </div>
                        <div>
                          <strong>Full Address:</strong> {nft.id}
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && nfts.length === 0 && debugInfo && (
        <div
          style={{
            padding: "40px",
            backgroundColor: "#fff3e0",
            color: "#ef6c00",
            borderRadius: "10px",
            textAlign: "center",
            border: "1px solid #ffcc02",
          }}
        >
          <h3>📭 No NFTs Found</h3>
          <p>
            This wallet doesn't contain any NFTs, or they couldn't be loaded.
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Wallet: {walletAddress}
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "50px",
          fontSize: "14px",
          color: "#888",
          textAlign: "center",
        }}
      >
        <p>
          🔧 Using Metaplex JavaScript SDK | Status:{" "}
          {metaplex ? "✅ Connected" : "❌ Disconnected"} | Network: Mainnet
        </p>
      </div>
    </div>
  );
};

export default TestCollectionPage;
