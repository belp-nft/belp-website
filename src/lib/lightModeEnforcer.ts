// Light mode enforcer - prevents any dark mode activation
export const enforceLightMode = () => {
  if (typeof window !== "undefined") {
    // Remove any dark mode classes
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");

    // Set light mode attributes
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.className = "light";

    // Override any CSS variables that might enable dark mode
    document.documentElement.style.setProperty("color-scheme", "light only");

    // Prevent localStorage from storing dark mode preferences
    try {
      if (localStorage.getItem("theme") === "dark") {
        localStorage.removeItem("theme");
      }
    } catch (e) {
      // Ignore localStorage errors in SSR
    }
  }
};

// Only run on client side to avoid hydration mismatch
if (typeof window !== "undefined") {
  // Wait for hydration to complete
  const initEnforcer = () => {
    enforceLightMode();

    // Watch for any attempts to change theme
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("dark")) {
        enforceLightMode();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
  };

  // Use requestAnimationFrame to ensure DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEnforcer);
  } else {
    requestAnimationFrame(initEnforcer);
  }
}
