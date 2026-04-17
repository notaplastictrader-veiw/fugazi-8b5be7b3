import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/approvalQueue";

type FieldType = "text" | "textarea" | "number" | "color" | "boolean" | "select" | "list" | "object-list" | "object" | "nested-list";

interface SubField {
  key: string;
  label: string;
  type: Exclude<FieldType, "object-list" | "object" | "nested-list">;
  options?: string[]; // for select
  hint?: string;
}

interface ObjectListSubField extends Omit<SubField, "type"> {
  type: FieldType;
  fields?: SubField[]; // for nested objects/lists
}

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  options?: string[];
  fields?: SubField[]; // for "object" type
  objectFields?: ObjectListSubField[]; // for "object-list" + nested-list
}

interface SectionConfig {
  title: string;
  settingsKey: string;
  fields: FieldConfig[];
}

const ICON_OPTIONS = ["Search", "BookOpen", "MessageSquare", "Award", "Shield", "Zap", "TrendingUp", "AlertTriangle", "CheckCircle", "Star", "Users", "BarChart3", "Bell", "Rocket", "Crown", "Lock"];
const STYLE_OPTIONS = ["highlight", "secondary", "ghost"];
const COLOR_OPTIONS = [
  { label: "Primary (Lime)", value: "hsl(var(--primary))" },
  { label: "Accent", value: "hsl(var(--accent))" },
  { label: "Destructive (Red)", value: "hsl(var(--destructive))" },
  { label: "Teal", value: "hsl(var(--teal))" },
  { label: "Purple", value: "hsl(var(--purple))" },
];
const SCORE_COLORS = ["primary", "accent", "danger"];

