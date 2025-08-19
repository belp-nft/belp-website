import { useCallback, useEffect, useRef, useState } from "react";
import { UserService, AuthService } from "@/services";

export function usePhantomProvider() {
  const [phantom, setPhantom] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const connectRef = useRef<((...args: any[]) => void) | null>(null);
  const disconnectRef = useRef<((...args: any[]) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check multiple provider locations for better detection
    const provider =
      window.solana ||
      (window as any).phantom?.solana ||
      (window as any).phantom;

    setPhantom(provider);
    if (provider?.publicKey) {
      setIsConnected(true);
      setPublicKey(provider.publicKey?.toString?.() || null);
    }
  }, []);

  useEffect(() => {
    if (!phantom?.on) return;
    const onConnect = () => {
      setIsConnected(true);
      setPublicKey(phantom.publicKey?.toString?.() || null);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setPublicKey(null);
    };
    phantom.on("connect", onConnect);
    phantom.on("disconnect", onDisconnect);
    connectRef.current = onConnect;
    disconnectRef.current = onDisconnect;
    return () => {
      if (connectRef.current) phantom.off("connect", connectRef.current);
      if (disconnectRef.current)
        phantom.off("disconnect", disconnectRef.current);
    };
  }, [phantom]);

  const connect = useCallback(async () => {
    if (!phantom?.connect) {
      const currentUrl = window.location.href;
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        // Mobile: Try deep link to Phantom app first
        const deepLink = `https://phantom.app/ul/browse/${encodeURIComponent(
          currentUrl
        )}?ref=belp`;
        // console.log("Trying mobile deep link:", deepLink);

        // Redirect to Phantom app
        window.location.href = deepLink;

        // Fallback: Open app store after delay
        setTimeout(() => {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const storeUrl = isIOS
            ? "https://apps.apple.com/app/phantom-solana-wallet/1598432977"
            : "https://play.google.com/store/apps/details?id=app.phantom";
          window.open(storeUrl, "_blank");
        }, 3000);
      } else {
        // Desktop: Open extension download page with return URL
        const downloadUrl = `https://phantom.app/download?utm_source=belp&utm_medium=web&return_url=${encodeURIComponent(
          currentUrl
        )}`;
        window.open(downloadUrl, "_blank");
      }
      return null;
    }

    try {
      setLoading(true);
      // console.log("Starting Phantom wallet connection...");

      // Connect to Phantom wallet
      const resp = await phantom.connect();
      const walletAddress = resp.publicKey?.toString?.() || null;

      if (!walletAddress) {
        throw new Error("Failed to get wallet address");
      }

      setIsConnected(true);
      setPublicKey(walletAddress);
      // console.log("Phantom connected:", walletAddress);

      // Authenticate with backend
      // console.log("Authenticating with backend...");
      const connectResult = await UserService.connectWallet(walletAddress);

      if (!connectResult.success) {
        throw new Error(
          connectResult.message || "Backend authentication failed"
        );
      }

      // Save JWT token to localStorage
      if ((connectResult as any).data?.accessToken) {
        AuthService.setToken((connectResult as any).data.accessToken);
        setAuthToken((connectResult as any).data.accessToken);
        // console.log("JWT token saved");
      } else {
        console.warn("No JWT token received from backend");
      }

      // console.log("Phantom wallet connection successful!");
      return resp;
    } catch (error: any) {
      console.error("Phantom connection failed:", error);

      // Cleanup on error
      setIsConnected(false);
      setPublicKey(null);
      setAuthToken(null);
      AuthService.removeToken();

      // Handle specific errors
      if (error.message?.includes("User rejected") || error.code === 4001) {
        // console.log("User cancelled the connection");
      } else if (error.code === -32002) {
        alert(
          "Connection request is already pending. Please check your Phantom wallet."
        );
      } else {
        alert(
          `Connection failed: ${
            error.message || "Unknown error"
          }. Please try again.`
        );
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [phantom]);

  const disconnect = useCallback(async () => {
    try {
      if (phantom?.disconnect) {
        await phantom.disconnect();
      }

      // Cleanup tất cả state và localStorage
      setIsConnected(false);
      setPublicKey(null);
      setAuthToken(null);
      setUserStatistics(null);
      setTransactions([]);
      AuthService.removeToken();

      // console.log("Phantom wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting phantom:", error);
    }
  }, [phantom]);

  const autoConnect = useCallback(async () => {
    if (!phantom?.isConnected || !phantom?.publicKey) return null;

    try {
      // Try connect with onlyIfTrusted
      const response = await phantom.connect({ onlyIfTrusted: true });
      const walletAddress = response.publicKey.toString();

      setIsConnected(true);
      setPublicKey(walletAddress);
      // console.log("Auto-connect successful:", walletAddress);

      // Authenticate with backend
      const connectResult = await UserService.connectWallet(walletAddress);

      if (connectResult.success && (connectResult as any).data?.accessToken) {
        AuthService.setToken((connectResult as any).data.accessToken);
        setAuthToken((connectResult as any).data.accessToken);

        return response;
      }
    } catch (error) {
      // console.log("Auto-connect failed, user needs to manually connect");
    }

    return null;
  }, [phantom]);

  return {
    phantom,
    isConnected,
    publicKey,
    loading,
    authToken,
    userStatistics,
    transactions,
    connect,
    disconnect,
    autoConnect,
  };
}
