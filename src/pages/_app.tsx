import type { AppProps } from "next/app";
import { Oxanium } from "next/font/google";
import clsx from "clsx";
import Head from "next/head";

// Styles
import "@/styles/globals.css";
import "swiper/css";
import "swiper/css/navigation";

// Providers
import { LoadingProvider } from "@/providers/LoadingProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { ConfigProvider } from "@/providers/ConfigProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import { CandyMachineProvider } from "@/providers/CandyMachineProvider";
import { ToastProvider } from "@/components/ToastContainer";
import { BalanceProvider } from "@/providers/BalanceProvider";

// Components
import BelpHeader from "@/components/Header";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
  preload: true,
});

export default function App({ Component, pageProps, router }: AppProps) {
  const pathname = router.pathname;

  return (
    <>
      <Head>
        <title>Belpy</title>
        <meta
          name="description"
          content="Belpy NFT - The first limited collection of unique NFT tokens"
        />

        {/* Favicon + Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme */}
        <meta name="apple-mobile-web-app-title" content="Belpy" />
        <meta name="theme-color" content="#000000" />

        {/* OpenGraph cho Phantom Wallet lấy ảnh */}
        <meta property="og:title" content="Belpy" />
        <meta
          property="og:description"
          content="Belpy NFT - The first limited collection of unique NFT tokens"
        />
        <meta property="og:image" content="https://belpy.xyz/web-app-manifest-512x512.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://belpy.xyz/" />
      </Head>

      <div className={clsx("font-gmarket antialiased", oxanium.variable)}>
        <BalanceProvider>
          <ToastProvider>
            <LoadingProvider>
              <AuthProvider>
                <SettingsProvider>
                  <ConfigProvider>
                    <ThemeProvider>
                      <WalletProvider config={{ enableDebug: true }}>
                        <CandyMachineProvider config={{ enableDebug: true }}>
                          <BelpHeader />
                          <div
                            className={clsx(
                              !["/", "/my-collection"].includes(pathname) &&
                              "mt-16"
                            )}
                          >
                            <Component {...pageProps} />
                          </div>
                        </CandyMachineProvider>
                      </WalletProvider>
                    </ThemeProvider>
                  </ConfigProvider>
                </SettingsProvider>
              </AuthProvider>
            </LoadingProvider>
          </ToastProvider>
        </BalanceProvider>
      </div>
    </>
  );
}
