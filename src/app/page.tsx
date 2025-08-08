import HeroSection from "@/modules/home/HeroSection";
import WhatlsBelp from "@/modules/home/WhatlsBelp";
import LoreShop from "@/modules/home/LoreShop";
import GetTheCuteness from "@/modules/home/GetTheCuteness";
import Loadmap from "@/modules/home/Loadmap";
import MintSection from "@/modules/home/MintSection";
import BelpSection from "@/modules/home/Belp";
import BelpFooter from "@/components//Footer";

export default function Home() {
  return (
    <main>
      <div className="font-medium bg-[#640076] text-center py-2 text-white">
        Belp is now on SOLANA
      </div>
      <div className="bg-[url('/images/home/background.svg')] bg-no-repeat bg-cover">
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
