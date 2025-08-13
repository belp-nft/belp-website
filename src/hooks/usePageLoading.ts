import { useState, useCallback } from "react";

export type LoadingVariant = "default" | "nft" | "mint" | "wallet";

interface UsePageLoadingReturn {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (loading: boolean) => void;
}

export const usePageLoading = (
  initialLoading = false
): UsePageLoadingReturn => {
  const [loading, setLoadingState] = useState(initialLoading);

  const startLoading = useCallback(() => {
    setLoadingState(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setLoadingState(loading);
  }, []);

  return {
    loading,
    startLoading,
    stopLoading,
    setLoading,
  };
};
