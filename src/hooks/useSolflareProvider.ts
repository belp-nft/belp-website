import { useCallback, useEffect, useRef, useState } from "react";

export function useSolflareProvider() {
  const [solflare, setSolflare] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
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

  const connect = useCallback(async () => {
    if (!solflare) {
      window.open("https://solflare.com/download", "_blank");
      return null;
    }
    if (!solflare?.connect) return null;
    const resp = await solflare.connect();
    setIsConnected(true);
    setPublicKey(resp.publicKey?.toString?.() || null);
    return resp;
  }, [solflare]);

  const disconnect = useCallback(async () => {
    if (!solflare?.disconnect) return;
    await solflare.disconnect();
    setIsConnected(false);
    setPublicKey(null);
  }, [solflare]);

  return {
    solflare,
    isConnected,
    publicKey,
    connect,
    disconnect,
  };
}
