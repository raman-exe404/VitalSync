import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "as", label: "অসমীয়া" },
  { code: "ur", label: "اردو" },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function changeLanguage(code: string) {
    setCurrent(code);
    setOpen(false);

    if (code === "en") {
      // Reset to English — remove google translate cookie and reload
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      window.location.reload();
      return;
    }

    // Set google translate cookie directly
    const value = `/en/${code}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;

    // If translate element exists, trigger it
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    } else {
      // Load Google Translate script if not loaded yet
      if (!document.getElementById("google-translate-script")) {
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", autoDisplay: false },
            "google_translate_element"
          );
          // After init, trigger language change
          setTimeout(() => {
            const s = document.querySelector(".goog-te-combo") as HTMLSelectElement;
            if (s) { s.value = code; s.dispatchEvent(new Event("change")); }
          }, 500);
        };
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
      } else {
        window.location.reload();
      }
    }
  }

  const currentLabel = LANGUAGES.find(l => l.code === current)?.label || "English";

  return (
    <div ref={ref} className="relative">
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" className="hidden" />

      <button
        onClick={() => setOpen(o => !o)}
        className="clay-card p-2.5 rounded-full hover:scale-105 transition-transform flex items-center gap-1.5 px-3"
        aria-label="Change language"
        translate="no"
      >
        <Languages className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-body font-semibold text-foreground hidden sm:block" translate="no">{currentLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 clay-card p-2 w-44 max-h-72 overflow-y-auto shadow-xl animate-fade-in" translate="no">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              translate="no"
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors hover:bg-muted flex items-center justify-between ${current === lang.code ? "bg-primary/10 text-primary font-semibold" : "text-foreground"}`}
            >
              {lang.label}
              {current === lang.code && <span className="text-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
