import { useCallback, useEffect, useRef, useState } from "react";

export function usePhantomProvider() {
  const [phantom, setPhantom] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const connectRef = useRef<((...args: any[]) => void) | null>(null);
  const disconnectRef = useRef<((...args: any[]) => void) | null>(null);

  // Detect Phantom provider
  useEffect(() => {
    if (typeof window === "undefined") return;
    const provider = window.solana;
    setPhantom(provider);
    if (provider?.publicKey) {
      setIsConnected(true);
      setPublicKey(provider.publicKey?.toString?.() || null);
    }
  }, []);

  // Listen connect/disconnect
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

  // Connect Phantom
  const connect = useCallback(async () => {
    if (!phantom?.connect) return null;
    const resp = await phantom.connect();
    setIsConnected(true);
    setPublicKey(resp.publicKey?.toString?.() || null);
    return resp;
  }, [phantom]);

  // Disconnect Phantom
  const disconnect = useCallback(async () => {
    if (!phantom?.disconnect) return;
    await phantom.disconnect();
    setIsConnected(false);
    setPublicKey(null);
  }, [phantom]);

  return {
    phantom,
    isConnected,
    publicKey,
    connect,
    disconnect,
  };
}
