import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      // Only show if not already installed
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        setShow(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <div className="clay-card p-4 flex items-center gap-3 border border-primary/30 bg-background/95 backdrop-blur">
        <img src="/logo.png" alt="VitalSync" className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-foreground text-sm">Install VitalSync</p>
          <p className="text-xs text-muted-foreground font-body">Add to home screen for quick access</p>
        </div>
        <button onClick={handleInstall}
          className="clay-btn px-3 py-2 text-xs font-body font-bold flex items-center gap-1 flex-shrink-0">
          <Download className="w-3 h-3" /> Install
        </button>
        <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
