import HeroSection from "@/modules/home/HeroSection";
import WhatlsBelp from "@/modules/home/WhatlsBelp";
import LoreShop from "@/modules/home/LoreShop";
import GetTheCuteness from "@/modules/home/GetTheCuteness";
import Roadmap from "@/modules/home/Roadmap";
import MintSection from "@/modules/home/MintSection";
import BelpSection from "@/modules/home/Belp";
import BelpFooter from "@/components//Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhatlsBelp />
      <BelpSection />
      <LoreShop />
      <GetTheCuteness />
      <Roadmap />
      <MintSection />
      <BelpFooter />
    </main>
  );
}
