import React, { createContext, useContext, useState, useCallback } from "react";

interface BalanceContextProps {
  solLamports: number;
  setSolLamports: (val: number) => void;
}

const BalanceContext = createContext<BalanceContextProps | undefined>(
  undefined
);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [solLamports, setSolLamports] = useState(0);

  const setBalance = useCallback((val: number) => {
    setSolLamports(val);
  }, []);

  return (
    <BalanceContext.Provider
      value={{ solLamports, setSolLamports: setBalance }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export function useBalance() {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance must be used within a BalanceProvider");
  return ctx;
}
