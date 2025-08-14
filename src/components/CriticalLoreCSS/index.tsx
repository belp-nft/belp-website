"use client";

export default function CriticalLoreCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        /* Critical CSS for Lore page LCP */
        .lore-hero-title {
          font-family: var(--font-oxanium), 'Oxanium', sans-serif;
          font-weight: 700;
          line-height: 1.2;
          display: block;
          text-align: center;
        }
        
        .lore-hero-belpy {
          color: #F356FF;
          font-size: 72px;
        }
        
        .lore-hero-world {
          color: #AE4DCE;
          font-size: 80px;
        }
        
        @media (min-width: 768px) {
          .lore-hero-belpy {
            font-size: 80px;
          }
          .lore-hero-world {
            font-size: 96px;
          }
        }
        
        @media (min-width: 1024px) {
          .lore-hero-belpy {
            font-size: 96px;
          }
          .lore-hero-world {
            font-size: 124px;
          }
        }
      `,
      }}
    />
  );
}
