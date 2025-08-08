import { useCallback, useEffect, useRef, useState } from "react";

export function useGlowProvider() {
  const [glow, setGlow] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
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

  const connect = useCallback(async () => {
    if (!glow) {
      window.open("https://glow.app/", "_blank");
      return null;
    }
    if (!glow?.connect) return null;
    const resp = await glow.connect();
    setIsConnected(true);
    setPublicKey(resp.publicKey?.toString?.() || null);
    return resp;
  }, [glow]);

  const disconnect = useCallback(async () => {
    if (!glow?.disconnect) return;
    await glow.disconnect();
    setIsConnected(false);
    setPublicKey(null);
  }, [glow]);

  return {
    glow,
    isConnected,
    publicKey,
    connect,
    disconnect,
  };
}
