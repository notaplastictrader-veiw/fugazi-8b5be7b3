import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type TranslationKey = string;
type Translations = Record<string, string>;

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key, fallback) => fallback || key,
  dir: "ltr",
});

const RTL_LANGS = ["ar", "ur"];

// Static translations for common UI strings across 15 languages
const translations: Record<string, Translations> = {
  en: {
    "nav.brokerReviews": "Broker Reviews",
    "nav.propFirms": "Prop Firms",
    "nav.sports": "Sports",
    "nav.signals": "Signals",
    "nav.education": "Education",
    "nav.more": "More",
    "nav.login": "Log In",
    "nav.joinFree": "Join Free",
    "nav.promotions": "Promotions",
    "nav.news": "News",
    "nav.calendar": "Calendar",
    "nav.about": "About Us",
    "nav.contact": "Contact Us",
    "nav.affiliate": "Become an Affiliate",
    "hero.title": "We Test Brokers. You Trade Smarter.",
    "hero.subtitle": "Unbiased broker reviews, real trader signals, and scam alerts — all in one place.",
    "hero.search": "Search brokers, signals, news...",
    "brokers.title": "Broker Reviews",
    "brokers.search": "Search brokers...",
    "signals.title": "Verified Signal Groups",
    "signals.search": "Search signal groups...",
    "compare.title": "Compare Brokers",
    "login.title": "Welcome Back",
    "login.subtitle": "Sign in to your account",
    "login.email": "Email address",
    "login.password": "Password",
    "login.forgot": "Forgot password?",
    "login.submit": "Log In",
    "login.or": "or",
    "login.google": "Continue with Google",
    "login.noAccount": "Don't have an account?",
    "signup.title": "Join Free",
    "signup.subtitle": "Create your trader account",
    "signup.email": "Email address",
    "signup.password": "Password (min 6 characters)",
    "signup.confirm": "Confirm password",
    "signup.submit": "Create Account",
    "signup.hasAccount": "Already have an account?",
    "signup.google": "Continue with Google",
    "dashboard.overview": "Overview",
    "dashboard.reviews": "My Reviews",
    "dashboard.complaints": "My Complaints",
    "dashboard.watchlist": "Watchlist",
    "dashboard.settings": "Settings",
    "dashboard.referrals": "Referrals",
    "referral.title": "Referral Program",
    "referral.subtitle": "Share your unique link and earn rewards for every referral.",
    "referral.createCode": "Generate Referral Code",
    "referral.yourCode": "Your Referral Code",
    "referral.copyLink": "Copy Link",
    "referral.copied": "Copied!",
    "referral.clicks": "Clicks",
    "referral.conversions": "Conversions",
    "referral.earnings": "Earnings",
    "footer.rights": "All rights reserved.",
  },
  ar: {
    "nav.brokerReviews": "تقييم الوسطاء",
    "nav.propFirms": "شركات التمويل",
    "nav.sports": "الرياضة",
    "nav.signals": "الإشارات",
    "nav.education": "التعليم",
    "nav.more": "المزيد",
    "nav.login": "تسجيل الدخول",
    "nav.joinFree": "انضم مجاناً",
    "hero.title": "نختبر الوسطاء. أنت تتداول بذكاء.",
    "hero.search": "ابحث عن الوسطاء...",
    "brokers.title": "تقييم الوسطاء",
    "brokers.search": "ابحث عن الوسطاء...",
    "signals.title": "مجموعات الإشارات المعتمدة",
    "compare.title": "مقارنة الوسطاء",
    "login.title": "مرحباً بعودتك",
    "login.submit": "تسجيل الدخول",
    "signup.title": "انضم مجاناً",
    "signup.submit": "إنشاء حساب",
    "dashboard.overview": "نظرة عامة",
    "dashboard.reviews": "مراجعاتي",
    "dashboard.complaints": "شكاواي",
    "dashboard.watchlist": "قائمة المراقبة",
    "dashboard.settings": "الإعدادات",
    "dashboard.referrals": "الإحالات",
    "referral.title": "برنامج الإحالة",
    "referral.clicks": "النقرات",
    "referral.conversions": "التحويلات",
    "referral.earnings": "الأرباح",
  },
  bn: {
    "nav.brokerReviews": "ব্রোকার রিভিউ",
    "nav.propFirms": "প্রপ ফার্ম",
    "nav.sports": "স্পোর্টস",
    "nav.signals": "সিগন্যাল",
    "nav.education": "শিক্ষা",
    "nav.more": "আরো",
    "nav.login": "লগ ইন",
    "nav.joinFree": "ফ্রি জয়েন",
    "hero.title": "আমরা ব্রোকার টেস্ট করি। আপনি স্মার্ট ট্রেড করুন।",
    "hero.search": "ব্রোকার, সিগন্যাল খুঁজুন...",
    "dashboard.overview": "ওভারভিউ",
    "dashboard.reviews": "আমার রিভিউ",
    "dashboard.complaints": "আমার অভিযোগ",
    "dashboard.watchlist": "ওয়াচলিস্ট",
    "dashboard.settings": "সেটিংস",
    "dashboard.referrals": "রেফারেল",
    "referral.title": "রেফারেল প্রোগ্রাম",
    "referral.clicks": "ক্লিক",
    "referral.conversions": "কনভার্সন",
    "referral.earnings": "আয়",
  },
  hi: {
    "nav.brokerReviews": "ब्रोकर समीक्षा",
    "nav.propFirms": "प्रॉप फर्म",
    "nav.signals": "सिग्नल",
    "nav.education": "शिक्षा",
    "nav.more": "और",
    "nav.login": "लॉग इन",
    "nav.joinFree": "मुफ्त जुड़ें",
    "hero.title": "हम ब्रोकर्स की जांच करते हैं। आप स्मार्ट ट्रेड करें।",
    "dashboard.referrals": "रेफरल",
    "referral.title": "रेफरल कार्यक्रम",
  },
  ur: {
    "nav.brokerReviews": "بروکر ریویوز",
    "nav.propFirms": "پراپ فرمز",
    "nav.signals": "سگنلز",
    "nav.education": "تعلیم",
    "nav.more": "مزید",
    "nav.login": "لاگ ان",
    "nav.joinFree": "مفت شامل ہوں",
    "hero.title": "ہم بروکرز کی جانچ کرتے ہیں۔ آپ ذہانت سے ٹریڈ کریں۔",
    "dashboard.referrals": "ریفرل",
    "referral.title": "ریفرل پروگرام",
  },
  es: {
    "nav.brokerReviews": "Reseñas de Brokers",
    "nav.propFirms": "Prop Firms",
    "nav.signals": "Señales",
    "nav.education": "Educación",
    "nav.more": "Más",
    "nav.login": "Iniciar Sesión",
    "nav.joinFree": "Únete Gratis",
    "hero.title": "Probamos Brokers. Tú Operas Mejor.",
    "dashboard.referrals": "Referencias",
    "referral.title": "Programa de Referencias",
  },
  fr: {
    "nav.brokerReviews": "Avis Courtiers",
    "nav.propFirms": "Prop Firms",
    "nav.signals": "Signaux",
    "nav.education": "Éducation",
    "nav.more": "Plus",
    "nav.login": "Connexion",
    "nav.joinFree": "Inscription Gratuite",
    "hero.title": "Nous Testons les Courtiers. Vous Tradez Plus Intelligemment.",
    "dashboard.referrals": "Parrainages",
    "referral.title": "Programme de Parrainage",
  },
  ms: {
    "nav.brokerReviews": "Ulasan Broker",
    "nav.login": "Log Masuk",
    "nav.joinFree": "Sertai Percuma",
    "dashboard.referrals": "Rujukan",
    "referral.title": "Program Rujukan",
  },
  id: {
    "nav.brokerReviews": "Ulasan Broker",
    "nav.login": "Masuk",
    "nav.joinFree": "Gabung Gratis",
    "dashboard.referrals": "Referensi",
    "referral.title": "Program Referensi",
  },
  pt: {
    "nav.brokerReviews": "Avaliações de Corretoras",
    "nav.login": "Entrar",
    "nav.joinFree": "Cadastre-se Grátis",
    "dashboard.referrals": "Indicações",
    "referral.title": "Programa de Indicação",
  },
  tr: {
    "nav.brokerReviews": "Broker İncelemeleri",
    "nav.login": "Giriş",
    "nav.joinFree": "Ücretsiz Katıl",
    "dashboard.referrals": "Referanslar",
    "referral.title": "Referans Programı",
  },
  ru: {
    "nav.brokerReviews": "Обзоры Брокеров",
    "nav.login": "Войти",
    "nav.joinFree": "Присоединиться",
    "dashboard.referrals": "Рефералы",
    "referral.title": "Реферальная Программа",
  },
  zh: {
    "nav.brokerReviews": "经纪商评测",
    "nav.login": "登录",
    "nav.joinFree": "免费加入",
    "dashboard.referrals": "推荐",
    "referral.title": "推荐计划",
  },
  de: {
    "nav.brokerReviews": "Broker-Bewertungen",
    "nav.login": "Anmelden",
    "nav.joinFree": "Kostenlos Beitreten",
    "dashboard.referrals": "Empfehlungen",
    "referral.title": "Empfehlungsprogramm",
  },
  ja: {
    "nav.brokerReviews": "ブローカーレビュー",
    "nav.login": "ログイン",
    "nav.joinFree": "無料で参加",
    "dashboard.referrals": "紹介",
    "referral.title": "紹介プログラム",
  },
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("naft-language") || "en";
    }
    return "en";
  });

  const dir = RTL_LANGS.includes(locale) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, dir]);

  const setLocale = useCallback((code: string) => {
    setLocaleState(code);
    localStorage.setItem("naft-language", code);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[locale]?.[key] || translations.en?.[key] || fallback || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
