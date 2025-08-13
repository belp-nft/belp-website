"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "@/services/authService";
import { useLoading } from "@/providers/LoadingProvider";
import Modal from "@/components/Modal";
import { useWallet } from "@/hooks/useWallet";

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
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showLoading, hideLoading } = useLoading();
  const { connectWallet, availableWallets } = useWallet();

  const checkAuth = (): boolean => {
    const currentToken = AuthService.getToken();
    const isValid = AuthService.isTokenValid();

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
      // Small delay to ensure token is set
      setTimeout(() => {
        checkAuth();
      }, 100);
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

  // Handle wallet connection from modal
  const handleConnectWallet = async () => {
    if (availableWallets.length > 0) {
      try {
        setIsConnecting(true);
        await connectWallet(availableWallets[0].type);
        setShowAuthModal(false);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      } finally {
        setIsConnecting(false);
      }
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
      <Modal
        isOpen={showAuthModal}
        onClose={handleGoHome}
        headerTitle="Connect Wallet Required"
        description="You need to connect your wallet to access this page."
        primaryButtonText={isConnecting ? "Connecting..." : "Connect Wallet"}
        secondaryButtonText="Go to Home"
        onPrimaryClick={handleConnectWallet}
        onSecondaryClick={handleGoHome}
        primaryButtonDisabled={availableWallets.length === 0 || isConnecting}
        secondaryButtonDisabled={isConnecting}
      >
        <div className="text-center py-4">
          <div className="text-4xl mb-3">🔐</div>
          <p className="text-gray-600 text-sm">
            Connect your wallet to view your NFT collection and access exclusive
            features.
          </p>
          {availableWallets.length === 0 && (
            <p className="text-red-500 text-xs mt-2">
              No wallet detected. Please install a supported wallet.
            </p>
          )}
        </div>
      </Modal>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
