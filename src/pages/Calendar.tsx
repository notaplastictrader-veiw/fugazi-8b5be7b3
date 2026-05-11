import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema } from "@/components/seo/JsonLd";
import WeekNewsBoard from "@/components/calendar/WeekNewsBoard";

const Calendar = () => {
  return (
    <MainLayout>
      <SEO
        title="Economic Calendar — Forex Events, NFP, CPI & ML Sentiment"
        description="Live forex economic calendar with high-impact events, ML sentiment, timezone toggle, and currency filters. Track NFP, CPI, ECB, and FOMC."
        path="/calendar"
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Calendar", path: "/calendar" },
      ])} />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            📅 ECONOMIC CALENDAR
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Market <span className="text-primary">Calendar</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track high-impact events and ML-powered sentiment for the 8 majors. Plan trades around the data.
          </p>
        </div>

        <WeekNewsBoard />
      </section>
    </MainLayout>
  );
};

export default Calendar;
