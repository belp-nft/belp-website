"use client";

export default function CriticalLoreCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        /* Critical CSS for Lore page LCP */
        
        /* Mobile-first video background fallback */
        @media (max-width: 768px) {
          .video-background {
            display: none !important;
          }
          
          .mobile-background-fallback {
            background: linear-gradient(135deg, 
              rgba(236, 254, 255, 0.9) 0%, 
              rgba(221, 214, 254, 0.9) 25%, 
              rgba(196, 181, 253, 0.9) 50%, 
              rgba(167, 139, 250, 0.9) 75%, 
              rgba(139, 92, 246, 0.9) 100%
            ),
            url(/images/lore/hero-background.svg);
            background-size: cover, cover;
            background-position: center, center;
            background-repeat: no-repeat, no-repeat;
            background-attachment: scroll;
          }
        }
        
        /* Detect touch devices */
        @media (hover: none) and (pointer: coarse) {
          .video-background {
            display: none !important;
          }
        }
        
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
