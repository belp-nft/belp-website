import { useCallback, useEffect, useRef, useState } from "react";
import { UserService, AuthService } from "@/services";

export function useSolflareProvider() {
  const [solflare, setSolflare] = useState<any>(null);
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
    const provider = (window as any).solflare;
    setSolflare(provider);
    if (provider?.publicKey) {
      setIsConnected(true);
      setPublicKey(provider.publicKey?.toString?.() || null);
    }
  }, []);

  useEffect(() => {
    if (!solflare?.on) return;
    const onConnect = () => {
      setIsConnected(true);
      setPublicKey(solflare.publicKey?.toString?.() || null);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setPublicKey(null);
    };
    solflare.on("connect", onConnect);
    solflare.on("disconnect", onDisconnect);
    connectRef.current = onConnect;
    disconnectRef.current = onDisconnect;
    return () => {
      if (connectRef.current) solflare.off("connect", connectRef.current);
      if (disconnectRef.current)
        solflare.off("disconnect", disconnectRef.current);
    };
  }, [solflare]);

  // Load user data từ backend
  const loadUserData = useCallback(async (walletAddress: string) => {
    try {
      console.log('📊 Loading user data for Solflare...', { walletAddress });
      
      // Load user statistics
      const statsResult = await UserService.getUserStatistics(walletAddress);
      if (statsResult.success && statsResult.data) {
        setUserStatistics(statsResult.data);
        console.log('✅ User statistics loaded:', statsResult.data);
      }

      // Load transaction history
      const txResult = await UserService.getTransactions(walletAddress, { limit: 50 });
      if (txResult.success && txResult.data) {
        setTransactions(txResult.data);
        console.log('✅ Transaction history loaded:', txResult.data.length, 'transactions');
      }
    } catch (error) {
      console.error('⚠️ Failed to load user data:', error);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!solflare) {
      window.open("https://solflare.com/download", "_blank");
      return null;
    }
    if (!solflare?.connect) return null;
    
    try {
      setLoading(true);
      console.log('🚀 Starting Solflare wallet connection...');
      
      // Bước 1: Kết nối với Solflare wallet
      const resp = await solflare.connect();
      const walletAddress = resp.publicKey?.toString?.() || null;
      
      if (!walletAddress) {
        throw new Error('Không thể lấy địa chỉ ví từ Solflare');
      }

      setIsConnected(true);
      setPublicKey(walletAddress);
      console.log('✅ Solflare connected:', walletAddress);

      // Bước 2: Authenticate với backend
      console.log('🔐 Authenticating with backend...');
      const connectResult = await UserService.connectWallet(walletAddress);

      if (!connectResult.success) {
        throw new Error(connectResult.message || 'Backend authentication failed');
      }

      // Bước 3: Lưu JWT token vào localStorage
      if ((connectResult as any).data?.accessToken) {
        AuthService.setToken((connectResult as any).data.accessToken);
        setAuthToken((connectResult as any).data.accessToken);
        console.log('🔑 JWT token saved to localStorage');
      } else {
        console.warn('⚠️ No JWT token received from backend');
      }

      // Bước 4: Load user data với JWT token
      await loadUserData(walletAddress);

      console.log('🎉 Solflare wallet connection successful!');
      return resp;
      
    } catch (error: any) {
      console.error('❌ Solflare connection failed:', error);
      
      // Cleanup nếu có lỗi
      setIsConnected(false);
      setPublicKey(null);
      setAuthToken(null);
      AuthService.removeToken();
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [solflare, loadUserData]);

  const disconnect = useCallback(async () => {
    if (!solflare?.disconnect) return;
    await solflare.disconnect();
    
    // Cleanup tất cả state và localStorage
    setIsConnected(false);
    setPublicKey(null);
    setAuthToken(null);
    setUserStatistics(null);
    setTransactions([]);
    AuthService.removeToken();
    
    console.log('🔌 Solflare wallet disconnected');
  }, [solflare]);

  return {
    solflare,
    isConnected,
    publicKey,
    loading,
    authToken,
    userStatistics,
    transactions,
    connect,
    disconnect,
    loadUserData,
  };
}
