"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "@/services/authService";

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
  const pathname = usePathname();

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
        const isValid = checkAuth();
        console.log("Auth initialization:", { isValid, pathname });
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

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
      console.warn(`🔒 Access denied to ${currentPath} - redirecting to home`);
      router.push("/");
      return;
    }
  }, [pathname, isAuthenticated, isLoading, router, token]);

  // Listen for auth events (token expiration, etc.)
  useEffect(() => {
    const handleAuthEvent = (event: CustomEvent) => {
      console.log("Auth event received:", event.type);
      if (event.type === "auth:token-expired") {
        clearAuth();
        if (isProtectedRoute(pathname)) {
          router.push("/");
        }
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

  const value: AuthContextType = {
    isAuthenticated,
    token,
    checkAuth,
    clearAuth,
  };

  // Show loading or children
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
