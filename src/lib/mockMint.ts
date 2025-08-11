export interface MockMintResult {
  success: boolean;
  nft?: {
    address: string;
    name: string;
    image: string;
    uri: string;
  };
  signature?: string;
  error?: string;
}

export async function mockMintBelpyNFT(): Promise<MockMintResult> {
  console.log("Mock mint started...");

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Random success/failure for testing
  const shouldSucceed = Math.random() > 0.1; // 90% success rate

  if (!shouldSucceed) {
    return {
      success: false,
      error: "Mock error: Network simulation failed",
    };
  }

  const nftId = `#${String(Math.floor(Math.random() * 9999) + 1).padStart(
    4,
    "0"
  )}`;
  const cats = [
    "token-nft-1.svg",
    "token-nft-2.svg",
    "token-nft-3.svg",
    "token-nft-4.svg",
  ];
  const randomCat = cats[Math.floor(Math.random() * cats.length)];

  const mockAddress = `mock${Date.now()}${Math.floor(Math.random() * 1000)}`;

  console.log("Mock mint successful!");

  return {
    success: true,
    nft: {
      address: mockAddress,
      name: `BELPY ${nftId}`,
      image: `/icons/${randomCat}`,
      uri: `https://mock-arweave.net/${mockAddress}`,
    },
    signature: `mock_signature_${Date.now()}`,
  };
}
