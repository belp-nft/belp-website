"use client";

import { useEffect } from "react";
import { useConfigActions } from "@/stores/config";

interface ConfigProviderProps {
  children: React.ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const { fetchConfig } = useConfigActions();

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

  return <>{children}</>;
};
