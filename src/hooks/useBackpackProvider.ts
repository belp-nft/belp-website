import { useCallback, useEffect, useRef, useState } from "react";

export function useBackpackProvider() {
  const [backpack, setBackpack] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
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

  // Hàm connect/disconnect có thể gọi từ UI
  const connect = useCallback(async () => {
    if (!backpack?.connect) return null;
    try {
      const resp = await backpack.connect();
      setIsConnected(true);
      setPublicKey(resp.publicKey?.toString?.() || null);
      return resp;
    } catch (e) {
      setIsConnected(false);
      setPublicKey(null);
      return null;
    }
  }, [backpack]);

  const disconnect = useCallback(async () => {
    if (!backpack?.disconnect) return;
    try {
      await backpack.disconnect();
    } catch (e) {}
    setIsConnected(false);
    setPublicKey(null);
  }, [backpack]);

  return {
    backpack,
    isConnected,
    publicKey,
    connect,
    disconnect,
  };
}
