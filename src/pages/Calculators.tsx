import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PipCalculator from "@/components/calculators/PipCalculator";
import PositionSizeCalculator from "@/components/calculators/PositionSizeCalculator";
import MarginCalculator from "@/components/calculators/MarginCalculator";
import PnLCalculator from "@/components/calculators/PnLCalculator";
import { Calculator } from "lucide-react";

const Calculators = () => {
  return (
    <MainLayout>
      <SEO
        title="Forex Trading Calculators — Pip Value, Position Size, Margin & P&L"
        description="Free trading calculators: pip value, risk-based position size, margin requirement, and profit/loss. Use them before every trade to size positions correctly."
        path="/calculators"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Calculators", path: "/calculators" },
      ])} />

      <section className="max-w-4xl mx-auto px-4 pt-6 pb-24">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            <Calculator className="w-3.5 h-3.5" /> TRADING TOOLS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Trading Calculators
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Size positions, calculate margin, and project P&L before you click buy. All math runs locally in your browser.
          </p>
        </div>

        <Tabs defaultValue="position" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-card border border-border h-auto p-1">
            <TabsTrigger value="position" className="font-display text-sm">Position Size</TabsTrigger>
            <TabsTrigger value="pip" className="font-display text-sm">Pip Value</TabsTrigger>
            <TabsTrigger value="margin" className="font-display text-sm">Margin</TabsTrigger>
            <TabsTrigger value="pnl" className="font-display text-sm">P&L</TabsTrigger>
          </TabsList>

          <div className="mt-6 rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6">
            <TabsContent value="position" className="m-0"><PositionSizeCalculator /></TabsContent>
            <TabsContent value="pip" className="m-0"><PipCalculator /></TabsContent>
            <TabsContent value="margin" className="m-0"><MarginCalculator /></TabsContent>
            <TabsContent value="pnl" className="m-0"><PnLCalculator /></TabsContent>
          </div>
        </Tabs>

        <div className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <h3 className="font-display font-bold text-lg mb-2">Why position sizing matters</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Risking a fixed % per trade (typically 0.5–2%) is the single biggest predictor of long-term survival.
            Use the position-size calculator before every entry — never eyeball your lot size.
          </p>
        </div>
      </section>
    </MainLayout>
  );
};

export default Calculators;
