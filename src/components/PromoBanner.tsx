import { useState } from "react";
import { X } from "lucide-react";

const PROMO_DISMISSED_KEY = "easyclosets_promo_dismissed";

export function PromoBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(PROMO_DISMISSED_KEY) === "true"
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(PROMO_DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="bg-accent text-accent-foreground text-xs py-1.5 px-4 text-center relative">
      <span className="pr-8">
        Up to <strong>25% OFF</strong> with code <strong>ORGANIZE</strong> — 15% off $2,000+ | 20% off $5,000+ | 25% off $10,000+
      </span>
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss promo"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
