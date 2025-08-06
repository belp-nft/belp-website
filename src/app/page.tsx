import HeroSection from "@/components/HeroSection";
import WhatlsBelp from "@/components/WhatlsBelp";
import LoreShop from "@/components/LoreShop";
import GetTheCuteness from "@/components/GetTheCuteness";
import Loadmap from "@/components/Loadmap";
import MintSection from "@/components/MintSection";
import BelpSection from "@/components/Belp";
import BelpFooter from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <div className="font-medium bg-[#640076] text-center py-2">
        Belp is now on SOLANA
      </div>
      <div className="bg-[url('/images/background.svg')] bg-no-repeat bg-cover">
        <HeroSection />
        <WhatlsBelp />
        <BelpSection />
        <LoreShop />
        <GetTheCuteness />
        <Loadmap />
        <MintSection />
      </div>
      <BelpFooter />
    </main>
  );
}
