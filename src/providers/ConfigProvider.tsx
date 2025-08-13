"use client";

import { useEffect } from "react";
import { useConfigActions } from "@/stores/config";
import { useAuth } from "@/providers/AuthProvider";

interface ConfigProviderProps {
  children: React.ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const { fetchConfig } = useConfigActions();
  const { isAuthenticated } = useAuth();

  // Fetch config once when the app starts
  useEffect(() => {
    console.log(
      "🔧 ConfigProvider: Fetching candy machine config on app start"
    );
    fetchConfig().catch((error: any) => {
      console.error(
        "❌ ConfigProvider: Failed to fetch initial config:",
        error
      );
    });
  }, []); // Empty dependency array - only run once on mount

  // Fetch config again when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        "🔧 ConfigProvider: User authenticated - fetching config with auth"
      );
      fetchConfig().catch((error: any) => {
        console.error(
          "❌ ConfigProvider: Failed to fetch authenticated config:",
          error
        );
      });
    }
  }, [isAuthenticated, fetchConfig]);

  return <>{children}</>;
};
