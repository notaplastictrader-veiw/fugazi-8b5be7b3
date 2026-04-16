import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/approvalQueue";

interface SectionConfig {
  title: string;
  settingsKey: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "list" | "object-list";
  objectFields?: { key: string; label: string; type: "text" | "textarea" | "number" }[];
}

const sectionConfigs: Record<string, SectionConfig> = {
  "promo-ticker": {
    title: "Promo Ticker",
    settingsKey: "promo_ticker",
    fields: [
      { key: "items", label: "Ticker Messages", type: "list" },
    ],
  },
  "hero": {
    title: "Hero Section",
    settingsKey: "hero_section",
    fields: [
      { key: "headline", label: "Main Headline", type: "text" },
      { key: "subheadline", label: "Sub-headline", type: "textarea" },
      {
        key: "stats", label: "Stats", type: "object-list",
        objectFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
      {
        key: "eyebrow_items", label: "Eyebrow Messages", type: "object-list",
        objectFields: [
          { key: "text", label: "Text before highlight", type: "text" },
          { key: "highlight", label: "Highlighted text", type: "text" },
          { key: "suffix", label: "Text after highlight", type: "text" },
        ],
      },
      { key: "search_placeholders", label: "Search Placeholders", type: "list" },
    ],
  },
  "broker-trust-hub": {
    title: "Broker Trust Hub",
    settingsKey: "broker_trust_hub",
    fields: [
      { key: "section_title", label: "Broker Section Title", type: "text" },
      { key: "broker_subtitle", label: "Broker Subtitle", type: "textarea" },
      { key: "broker_count", label: "Brokers to Show", type: "number" },
      { key: "broker_filters", label: "Broker Filter Tabs", type: "list" },
      { key: "prop_section_title", label: "Prop Firms Section Title", type: "text" },
      { key: "prop_subtitle", label: "Prop Firms Subtitle", type: "textarea" },
      { key: "prop_firm_count", label: "Prop Firms to Show", type: "number" },
      { key: "prop_firm_categories", label: "Prop Firm Categories", type: "list" },
    ],
  },
  "scam-alerts": {
    title: "Scam Watch",
    settingsKey: "scam_alert_section",
    fields: [
      { key: "section_title", label: "Section Title", type: "text" },
      { key: "display_count", label: "Alerts to Display", type: "number" },
      { key: "cta_text", label: "CTA Button Text", type: "text" },
    ],
  },
  "signal-channel": {
    title: "Signal Channel",
    settingsKey: "signal_channel",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "cta_primary", label: "Primary CTA Text", type: "text" },
      { key: "cta_secondary", label: "Secondary CTA Text", type: "text" },
      {
        key: "stats", label: "Stats", type: "object-list",
        objectFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
    ],
  },
  "signal-hub": {
    title: "Signal Hub",
    settingsKey: "signal_hub",
    fields: [
      { key: "section_title", label: "Section Title", type: "text" },
      { key: "display_count", label: "Groups to Display", type: "number" },
      { key: "cta_text", label: "View All Text", type: "text" },
    ],
  },
  "forecasts": {
    title: "Forecast Section",
    settingsKey: "forecast_section",
    fields: [
      { key: "section_title", label: "Section Title", type: "text" },
      { key: "categories", label: "Categories", type: "list" },
    ],
  },
  "how-it-works": {
    title: "How It Works",
    settingsKey: "how_it_works",
    fields: [
      { key: "section_title", label: "Section Title", type: "text" },
      {
        key: "steps", label: "Steps", type: "object-list",
        objectFields: [
          { key: "title", label: "Step Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      { key: "cta_text", label: "CTA Button Text", type: "text" },
    ],
  },
  "community-reviews": {
    title: "Community Reviews",
    settingsKey: "community_reviews",
    fields: [
      { key: "section_title", label: "Section Title", type: "text" },
      { key: "display_count", label: "Reviews to Show", type: "number" },
    ],
  },
  "broker-join": {
    title: "For Brokers (CTA)",
    settingsKey: "broker_join_section",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "benefits", label: "Benefits List", type: "list" },
      { key: "cta_text", label: "CTA Button Text", type: "text" },
    ],
  },
  "navbar": {
    title: "Navigation Bar",
    settingsKey: "navbar",
    fields: [
      {
        key: "menu_items", label: "Menu Items", type: "object-list",
        objectFields: [
          { key: "label", label: "Label", type: "text" },
          { key: "url", label: "URL", type: "text" },
        ],
      },
      { key: "cta_text", label: "CTA Button Text", type: "text" },
    ],
  },
  "footer": {
    title: "Footer",
    settingsKey: "footer",
    fields: [
      { key: "disclaimer", label: "Disclaimer Text", type: "textarea" },
      { key: "social_links", label: "Social Media URLs", type: "list" },
    ],
  },
  "ticker-pairs": {
    title: "Ticker Pairs (Price Bar)",
    settingsKey: "ticker_pairs",
    fields: [
      {
        key: "items", label: "Ticker Pairs", type: "object-list",
        objectFields: [
          { key: "pair", label: "Pair (e.g. EUR/USD)", type: "text" },
          { key: "price", label: "Price", type: "text" },
          { key: "change", label: "Change (e.g. +0.15%)", type: "text" },
          { key: "up", label: "Direction (true = green, false = red)", type: "text" },
        ],
      },
    ],
  },
};

const SectionEditor = () => {
  const { section } = useParams<{ section: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const config = section ? sectionConfigs[section] : null;

  useEffect(() => {
    if (!config) return;
    const fetchData = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", config.settingsKey)
        .maybeSingle();

      if (row?.value && typeof row.value === "object" && !Array.isArray(row.value)) {
        setData(row.value as Record<string, any>);
      } else if (row?.value && Array.isArray(row.value)) {
        // For legacy list-only settings like promo_ticker
        setData({ items: row.value });
      }
      setLoaded(true);
    };
    fetchData();
  }, [config]);

  const handleSave = async () => {
    if (!config || !user) return;
    setSaving(true);

    const valueToSave = config.settingsKey === "promo_ticker" && data.items
      ? data.items
      : data;

    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", config.settingsKey)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("site_settings")
        .update({ value: valueToSave as any })
        .eq("key", config.settingsKey));
    } else {
      ({ error } = await supabase
        .from("site_settings")
        .insert({ key: config.settingsKey, value: valueToSave as any }));
    }

    if (error) {
      toast.error(error.message);
    } else {
      await logAuditAction(user.id, "update", "site_settings", config.settingsKey, null, valueToSave);
      toast.success("Section content saved successfully");
    }
    setSaving(false);
  };

  const updateField = (key: string, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateListItem = (key: string, index: number, value: string) => {
    const list = [...(data[key] || [])];
    list[index] = value;
    updateField(key, list);
  };

  const addListItem = (key: string) => {
    const list = [...(data[key] || []), ""];
    updateField(key, list);
  };

  const removeListItem = (key: string, index: number) => {
    const list = [...(data[key] || [])];
    list.splice(index, 1);
    updateField(key, list);
  };

  const updateObjectListItem = (key: string, index: number, field: string, value: string) => {
    const list = [...(data[key] || [])];
    list[index] = { ...list[index], [field]: value };
    updateField(key, list);
  };

  const addObjectListItem = (key: string, objectFields: { key: string }[]) => {
    const item: Record<string, string> = {};
    objectFields.forEach((f) => { item[f.key] = ""; });
    const list = [...(data[key] || []), item];
    updateField(key, list);
  };

  const removeObjectListItem = (key: string, index: number) => {
    const list = [...(data[key] || [])];
    list.splice(index, 1);
    updateField(key, list);
  };

  if (!config) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="font-mono">SECTION NOT FOUND</p>
        <Link to="/admin/site-content" className="text-primary text-sm mt-2 inline-block">← Back to Site Content</Link>
      </div>
    );
  }

  return (
    <div className="hud-scanline max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/site-content" className="hud-action-btn p-2 hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 text-primary" />
        </Link>
        <div className="hud-badge">EDIT</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          {config.title}
        </h2>
      </div>

      {!loaded ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {config.fields.map((field) => (
            <div key={field.key} className="hud-card p-1">
              <div className="p-5">
                <Label className="font-mono text-xs uppercase tracking-widest text-primary mb-3 block">
                  {field.label}
                </Label>

                {field.type === "text" && (
                  <Input
                    value={data[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="font-mono text-sm"
                  />
                )}

                {field.type === "textarea" && (
                  <Textarea
                    value={data[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="font-mono text-sm min-h-[100px]"
                  />
                )}

                {field.type === "number" && (
                  <Input
                    type="number"
                    value={data[field.key] || ""}
                    onChange={(e) => updateField(field.key, parseInt(e.target.value) || 0)}
                    className="font-mono text-sm w-32"
                  />
                )}

                {field.type === "list" && (
                  <div className="space-y-2">
                    {(data[field.key] || []).map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                        <Input
                          value={item}
                          onChange={(e) => updateListItem(field.key, i, e.target.value)}
                          className="font-mono text-sm flex-1"
                        />
                        <button
                          onClick={() => removeListItem(field.key, i)}
                          className="p-1.5 hover:bg-destructive/10 rounded text-destructive/60 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(field.key)}
                      className="hud-action-btn p-2 px-4 flex items-center gap-2 text-xs font-mono text-primary"
                    >
                      <Plus className="w-3 h-3" /> ADD ITEM
                    </button>
                  </div>
                )}

                {field.type === "object-list" && field.objectFields && (
                  <div className="space-y-3">
                    {(data[field.key] || []).map((item: Record<string, string>, i: number) => (
                      <div key={i} className="bg-background/50 border border-border/50 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground">ITEM {i + 1}</span>
                          <button
                            onClick={() => removeObjectListItem(field.key, i)}
                            className="p-1 hover:bg-destructive/10 rounded text-destructive/60 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {field.objectFields!.map((of) => (
                          <div key={of.key}>
                            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">{of.label}</label>
                            {of.type === "textarea" ? (
                              <Textarea
                                value={item[of.key] || ""}
                                onChange={(e) => updateObjectListItem(field.key, i, of.key, e.target.value)}
                                className="font-mono text-sm min-h-[60px]"
                              />
                            ) : (
                              <Input
                                value={item[of.key] || ""}
                                onChange={(e) => updateObjectListItem(field.key, i, of.key, e.target.value)}
                                className="font-mono text-sm"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <button
                      onClick={() => addObjectListItem(field.key, field.objectFields!)}
                      className="hud-action-btn p-2 px-4 flex items-center gap-2 text-xs font-mono text-primary"
                    >
                      <Plus className="w-3 h-3" /> ADD ITEM
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full font-mono uppercase tracking-widest"
            size="lg"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            SAVE CHANGES
          </Button>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
