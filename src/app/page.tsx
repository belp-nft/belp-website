import HeroSection from "@/components/HeroSection";
import WhatlsBelp from "@/components/WhatlsBelp";
import LoreShop from "@/components/LoreShop";
import GetTheCuteness from "@/components/GetTheCuteness/";
import Roadmap from "@/components/Roadmap";
import MintSection from "@/components/MintSection";

export default function Home() {
  return (
    <main>
      <div className="bg-[#FFF5FEE5]">
        <HeroSection />
        <WhatlsBelp />
      </div>
      <LoreShop />
      <GetTheCuteness />
      <Roadmap />
      <MintSection />
    </main>
  );
}
