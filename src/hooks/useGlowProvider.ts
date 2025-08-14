import { useCallback, useEffect, useRef, useState } from "react";
import { UserService, AuthService } from "@/services";

export function useGlowProvider() {
  const [glow, setGlow] = useState<any>(null);
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
    const provider = (window as any).glow;
    setGlow(provider);
    if (provider?.publicKey) {
      setIsConnected(true);
      setPublicKey(provider.publicKey?.toString?.() || null);
    }
  }, []);

  useEffect(() => {
    if (!glow?.on) return;
    const onConnect = () => {
      setIsConnected(true);
      setPublicKey(glow.publicKey?.toString?.() || null);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setPublicKey(null);
    };
    glow.on("connect", onConnect);
    glow.on("disconnect", onDisconnect);
    connectRef.current = onConnect;
    disconnectRef.current = onDisconnect;
    return () => {
      if (connectRef.current) glow.off("connect", connectRef.current);
      if (disconnectRef.current) glow.off("disconnect", disconnectRef.current);
    };
  }, [glow]);

  // Load user data từ backend
  const loadUserData = useCallback(async (walletAddress: string) => {
    try {
      console.log('📊 Loading user data for Glow...', { walletAddress });
      
      // Load user statistics
      const statsResult = await UserService.getUserStatistics();
      if (statsResult.success && statsResult.data) {
        setUserStatistics(statsResult.data);
        console.log('✅ User statistics loaded:', statsResult.data);
      }

      // Load transaction history
      const txResult = await UserService.getTransactions({ limit: 50 });
      if (txResult.success && txResult.data) {
        setTransactions(txResult.data);
        console.log('✅ Transaction history loaded:', txResult.data.length, 'transactions');
      }
    } catch (error) {
      console.error('⚠️ Failed to load user data:', error);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!glow) {
      window.open("https://glow.app/", "_blank");
      return null;
    }
    if (!glow?.connect) return null;
    
    try {
      setLoading(true);
      console.log('🚀 Starting Glow wallet connection...');
      
      // Bước 1: Kết nối với Glow wallet
      const resp = await glow.connect();
      const walletAddress = resp.publicKey?.toString?.() || null;
      
      if (!walletAddress) {
        throw new Error('Không thể lấy địa chỉ ví từ Glow');
      }

      setIsConnected(true);
      setPublicKey(walletAddress);
      console.log('✅ Glow connected:', walletAddress);

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

      console.log('🎉 Glow wallet connection successful!');
      return resp;
      
    } catch (error: any) {
      console.error('❌ Glow connection failed:', error);
      
      // Cleanup nếu có lỗi
      setIsConnected(false);
      setPublicKey(null);
      setAuthToken(null);
      AuthService.removeToken();
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [glow, loadUserData]);

  const disconnect = useCallback(async () => {
    if (!glow?.disconnect) return;
    await glow.disconnect();
    
    // Cleanup tất cả state và localStorage
    setIsConnected(false);
    setPublicKey(null);
    setAuthToken(null);
    setUserStatistics(null);
    setTransactions([]);
    AuthService.removeToken();
    
    console.log('🔌 Glow wallet disconnected');
  }, [glow]);

  return {
    glow,
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
