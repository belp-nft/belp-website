"use client";
import { useEffect } from "react";

export default function PerformanceMonitor() {
  useEffect(() => {
    // Ensure LCP is measured properly
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        if (lastEntry) {
          performance.mark("lcp-found");
        }
      });

      try {
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      } catch (e) {
        // console.log("LCP observer not supported");
      }

      return () => observer.disconnect();
    }
  }, []);

  return null;
}
