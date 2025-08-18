"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthService } from "@/services/authService";
import { useLoading } from "@/providers/LoadingProvider";
import WalletModal from "@/components/Wallet/WalletModal";
import { useWallet } from "@/hooks/useWallet";
import { useSolflareProvider } from "@/hooks/useSolflareProvider";
import { useBackpackProvider } from "@/hooks/useBackpackProvider";
import { useGlowProvider } from "@/hooks/useGlowProvider";
import { useOKXProvider } from "@/hooks/useOKXProvider";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  checkAuth: () => boolean;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/my-collection"];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const router = useRouter();
  const pathname = router.pathname;
  const { showLoading, hideLoading } = useLoading();
  const { hasPhantom, connectPhantom } = useWallet();

  // Add wallet provider hooks
  const { solflare, connect: connectSolflare } = useSolflareProvider();

  const { backpack, connect: connectBackpack } = useBackpackProvider();

  const { glow, connect: connectGlow } = useGlowProvider();

  const { okx, connect: connectOKX } = useOKXProvider();

  const checkAuth = (): boolean => {
    const currentToken = AuthService.getToken();
    const isValid = AuthService.isTokenValid();

    console.log("🔍 Auth check details:", {
      hasToken: !!currentToken,
      tokenLength: currentToken?.length || 0,
      isValid,
      tokenPreview: currentToken ? `${currentToken.slice(0, 20)}...` : null,
    });

    setToken(currentToken);
    setIsAuthenticated(!!currentToken && isValid);

    return !!currentToken && isValid;
  };

  const clearAuth = (): void => {
    AuthService.removeToken();
    setToken(null);
    setIsAuthenticated(false);
  };

  // Check if current route is protected
  const isProtectedRoute = (path: string): boolean => {
    return PROTECTED_ROUTES.some((route) => path.startsWith(route));
  };

  // Initial auth check
  useEffect(() => {
    const initAuth = () => {
      try {
        showLoading();
        const isValid = checkAuth();
        console.log("Auth initialization:", { isValid, pathname });
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
        hideLoading();
      }
    };

    initAuth();
  }, [showLoading, hideLoading, pathname]);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const currentPath = pathname;
    const isProtected = isProtectedRoute(currentPath);

    console.log("Route check:", {
      currentPath,
      isProtected,
      isAuthenticated,
      hasToken: !!token,
    });

    if (isProtected && !isAuthenticated) {
      console.warn(`🔒 Access denied to ${currentPath} - showing auth modal`);
      setShowAuthModal(true);
      return;
    }
  }, [pathname, isAuthenticated, isLoading, token]);

  // Listen for auth events (token expiration, etc.)
  useEffect(() => {
    const handleAuthEvent = (event: CustomEvent) => {
      console.log("Auth event received:", event.type);
      if (event.type === "auth:token-expired") {
        clearAuth();
      }
    };

    window.addEventListener(
      "auth:token-expired",
      handleAuthEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "auth:token-expired",
        handleAuthEvent as EventListener
      );
    };
  }, [pathname, router]);

  // Listen for wallet events to update auth state
  useEffect(() => {
    const handleWalletConnected = () => {
      console.log("🔗 Wallet connected - checking auth");
      // Check auth immediately and then again after a small delay to ensure token is set
      checkAuth();
      setTimeout(() => {
        checkAuth();
      }, 50);
    };

    const handleWalletDisconnected = () => {
      console.log("🔌 Wallet disconnected - clearing auth");
      clearAuth();
      setShowAuthModal(false);
    };

    // Listen for custom wallet events
    window.addEventListener("wallet:connected", handleWalletConnected);
    window.addEventListener("wallet:disconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("wallet:connected", handleWalletConnected);
      window.removeEventListener(
        "wallet:disconnected",
        handleWalletDisconnected
      );
    };
  }, []);

  // Handle wallet connections from modal
  const handleConnectPhantom = async () => {
    try {
      setConnectingWallet("phantom");
      await connectPhantom();
      setShowAuthModal(false);
    } catch (error) {
      console.error("Failed to connect Phantom:", error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleConnectSolflare = async () => {
    try {
      setConnectingWallet("solflare");
      await connectSolflare();
      setShowAuthModal(false);
    } catch (error) {
      console.error("Failed to connect Solflare:", error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleConnectBackpack = async () => {
    try {
      setConnectingWallet("backpack");
      await connectBackpack();
      setShowAuthModal(false);
    } catch (error) {
      console.error("Failed to connect Backpack:", error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleConnectGlow = async () => {
    try {
      setConnectingWallet("glow");
      await connectGlow();
      setShowAuthModal(false);
    } catch (error) {
      console.error("Failed to connect Glow:", error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleConnectOKX = async () => {
    try {
      setConnectingWallet("okx");
      await connectOKX();
      setShowAuthModal(false);
    } catch (error) {
      console.error("Failed to connect OKX:", error);
    } finally {
      setConnectingWallet(null);
    }
  };

  // Handle going back to home
  const handleGoHome = () => {
    setShowAuthModal(false);
    router.push("/");
  };

  const value: AuthContextType = {
    isAuthenticated,
    token,
    checkAuth,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Authentication Modal */}
      <WalletModal
        open={showAuthModal}
        onClose={handleGoHome}
        title="Connect Wallet Required"
        subtitle="You need to connect your wallet to access this page."
        showGoHomeButton={true}
        goHomeButtonText="Back to Home"
        onGoHome={handleGoHome}
        hasPhantom={hasPhantom}
        hasSolflare={!!solflare}
        hasBackpack={!!backpack}
        hasGlow={!!glow}
        hasOKX={!!okx}
        loading={connectingWallet as any}
        connectPhantom={handleConnectPhantom}
        connectSolflare={handleConnectSolflare}
        connectBackpack={handleConnectBackpack}
        connectGlow={handleConnectGlow}
        connectOKX={handleConnectOKX}
      />
    </AuthContext.Provider>
  );
};

export default AuthProvider;
