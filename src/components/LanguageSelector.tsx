import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { languages } from "@/data/countries";

const LanguageSelector = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("naft-language");
      return languages.find((l) => l.code === saved) || languages[0];
    }
    return languages[0];
  });

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const handleSelect = (lang: typeof languages[0]) => {
    setSelected(lang);
    localStorage.setItem("naft-language", lang.code);
    setOpen(false);
    // RTL support
    const rtlLangs = ["ar", "ur"];
    document.documentElement.dir = rtlLangs.includes(lang.code) ? "rtl" : "ltr";
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-[34px] h-[34px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title={selected.name}
      >
        <Globe className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-xl max-h-[320px] overflow-y-auto z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                selected.code === lang.code
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
