"use client";
import clsx from "clsx";

export default function HeroSection() {
  return (
    <section>
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <div className="lore-hero-title">
          {/* Critical LCP content - no animations to block rendering */}
          <div className="lore-hero-belpy">BELPY</div>
          <div className="lore-hero-world">WORLD</div>
        </div>
      </div>
    </section>
  );
}
