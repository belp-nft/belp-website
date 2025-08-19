"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthService } from "@/services/authService";
import { useLoading } from "@/providers/LoadingProvider";

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
  const router = useRouter();
  const pathname = router.pathname;
  const { showLoading, hideLoading } = useLoading();

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

  const value: AuthContextType = {
    isAuthenticated,
    token,
    checkAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
