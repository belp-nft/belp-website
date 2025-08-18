import { GetServerSideProps } from 'next';
import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/modules/home/HeroSection";
import WhatlsBelp from "@/modules/home/WhatlsBelp";
import PageLoading from "@/components/PageLoading";

// Lazy load các components không critical
const LoreShop = dynamic(() => import("@/modules/home/LoreShop"), {
  loading: () => <PageLoading />,
  ssr: true,
});

const GetTheCuteness = dynamic(() => import("@/modules/home/GetTheCuteness"), {
  loading: () => <PageLoading />,
  ssr: false, // Component này có animation phức tạp
});

const Roadmap = dynamic(() => import("@/modules/home/Roadmap"), {
  loading: () => <PageLoading />,
  ssr: true,
});

const MintSection = dynamic(() => import("@/modules/home/MintSection"), {
  loading: () => <PageLoading />,
  ssr: true,
});

const BelpSection = dynamic(() => import("@/modules/home/Belp"), {
  loading: () => <PageLoading />,
  ssr: true,
});

const BelpFooter = dynamic(() => import("@/components/Footer"), {
  loading: () => <PageLoading />,
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
      <Suspense fallback={<PageLoading />}>
        <BelpSection />
      </Suspense>
      
      <Suspense fallback={<PageLoading />}>
        <LoreShop />
      </Suspense>
      
      <Suspense fallback={<PageLoading />}>
        <GetTheCuteness />
      </Suspense>
      
      <Suspense fallback={<PageLoading />}>
        <Roadmap />
      </Suspense>
      
      <Suspense fallback={<PageLoading />}>
        <MintSection />
      </Suspense>
      
      <Suspense fallback={<PageLoading />}>
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
