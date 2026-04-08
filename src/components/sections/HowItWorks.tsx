import { Search, BookOpen, MessageSquare, Award } from "lucide-react";

const steps = [
  { icon: Search, number: "01", title: "Search any broker", desc: "Find any broker, prop firm, or signal provider in our database." },
  { icon: BookOpen, number: "02", title: "Read verified reviews", desc: "Real reviews from real traders. No paid or fake testimonials." },
  { icon: MessageSquare, number: "03", title: "File a complaint", desc: "Had a bad experience? File a complaint with evidence." },
  { icon: Award, number: "04", title: "Join & earn trust", desc: "Become part of the community. Your voice helps others trade safely." },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <span className="section-tag">// HOW IT WORKS</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-10">
          Built Different. Built For <span className="text-primary">Traders.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-mono font-bold text-primary/30 group-hover:text-primary/60 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
