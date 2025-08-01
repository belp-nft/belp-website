import HeroSection from "@/components/HeroSection";
import WhatlsBelp from "@/components/WhatlsBelp";
import LoreShop from "@/components/LoreShop";
import GetTheCuteness from "@/components/GetTheCuteness/";
import Loadmap from "@/components/Loadmap";
import MintSection from "@/components/MintSection";

export default function Home() {
  return (
    <main className="bg-[url('/images/background.svg')] bg-no-repeat bg-cover p-10">
      <div className="bg-[#FFF5FEE5] rounded-[56px] px-12 py-10 shadow-2xl">
        <HeroSection />
        <WhatlsBelp />
      </div>
      <LoreShop />
      <div className="bg-[#FFF5FEE5] rounded-[56px] py-10 shadow-2xl">
        <GetTheCuteness />
        <Loadmap />
      </div>
      <MintSection />
    </main>
  );
}
