import PromoTicker from "@/components/sections/PromoTicker";
import TickerBar from "@/components/sections/TickerBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed top system: promo (34px) + nav (58px) = 92px */}
      <div className="fixed top-0 left-0 right-0 z-[200]">
        <PromoTicker />
      </div>
      <Navbar />
      <main className="flex-1 pb-[32px]" style={{ paddingTop: "92px" }}>{children}</main>
      <Footer />
      {/* Fixed bottom ticker */}
      <div className="fixed bottom-0 left-0 right-0 z-[200]">
        <TickerBar />
      </div>
    </div>
  );
};

export default MainLayout;
