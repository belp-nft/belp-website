"use client";

import { useEffect } from "react";
import { useFetchConfig } from "@/stores/config";

interface ConfigProviderProps {
  children: React.ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const fetchConfig = useFetchConfig();

  // Fetch config once when the app starts
  useEffect(() => {
    fetchConfig().catch((error: any) => {
      console.error(
        "❌ ConfigProvider: Failed to fetch config:",
        error
      );
    });
  }, []); // Empty dependency - only run once on mount

  return <>{children}</>;
};
