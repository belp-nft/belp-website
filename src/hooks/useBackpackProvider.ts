import { useCallback, useEffect, useRef, useState } from "react";
import { UserService, AuthService } from "@/services";

export function useBackpackProvider() {
  const [backpack, setBackpack] = useState<any>(null);
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
    const provider = (window as any).backpack;
    setBackpack(provider);
    if (provider?.isConnected) {
      setIsConnected(true);
      setPublicKey(provider.publicKey?.toString?.() || null);
    } else {
      setIsConnected(false);
      setPublicKey(null);
    }
  }, []);

  useEffect(() => {
    if (!backpack?.on) return;
    const onConnect = () => {
      setIsConnected(true);
      setPublicKey(backpack.publicKey?.toString?.() || null);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setPublicKey(null);
    };
    backpack.on("connect", onConnect);
    backpack.on("disconnect", onDisconnect);
    connectRef.current = onConnect;
    disconnectRef.current = onDisconnect;
    return () => {
      if (connectRef.current) backpack.off("connect", connectRef.current);
      if (disconnectRef.current)
        backpack.off("disconnect", disconnectRef.current);
    };
  }, [backpack]);

  // Load user data từ backend
  const loadUserData = useCallback(async (walletAddress: string) => {
    try {
      console.log('📊 Loading user data for Backpack...', { walletAddress });
      
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
    if (!backpack) {
      window.open("https://backpack.app/download", "_blank");
      return null;
    }
    if (!backpack?.connect) return null;
    
    try {
      setLoading(true);
      console.log('🚀 Starting Backpack wallet connection...');
      
      // Bước 1: Kết nối với Backpack wallet
      const resp = await backpack.connect();
      const walletAddress = resp.publicKey?.toString?.() || null;
      
      if (!walletAddress) {
        throw new Error('Không thể lấy địa chỉ ví từ Backpack');
      }

      setIsConnected(true);
      setPublicKey(walletAddress);
      console.log('✅ Backpack connected:', walletAddress);

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

      console.log('🎉 Backpack wallet connection successful!');
      return resp;
      
    } catch (e) {
      console.error('❌ Backpack connection failed:', e);
      
      // Cleanup nếu có lỗi
      setIsConnected(false);
      setPublicKey(null);
      setAuthToken(null);
      AuthService.removeToken();
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [backpack, loadUserData]);

  const disconnect = useCallback(async () => {
    if (!backpack?.disconnect) return;
    try {
      await backpack.disconnect();
    } catch (e) {}
    
    // Cleanup tất cả state và localStorage
    setIsConnected(false);
    setPublicKey(null);
    setAuthToken(null);
    setUserStatistics(null);
    setTransactions([]);
    AuthService.removeToken();
    
    console.log('🔌 Backpack wallet disconnected');
  }, [backpack]);

  return {
    backpack,
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
