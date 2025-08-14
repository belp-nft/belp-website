"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Light theme only - no dark mode support
export const themeClasses = {
  // Backgrounds
  bg: {
    primary: "bg-white",
    secondary: "bg-gray-50",
    accent: "bg-[#f6effb]",
    card: "bg-white",
    gradient: "bg-gradient-to-b from-pink-100 to-purple-100",
    page: "bg-[#f2ecf6]",
  },

  // Text colors (light mode only)
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    accent: "text-[#411A7A]",
    muted: "text-gray-500",
  },

  // Borders (light mode only)
  border: {
    primary: "border-gray-200",
    accent: "border-[#B6A3E6]",
    light: "border-[#e9defd]",
  },

  // Interactive elements (light mode only)
  button: {
    primary: "bg-[#411A7A] hover:bg-[#5a2496] text-white",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300",
    gradient: "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white",
    accent: "bg-[#E9D9FF] text-[#411A7A] hover:bg-[#dcc9ff]",
  },

  // Hover states (light mode only)
  hover: {
    bg: "hover:bg-gray-100",
    text: "hover:text-purple-600",
  },

  // Modal/overlay (light mode only)
  overlay: "bg-black/50",
  modal: "bg-[#f6effb] border border-[#d9c2ff]",
};

// Minimal context - no theme switching needed
const ThemeContext = createContext<{
  theme: "light";
  isHydrated: boolean;
}>({
  theme: "light",
  isHydrated: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ensure light mode is enforced after hydration
    setIsHydrated(true);

    // Force light mode
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", isHydrated }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
