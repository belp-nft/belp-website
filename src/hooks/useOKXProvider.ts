import { useCallback, useEffect, useRef, useState } from "react";

export function useOKXProvider() {
  const [okx, setOKX] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
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
    const resp = await okx.connect();
    setIsConnected(true);
    setPublicKey(resp.publicKey?.toString?.() || null);
    return resp;
  }, [okx]);

  const disconnect = useCallback(async () => {
    if (!okx?.disconnect) return;
    await okx.disconnect();
    setIsConnected(false);
    setPublicKey(null);
  }, [okx]);

  return {
    okx,
    isConnected,
    publicKey,
    connect,
    disconnect,
  };
}