const sectionConfigs: Record<string, SectionConfig> = {
  "promo-ticker": {
    title: "Promo Ticker",
    settingsKey: "promo_ticker",
    fields: [{ key: "items", label: "Ticker Messages", type: "list", hint: "Each item shown as scrolling text in the top bar" }],
  },
  "hero": {
    title: "Hero Section",
    settingsKey: "hero_section",
    fields: [
      { key: "headline", label: "Main Headline (large text)", type: "text" },
      { key: "subheadline", label: "Sub-headline (highlighted second line)", type: "textarea" },
      {
        key: "stats", label: "Stats Counters", type: "object-list",
        objectFields: [
          { key: "value", label: "Value (e.g. 4.8K+)", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
      {
        key: "eyebrow_items", label: "Eyebrow Rotating Messages", type: "object-list",
        objectFields: [
          { key: "text", label: "Text before highlight", type: "text" },
          { key: "highlight", label: "Highlighted text", type: "text" },
          { key: "suffix", label: "Text after highlight", type: "text" },
          { key: "color", label: "Highlight Color", type: "select", options: COLOR_OPTIONS.map(c => c.value) },
        ],
      },
      { key: "search_placeholders", label: "Search Bar Typewriter Texts", type: "list" },
      {
        key: "chip_groups", label: "Quick-Search Chip Groups (rotates)", type: "object-list",
        objectFields: [
          { key: "label", label: "Group Title (e.g. Top Brokers)", type: "text" },
          { key: "items", label: "Chips (one per line)", type: "textarea", hint: "One chip per line" },
        ],
      },
    ],
  },
  "broker-trust-hub": {
    title: "Broker Trust Hub",
    settingsKey: "broker_trust_hub",
    fields: [
      { key: "section_title", label: "Brokers — Title prefix", type: "text" },
      { key: "broker_accent", label: "Brokers — Accent word (colored)", type: "text" },
      { key: "broker_subtitle", label: "Brokers — Subtitle", type: "textarea" },
      { key: "broker_count", label: "Brokers to Show", type: "number" },
      { key: "broker_filters", label: "Broker Filter Tabs", type: "list" },
      { key: "broker_view_all_text", label: "View All Brokers — Link Text", type: "text" },
      { key: "prop_section_title", label: "Prop Firms — Title prefix", type: "text" },
      { key: "prop_accent", label: "Prop Firms — Accent word (colored)", type: "text" },
      { key: "prop_subtitle", label: "Prop Firms — Subtitle", type: "textarea" },
      { key: "prop_firm_count", label: "Prop Firms to Show", type: "number" },
      { key: "prop_firm_categories", label: "Prop Firm Filter Pills", type: "list" },
      { key: "prop_view_all_text", label: "View All Prop Firms — Link Text", type: "text" },
    ],
  },
  "scam-alerts": {
    title: "Scam Watch",
    settingsKey: "scam_alert_section",
    fields: [
      { key: "section_title", label: "Title prefix (e.g. Active Scam)", type: "text" },
      { key: "accent_text", label: "Accent word (e.g. Alerts)", type: "text" },
      { key: "live_alerts_label", label: "Left column heading (e.g. LIVE ALERTS)", type: "text" },
      { key: "engine_label", label: "Right column heading (e.g. SCAM SCORE ENGINE)", type: "text" },
      { key: "subtitle", label: "Engine description text", type: "textarea" },
      { key: "display_count", label: "Alerts to Display", type: "number" },
      { key: "cta_text", label: "View All Alerts CTA Text", type: "text" },
      {
        key: "score_factors", label: "Scam Score Engine Factors", type: "object-list",
        objectFields: [
          { key: "factor", label: "Factor Name", type: "text" },
          { key: "level", label: "Level Label (High/Med/Low)", type: "text" },
          { key: "value", label: "Value (0-100)", type: "number" },
          { key: "color", label: "Color", type: "select", options: SCORE_COLORS },
        ],
      },
    ],
  },
  "signal-channel": {
    title: "Signal Channel",
    settingsKey: "signal_channel",
    fields: [
      { key: "title", label: "Title prefix", type: "text" },
      { key: "accent_text", label: "Accent word (e.g. Trust.)", type: "text" },
      { key: "description", label: "Long Description", type: "textarea" },
      { key: "features_list", label: "Left-side Bullet Points", type: "list" },
      {
        key: "free_tier", label: "FREE TIER Card", type: "object",
        fields: [
          { key: "badge", label: "Badge Label", type: "text" },
          { key: "title", label: "Card Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "features", label: "Features (one per line)", type: "textarea" },
          { key: "price", label: "Price Text", type: "text" },
          { key: "cta", label: "CTA Button Text", type: "text" },
          { key: "cta_url", label: "CTA URL", type: "text" },
          { key: "footer_note", label: "Footer Note", type: "text" },
        ],
      },
      {
        key: "premium_tier", label: "PREMIUM TIER Card", type: "object",
        fields: [
          { key: "badge", label: "Top-right Badge", type: "text" },
          { key: "label", label: "Tier Label", type: "text" },
          { key: "title", label: "Card Title", type: "text" },
          { key: "win_rate", label: "Win Rate Big Number (e.g. ~78%)", type: "text" },
          { key: "win_rate_label", label: "Win Rate Description", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "features", label: "Features (one per line)", type: "textarea" },
          { key: "tagline", label: "Tagline", type: "text" },
          { key: "cta", label: "CTA Button Text", type: "text" },
        ],
      },
    ],
  },
  "signal-hub": {
    title: "Signal Hub",
    settingsKey: "signal_hub",
    fields: [
      { key: "section_title", label: "Title prefix (e.g. Verified Signal)", type: "text" },
      { key: "accent_text", label: "Accent word (e.g. Groups)", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "display_count", label: "Groups to Display", type: "number" },
      { key: "cta_text", label: "View All Link Text", type: "text" },
    ],
  },
  "forecasts": {
    title: "Forecast Section",
    settingsKey: "forecast_section",
    fields: [
      { key: "section_title", label: "Title prefix (e.g. Market)", type: "text" },
      { key: "accent_text", label: "Accent word (e.g. Forecasts)", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "categories", label: "Category Tabs", type: "object-list",
        objectFields: [
          { key: "key", label: "Key (matches forecast.category)", type: "text" },
          { key: "label", label: "Display Label", type: "text" },
        ],
      },
    ],
  },
  "how-it-works": {
    title: "How It Works",
    settingsKey: "how_it_works",
    fields: [
      { key: "section_title", label: "Title prefix (e.g. Built Different. Built For)", type: "text" },
      { key: "accent_text", label: "Accent word (e.g. Traders.)", type: "text" },
      {
        key: "steps", label: "Steps", type: "object-list",
        objectFields: [
          { key: "number", label: "Step Number (e.g. 01)", type: "text" },
          { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
          { key: "title", label: "Step Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      { key: "cta_text", label: "Bottom CTA Button Text (leave empty to hide)", type: "text" },
      { key: "cta_link", label: "Bottom CTA URL", type: "text" },
    ],
  },
  "community-reviews": {
    title: "Community Reviews",
    settingsKey: "community_reviews",
    fields: [
      { key: "section_title", label: "Title prefix (e.g. What Traders)", type: "text" },
      { key: "accent_text", label: "Accent word (e.g. Say)", type: "text" },
      { key: "display_count", label: "Reviews to Show", type: "number" },
      { key: "cta_text", label: "Write Review CTA Text", type: "text" },
      { key: "cancel_text", label: "Cancel Button Text", type: "text" },
    ],
  },
  "broker-join": {
    title: "For Brokers (CTA)",
    settingsKey: "broker_join_section",
    fields: [
      { key: "title", label: "Title prefix", type: "text" },
      { key: "accent_text", label: "Accent text (e.g. List With Us.)", type: "text" },
      { key: "subtitle", label: "Subtitle (under title)", type: "textarea" },
      { key: "description", label: "Long Description (left column)", type: "textarea" },
      { key: "benefits", label: "Benefits List", type: "list" },
      { key: "cta_text", label: "Main CTA Button Text", type: "text" },
      { key: "cta_link", label: "Main CTA Link", type: "text" },
      { key: "claim_text", label: "Claim Profile Link Text", type: "text" },
      { key: "claim_link", label: "Claim Profile Link URL", type: "text" },
      { key: "footer_note", label: "Footer Note", type: "textarea" },
      {
        key: "tiers", label: "Pricing Tier Cards", type: "object-list",
        objectFields: [
          { key: "name", label: "Tier Name", type: "text" },
          { key: "features", label: "Features (one per line)", type: "textarea" },
          { key: "cta", label: "CTA Button Text", type: "text" },
          { key: "link", label: "CTA Link", type: "text" },
          { key: "style", label: "Style", type: "select", options: STYLE_OPTIONS },
          { key: "note", label: "Bottom Note", type: "text" },
        ],
      },
    ],
  },
  "navbar": {
    title: "Navigation Bar",
    settingsKey: "navbar",
    fields: [
      { key: "more_label", label: "Label of the 'More' grouped menu", type: "text" },
      {
        key: "menu_items", label: "Menu Items (top-level)", type: "object-list",
        objectFields: [
          { key: "label", label: "Menu Label", type: "text" },
          { key: "href", label: "URL (use # if it has dropdown)", type: "text" },
          { key: "highlight", label: "Highlight (primary color)", type: "boolean" },
          {
            key: "children", label: "Dropdown Children", type: "nested-list",
            fields: [
              { key: "label", label: "Child Label", type: "text" },
              { key: "href", label: "Child URL", type: "text" },
            ],
          },
        ],
      },
    ],
  },
  "footer": {
    title: "Footer",
    settingsKey: "footer",
    fields: [
      { key: "brand_name", label: "Brand Name (left part)", type: "text" },
      { key: "brand_accent", label: "Brand Accent (right part, colored)", type: "text" },
      { key: "brand_description", label: "Brand Description", type: "textarea" },
      { key: "about_label", label: "About Link Label", type: "text" },
      { key: "contact_label", label: "Contact Link Label", type: "text" },
      {
        key: "social_links", label: "Social Media Links", type: "object-list",
        objectFields: [
          { key: "platform", label: "Platform", type: "select", options: ["X", "LinkedIn", "YouTube", "Telegram", "Facebook", "Instagram", "TikTok"] },
          { key: "url", label: "URL", type: "text" },
        ],
      },
      {
        key: "columns", label: "Footer Link Columns", type: "object-list",
        objectFields: [
          { key: "title", label: "Column Title", type: "text" },
          {
            key: "links", label: "Links in this column", type: "nested-list",
            fields: [
              { key: "label", label: "Link Label", type: "text" },
              { key: "href", label: "Link URL", type: "text" },
            ],
          },
        ],
      },
      { key: "risk_warning_label", label: "Risk Warning Label", type: "text" },
      { key: "risk_warning", label: "Risk Warning Body", type: "textarea" },
      { key: "copyright_suffix", label: "Copyright Suffix", type: "text" },
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
          { key: "up", label: "Direction is UP (green)", type: "boolean" },
        ],
      },
    ],
  },
};

// Fields that store newline-separated strings as arrays in DB
const TEXTAREA_TO_ARRAY_KEYS = new Set(["features", "items"]);

const SectionEditor = () => {
  const { section } = useParams<{ section: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const config = section ? sectionConfigs[section] : null;

  useEffect(() => {
    if (!config) return;
    const fetchData = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", config.settingsKey)
        .maybeSingle();

      let raw: Record<string, any> = {};
      if (row?.value && typeof row.value === "object" && !Array.isArray(row.value)) {
        raw = row.value as Record<string, any>;
      } else if (row?.value && Array.isArray(row.value)) {
        raw = { items: row.value };
      }
      setData(denormalizeForForm(raw));
      setLoaded(true);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.settingsKey]);

  // Convert DB-shape arrays to newline-strings for textarea editing
  const denormalizeForForm = (raw: Record<string, any>): Record<string, any> => {
    if (!config) return raw;
    const out: Record<string, any> = { ...raw };
    config.fields.forEach((field) => {
      if (field.type === "object" && out[field.key] && typeof out[field.key] === "object") {
        const obj = { ...out[field.key] };
        field.fields?.forEach((sf) => {
          if (sf.type === "textarea" && Array.isArray(obj[sf.key])) {
            obj[sf.key] = obj[sf.key].join("\n");
          }
        });
        out[field.key] = obj;
      }
      if (field.type === "object-list" && Array.isArray(out[field.key])) {
        out[field.key] = out[field.key].map((item: any) => {
          const newItem: Record<string, any> = { ...item };
          field.objectFields?.forEach((of) => {
            if (of.type === "textarea" && Array.isArray(newItem[of.key])) {
              newItem[of.key] = newItem[of.key].join("\n");
            }
          });
          return newItem;
        });
      }
    });
    return out;
  };

  // Convert form-shape (textareas with newlines) back to arrays for DB
  const normalizeForSave = (raw: Record<string, any>): Record<string, any> => {
    if (!config) return raw;
    const out: Record<string, any> = JSON.parse(JSON.stringify(raw));
    config.fields.forEach((field) => {
      if (field.type === "object" && out[field.key] && typeof out[field.key] === "object") {
        const obj = { ...out[field.key] };
        field.fields?.forEach((sf) => {
          if (sf.type === "textarea" && TEXTAREA_TO_ARRAY_KEYS.has(sf.key) && typeof obj[sf.key] === "string") {
            obj[sf.key] = obj[sf.key].split("\n").map((s: string) => s.trim()).filter(Boolean);
          }
        });
        out[field.key] = obj;
      }
      if (field.type === "object-list" && Array.isArray(out[field.key])) {
        out[field.key] = out[field.key].map((item: any) => {
          const newItem: Record<string, any> = { ...item };
          field.objectFields?.forEach((of) => {
            if (of.type === "textarea" && TEXTAREA_TO_ARRAY_KEYS.has(of.key) && typeof newItem[of.key] === "string") {
              newItem[of.key] = newItem[of.key].split("\n").map((s: string) => s.trim()).filter(Boolean);
            }
            if (of.type === "number" && typeof newItem[of.key] === "string") {
              newItem[of.key] = parseFloat(newItem[of.key]) || 0;
            }
          });
          return newItem;
        });
      }
    });
    return out;
  };

  const handleSave = async () => {
    if (!config || !user) return;
    setSaving(true);

    const normalized = normalizeForSave(data);
    const valueToSave = config.settingsKey === "promo_ticker" && Array.isArray(normalized.items)
      ? normalized.items
      : normalized;

    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", config.settingsKey)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("site_settings")
        .update({ value: valueToSave as any, updated_by: user.id, updated_at: new Date().toISOString() })
        .eq("key", config.settingsKey));
    } else {
      ({ error } = await supabase
        .from("site_settings")
        .insert({ key: config.settingsKey, value: valueToSave as any, updated_by: user.id }));
    }

    if (error) {
      toast.error(error.message);
    } else {
      try {
        await logAuditAction(user.id, "update", "site_settings", existing?.id || null, null, valueToSave);
      } catch (e) { /* non-fatal */ }
      toast.success("Section saved — refresh the homepage to see changes");
    }
    setSaving(false);
  };

  const updateField = (key: string, value: any) => setData((p) => ({ ...p, [key]: value }));

  const updateObjectField = (key: string, subKey: string, value: any) => {
    setData((p) => ({ ...p, [key]: { ...(p[key] || {}), [subKey]: value } }));
  };

  const updateListItem = (key: string, index: number, value: string) => {
    const list = [...(data[key] || [])];
    list[index] = value;
    updateField(key, list);
  };
  const addListItem = (key: string) => updateField(key, [...(data[key] || []), ""]);
  const removeListItem = (key: string, index: number) => {
    const list = [...(data[key] || [])];
    list.splice(index, 1);
    updateField(key, list);
  };

  const updateObjectListItem = (key: string, index: number, subKey: string, value: any) => {
    const list = [...(data[key] || [])];
    list[index] = { ...list[index], [subKey]: value };
    updateField(key, list);
  };
  const addObjectListItem = (key: string, fields: ObjectListSubField[]) => {
    const item: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "boolean") item[f.key] = false;
      else if (f.type === "nested-list") item[f.key] = [];
      else if (f.type === "number") item[f.key] = 0;
      else item[f.key] = "";
    });
    updateField(key, [...(data[key] || []), item]);
  };
  const removeObjectListItem = (key: string, index: number) => {
    const list = [...(data[key] || [])];
    list.splice(index, 1);
    updateField(key, list);
  };
  const moveObjectListItem = (key: string, index: number, dir: -1 | 1) => {
    const list = [...(data[key] || [])];
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    [list[index], list[newIdx]] = [list[newIdx], list[index]];
    updateField(key, list);
  };

  // ---- Nested-list (children/links inside an object-list item) helpers ----
  const updateNestedItem = (key: string, parentIdx: number, nestedKey: string, nestedIdx: number, subKey: string, value: any) => {
    const list = [...(data[key] || [])];
    const nested = [...(list[parentIdx]?.[nestedKey] || [])];
    nested[nestedIdx] = { ...nested[nestedIdx], [subKey]: value };
    list[parentIdx] = { ...list[parentIdx], [nestedKey]: nested };
    updateField(key, list);
  };
  const addNestedItem = (key: string, parentIdx: number, nestedKey: string, fields: SubField[]) => {
    const list = [...(data[key] || [])];
    const item: Record<string, any> = {};
    fields.forEach((f) => { item[f.key] = ""; });
    const nested = [...(list[parentIdx]?.[nestedKey] || []), item];
    list[parentIdx] = { ...list[parentIdx], [nestedKey]: nested };
    updateField(key, list);
  };
  const removeNestedItem = (key: string, parentIdx: number, nestedKey: string, nestedIdx: number) => {
    const list = [...(data[key] || [])];
    const nested = [...(list[parentIdx]?.[nestedKey] || [])];
    nested.splice(nestedIdx, 1);
    list[parentIdx] = { ...list[parentIdx], [nestedKey]: nested };
    updateField(key, list);
  };

  // ---- Renderers ----
  const renderSubField = (
    sf: SubField,
    value: any,
    onChange: (v: any) => void
  ) => {
    if (sf.type === "textarea") {
      return <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="font-mono text-sm min-h-[70px]" />;
    }
    if (sf.type === "number") {
      return <Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))} className="font-mono text-sm" />;
    }
    if (sf.type === "boolean") {
      return (
        <div className="flex items-center gap-2">
          <Switch checked={!!value} onCheckedChange={onChange} />
          <span className="text-xs text-muted-foreground font-mono">{value ? "ON" : "OFF"}</span>
        </div>
      );
    }
    if (sf.type === "select" && sf.options) {
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
        >
          <option value="">— Select —</option>
          {sf.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if (sf.type === "color") {
      return <Input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-10 w-20 p-1" />;
    }
    return <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="font-mono text-sm" />;
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
                {field.hint && (
                  <p className="text-[11px] text-muted-foreground font-mono mb-3 leading-relaxed">{field.hint}</p>
                )}

                {field.type === "text" && (
                  <Input value={data[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} className="font-mono text-sm" />
                )}

                {field.type === "textarea" && (
                  <Textarea value={data[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} className="font-mono text-sm min-h-[100px]" />
                )}

                {field.type === "number" && (
                  <Input type="number" value={data[field.key] ?? ""} onChange={(e) => updateField(field.key, parseInt(e.target.value) || 0)} className="font-mono text-sm w-32" />
                )}

                {field.type === "boolean" && (
                  <Switch checked={!!data[field.key]} onCheckedChange={(v) => updateField(field.key, v)} />
                )}

                {field.type === "list" && (
                  <div className="space-y-2">
                    {(data[field.key] || []).map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                        <Input value={item} onChange={(e) => updateListItem(field.key, i, e.target.value)} className="font-mono text-sm flex-1" />
                        <button onClick={() => removeListItem(field.key, i)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive/60 hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addListItem(field.key)} className="hud-action-btn p-2 px-4 flex items-center gap-2 text-xs font-mono text-primary">
                      <Plus className="w-3 h-3" /> ADD ITEM
                    </button>
                  </div>
                )}

                {field.type === "object" && field.fields && (
                  <div className="space-y-3 bg-background/50 border border-border/50 rounded p-3">
                    {field.fields.map((sf) => (
                      <div key={sf.key}>
                        <label className="text-[10px] font-mono text-muted-foreground mb-1 block uppercase tracking-wider">{sf.label}</label>
                        {renderSubField(sf, data[field.key]?.[sf.key], (v) => updateObjectField(field.key, sf.key, v))}
                        {sf.hint && <p className="text-[10px] text-muted-foreground/70 mt-1">{sf.hint}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {field.type === "object-list" && field.objectFields && (
                  <div className="space-y-3">
                    {(data[field.key] || []).map((item: Record<string, any>, i: number) => {
                      const itemKey = `${field.key}-${i}`;
                      const isCollapsed = collapsed[itemKey];
                      return (
                        <div key={i} className="bg-background/50 border border-border/50 rounded p-3 space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <button
                              onClick={() => setCollapsed({ ...collapsed, [itemKey]: !isCollapsed })}
                              className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-primary"
                            >
                              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              ITEM {i + 1}
                              {item.label || item.title || item.name || item.platform || item.pair || item.factor ? (
                                <span className="text-foreground">— {item.label || item.title || item.name || item.platform || item.pair || item.factor}</span>
                              ) : null}
                            </button>
                            <div className="flex items-center gap-1">
                              <button onClick={() => moveObjectListItem(field.key, i, -1)} disabled={i === 0} className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30">↑</button>
                              <button onClick={() => moveObjectListItem(field.key, i, 1)} disabled={i === (data[field.key]?.length || 0) - 1} className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30">↓</button>
                              <button onClick={() => removeObjectListItem(field.key, i)} className="p-1 hover:bg-destructive/10 rounded text-destructive/60 hover:text-destructive transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {!isCollapsed && field.objectFields!.map((of) => {
                            if (of.type === "nested-list" && of.fields) {
                              const nestedItems = item[of.key] || [];
                              return (
                                <div key={of.key} className="border-t border-border/30 pt-2 mt-2">
                                  <label className="text-[10px] font-mono text-primary mb-2 block uppercase tracking-wider">{of.label}</label>
                                  <div className="space-y-2 pl-2 border-l border-border/30">
                                    {nestedItems.map((nItem: any, nI: number) => (
                                      <div key={nI} className="bg-card/50 border border-border/40 rounded p-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-mono text-muted-foreground">— {nI + 1} —</span>
                                          <button onClick={() => removeNestedItem(field.key, i, of.key, nI)} className="p-0.5 text-destructive/60 hover:text-destructive">
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                        {of.fields!.map((nf) => (
                                          <div key={nf.key}>
                                            <label className="text-[9px] font-mono text-muted-foreground/70 mb-0.5 block">{nf.label}</label>
                                            {renderSubField(nf, nItem[nf.key], (v) => updateNestedItem(field.key, i, of.key, nI, nf.key, v))}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                    <button onClick={() => addNestedItem(field.key, i, of.key, of.fields!)} className="text-[10px] font-mono text-primary flex items-center gap-1 hover:underline">
                                      <Plus className="w-2.5 h-2.5" /> ADD CHILD
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div key={of.key}>
                                <label className="text-[10px] font-mono text-muted-foreground mb-1 block">{of.label}</label>
                                {renderSubField(of as SubField, item[of.key], (v) => updateObjectListItem(field.key, i, of.key, v))}
                                {of.hint && <p className="text-[10px] text-muted-foreground/70 mt-1">{of.hint}</p>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
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

          <Button onClick={handleSave} disabled={saving} className="w-full font-mono uppercase tracking-widest" size="lg">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            SAVE CHANGES
          </Button>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
