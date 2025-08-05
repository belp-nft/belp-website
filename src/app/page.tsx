import HeroSection from "@/components/HeroSection";
import WhatlsBelp from "@/components/WhatlsBelp";
import LoreShop from "@/components/LoreShop";
import GetTheCuteness from "@/components/GetTheCuteness";
import Loadmap from "@/components/Loadmap";
import MintSection from "@/components/MintSection";
import BelpSection from "@/components/Belp";

export default function Home() {
  return (
    <main className="bg-[url('/images/background.svg')] bg-no-repeat bg-cover">
      <HeroSection />
      <WhatlsBelp />
      <BelpSection />
      <LoreShop />
      <GetTheCuteness />
      <Loadmap />
      <MintSection />
    </main>
  );
}
