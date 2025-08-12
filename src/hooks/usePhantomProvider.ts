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
    const provider = window.solana;
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

  // Load user data từ backend - dựa trên index.html
  const loadUserData = useCallback(async (walletAddress: string) => {
    try {
      console.log('📊 Loading user data...', { walletAddress });
      
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
    if (!phantom?.connect) {
      // Mở trang download Phantom nếu chưa cài đặt
      window.open("https://phantom.app/", "_blank");
      return null;
    }
    
    try {
      setLoading(true);
      console.log('🚀 Starting Phantom wallet connection...');
      
      // Bước 1: Kết nối với Phantom wallet
      const resp = await phantom.connect();
      const walletAddress = resp.publicKey?.toString?.() || null;
      
      if (!walletAddress) {
        throw new Error('Không thể lấy địa chỉ ví');
      }

      setIsConnected(true);
      setPublicKey(walletAddress);
      console.log('✅ Phantom connected:', walletAddress);

      // Bước 2: Authenticate với backend (dựa trên logic index.html)
      console.log('🔐 Authenticating with backend...');
      const connectResult = await UserService.connectWallet(walletAddress);

      if (!connectResult.success) {
        throw new Error(connectResult.message || 'Backend authentication failed');
      }

      // Bước 3: Lưu JWT token vào localStorage (dựa trên index.html)
      // Backend trả về accessToken trong data object, không phải trong User object
      if ((connectResult as any).data?.accessToken) {
        AuthService.setToken((connectResult as any).data.accessToken);
        setAuthToken((connectResult as any).data.accessToken);
        console.log('🔑 JWT token saved to localStorage');
      } else {
        console.warn('⚠️ No JWT token received from backend');
      }

      // Bước 4: Load user data với JWT token
      await loadUserData(walletAddress);

      console.log('🎉 Phantom wallet connection successful!');
      return resp;
      
    } catch (error: any) {
      console.error('❌ Phantom connection failed:', error);
      
      // Cleanup nếu có lỗi
      setIsConnected(false);
      setPublicKey(null);
      setAuthToken(null);
      AuthService.removeToken();
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [phantom, loadUserData]);

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
      
      console.log('🔌 Phantom wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting phantom:', error);
    }
  }, [phantom]);

  // Auto-connect function (dựa trên logic index.html window.addEventListener('load'))
  const autoConnect = useCallback(async () => {
    if (!phantom?.isConnected || !phantom?.publicKey) return null;
    
    try {
      console.log('🔄 Attempting auto-connect...');
      
      // Thử connect với onlyIfTrusted
      const response = await phantom.connect({ onlyIfTrusted: true });
      const walletAddress = response.publicKey.toString();
      
      setIsConnected(true);
      setPublicKey(walletAddress);
      console.log('✅ Auto-connect successful:', walletAddress);

      // Authenticate với backend
      const connectResult = await UserService.connectWallet(walletAddress);

      if (connectResult.success && (connectResult as any).data?.accessToken) {
        AuthService.setToken((connectResult as any).data.accessToken);
        setAuthToken((connectResult as any).data.accessToken);
        console.log('🔑 JWT token saved from auto-connect');

        // Load user data
        await loadUserData(walletAddress);
        
        return response;
      }
    } catch (error) {
      console.log('Auto-connect failed, user needs to manually connect');
    }
    
    return null;
  }, [phantom, loadUserData]);

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
    loadUserData,
  };
}
