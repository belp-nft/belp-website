import { useCallback, useEffect, useRef, useState } from "react";
import { UserService, AuthService } from "@/services";

export function useOKXProvider() {
  const [okx, setOKX] = useState<any>(null);
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
    const provider = (window as any).okxwallet;
    setOKX(provider);
    if (provider?.publicKey) {
      setIsConnected(true);
      setPublicKey(provider.publicKey?.toString?.() || null);
    }
  }, []);

  useEffect(() => {
    if (!okx?.on) return;
    const onConnect = () => {
      setIsConnected(true);
      setPublicKey(okx.publicKey?.toString?.() || null);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setPublicKey(null);
    };
    okx.on("connect", onConnect);
    okx.on("disconnect", onDisconnect);
    connectRef.current = onConnect;
    disconnectRef.current = onDisconnect;
    return () => {
      if (connectRef.current) okx.off("connect", connectRef.current);
      if (disconnectRef.current) okx.off("disconnect", disconnectRef.current);
    };
  }, [okx]);

  const connect = useCallback(async () => {
    if (!okx) {
      window.open("https://www.okx.com/web3", "_blank");
      return null;
    }
    if (!okx?.connect) return null;

    try {
      setLoading(true);
      // console.log('🚀 Starting OKX wallet connection...');

      // Bước 1: Kết nối với OKX wallet
      const resp = await okx.connect();
      const walletAddress = resp.publicKey?.toString?.() || null;

      if (!walletAddress) {
        throw new Error("Không thể lấy địa chỉ ví từ OKX");
      }

      setIsConnected(true);
      setPublicKey(walletAddress);
      // console.log('✅ OKX connected:', walletAddress);

      // Bước 2: Authenticate với backend
      // console.log('🔐 Authenticating with backend...');
      const connectResult = await UserService.connectWallet(walletAddress);

      if (!connectResult.success) {
        throw new Error(
          connectResult.message || "Backend authentication failed"
        );
      }

      // Bước 3: Lưu JWT token vào localStorage
      if ((connectResult as any).data?.accessToken) {
        AuthService.setToken((connectResult as any).data.accessToken);
        setAuthToken((connectResult as any).data.accessToken);
        // console.log('🔑 JWT token saved to localStorage');
      } else {
        console.warn("⚠️ No JWT token received from backend");
      }

      // console.log('🎉 OKX wallet connection successful!');
      return resp;
    } catch (error: any) {
      console.error("❌ OKX connection failed:", error);

      // Cleanup nếu có lỗi
      setIsConnected(false);
      setPublicKey(null);
      setAuthToken(null);
      AuthService.removeToken();

      throw error;
    } finally {
      setLoading(false);
    }
  }, [okx]);

  const disconnect = useCallback(async () => {
    if (!okx?.disconnect) return;
    await okx.disconnect();

    // Cleanup tất cả state và localStorage
    setIsConnected(false);
    setPublicKey(null);
    setAuthToken(null);
    setUserStatistics(null);
    setTransactions([]);
    AuthService.removeToken();

    // console.log('🔌 OKX wallet disconnected');
  }, [okx]);

  return {
    okx,
    isConnected,
    publicKey,
    loading,
    authToken,
    userStatistics,
    transactions,
    connect,
    disconnect,
  };
}
