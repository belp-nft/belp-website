import { GetServerSideProps } from 'next';
import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/modules/home/HeroSection";
import WhatlsBelp from "@/modules/home/WhatlsBelp";

// Lazy load các components không critical
const LoreShop = dynamic(() => import("@/modules/home/LoreShop"), {
  loading: () => <></>,
  ssr: true,
});

const GetTheCuteness = dynamic(() => import("@/modules/home/GetTheCuteness"), {
  loading: () => <></>,
  ssr: false, // Component này có animation phức tạp
});

const Roadmap = dynamic(() => import("@/modules/home/Roadmap"), {
  loading: () => <></>,
  ssr: true,
});

const MintSection = dynamic(() => import("@/modules/home/MintSection"), {
  loading: () => <></>,
  ssr: true,
});

const BelpSection = dynamic(() => import("@/modules/home/Belp"), {
  loading: () => <></>,
  ssr: true,
});

const BelpFooter = dynamic(() => import("@/components/Footer"), {
  loading: () => <></>,
  ssr: true,
});

interface HomeProps {
  // Có thể thêm initial data từ server nếu cần
  initialData?: any;
}

export default function Home({ initialData }: HomeProps) {
  return (
    <main>
      {/* Critical components load immediately */}
      <HeroSection />
      <WhatlsBelp />

      {/* Non-critical components load with Suspense */}
      <Suspense fallback={<></>}>
        <BelpSection />
      </Suspense>
      
      <Suspense fallback={<></>}>
        <LoreShop />
      </Suspense>
      
      <Suspense fallback={<></>}>
        <GetTheCuteness />
      </Suspense>
      
      <Suspense fallback={<></>}>
        <Roadmap />
      </Suspense>
      
      <Suspense fallback={<></>}>
        <MintSection />
      </Suspense>
      
      <Suspense fallback={<></>}>
        <BelpFooter />
      </Suspense>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Có thể fetch initial data từ API nếu cần
    // Ví dụ: fetch config data, stats, etc.
    
    return {
      props: {
        // initialData: data,
      },
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    
    return {
      props: {
        initialData: null,
      },
    };
  }
};
