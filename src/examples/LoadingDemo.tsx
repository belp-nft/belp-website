import React, { useState } from "react";
import PageLoading from "@/components/PageLoading";
import { useLoading } from "@/providers/LoadingProvider";

const LoadingDemo: React.FC = () => {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const [localLoading, setLocalLoading] = useState<string | null>(null);

  const variants = [
    { key: "default", label: "Default Loading", message: "Processing..." },
    { key: "nft", label: "NFT Loading", message: "Loading your collection" },
    { key: "mint", label: "Mint Loading", message: "Preparing to mint" },
    { key: "wallet", label: "Wallet Loading", message: "Connecting wallet" },
  ] as const;

  const sizes = [
    { key: "sm", label: "Small" },
    { key: "md", label: "Medium" },
    { key: "lg", label: "Large" },
  ] as const;

  const handleGlobalLoading = () => {
    showLoading();

    setTimeout(() => {
      hideLoading();
    }, 3000);
  };

  const handleLocalLoading = (variant: string) => {
    setLocalLoading(variant);

    setTimeout(() => {
      setLocalLoading(null);
    }, 3000);
  };

  if (localLoading) {
    return <PageLoading size="md" />;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Loading Components Demo
        </h1>

        {/* Global Loading Tests */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Global Loading (Full Screen Overlay)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {variants.map((variant) => (
              <button
                key={variant.key}
                onClick={handleGlobalLoading}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {variant.label}
              </button>
            ))}
          </div>
          {isLoading && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
              Global loading is active (will auto-hide in 3 seconds)
            </div>
          )}
        </div>

        {/* Local Loading Tests */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Local Loading (Page Replacement)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {variants.map((variant) => (
              <button
                key={variant.key}
                onClick={() => handleLocalLoading(variant.key)}
                disabled={!!localLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size Variants Preview */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Size Variants Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sizes.map((size) => (
              <div key={size.key} className="text-center">
                <h3 className="font-medium mb-4 capitalize">
                  {size.label} Size
                </h3>
                <div className="bg-gradient-to-br from-[#f8f4ff] via-white to-[#f0e6ff] rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`relative mx-auto mb-4 ${
                        size.key === "sm"
                          ? "w-16 h-16"
                          : size.key === "md"
                          ? "w-20 h-20"
                          : "w-24 h-24"
                      }`}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#F356FF] to-[#AE4DCE] p-1">
                        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                          <span
                            className={
                              size.key === "sm"
                                ? "text-xl"
                                : size.key === "md"
                                ? "text-2xl"
                                : "text-3xl"
                            }
                          >
                            🎨
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-bold text-primary-text mb-2 ${
                        size.key === "sm"
                          ? "text-lg"
                          : size.key === "md"
                          ? "text-2xl"
                          : "text-3xl"
                      }`}
                    >
                      Loading
                    </div>
                    <div className="flex justify-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`bg-[#7A4BD6] rounded-full ${
                            size.key === "sm"
                              ? "w-1.5 h-1.5"
                              : size.key === "md"
                              ? "w-2 h-2"
                              : "w-3 h-3"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-lg p-6 mt-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                Global Loading (Full Screen)
              </h3>
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {`const { showLoading, hideLoading } = useLoading();

// Show loading
showLoading("Processing transaction...");

// Hide loading
hideLoading();`}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Local Page Loading</h3>
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {`if (loading) {
  return <PageLoading variant="nft" message="Loading collection" size="md" />;
}`}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Custom Loading</h3>
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {`<PageLoading 
  variant="mint" 
  message="Minting your NFT..." 
  icon="🚀"
  size="lg" 
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;
