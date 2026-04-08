import PromoTicker from "@/components/sections/PromoTicker";
import TickerBar from "@/components/sections/TickerBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed top system: promo (34px) + ticker (32px) + nav (58px) = 124px */}
      <div className="fixed top-0 left-0 right-0 z-[200]">
        <PromoTicker />
        <TickerBar />
      </div>
      <Navbar />
      <main className="flex-1" style={{ paddingTop: "124px" }}>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
