import type { AppProps } from 'next/app';
import { Oxanium } from "next/font/google";
import clsx from "clsx";
import Head from 'next/head';

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
        <meta name="description" content="Belpy NFT - The first limited collection of unique NFT tokens" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
      </Head>
      
      <div className={clsx("font-gmarket antialiased", oxanium.variable)}>
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
                            !["/", "/my-collection"].includes(pathname) && "mt-16"
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
      </div>
    </>
  );
}
