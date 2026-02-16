import { useState } from "react";
import { Camera, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Camera,
    title: "Upload a photo of your space",
    description: "Snap a photo of your closet or space — our AI will redesign it instantly with custom EasyClosets cabinetry.",
  },
  {
    icon: MessageSquare,
    title: "Chat about your style and needs",
    description: "Tell us your preferences — modern, traditional, walk-in, reach-in, and more.",
  },
  {
    icon: Sparkles,
    title: "Get AI-generated design inspiration",
    description: "Receive custom design concepts tailored to your space and style.",
  },
];

interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3D2E22]/95 px-8 text-white">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-sm text-white/70 hover:text-white"
      >
        Skip
      </button>

      <div className="flex flex-col items-center text-center max-w-xs">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
          <Icon className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-3">{current.title}</h2>
        <p className="text-white/80 text-sm leading-relaxed">{current.description}</p>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${i === step ? "bg-white" : "bg-white/30"}`}
          />
        ))}
      </div>

      <Button
        onClick={() => {
          if (step < STEPS.length - 1) setStep(step + 1);
          else onDismiss();
        }}
        className="mt-8 bg-accent text-white hover:bg-accent/90 rounded-full px-8"
      >
        {step < STEPS.length - 1 ? "Next" : "Get Started"}
      </Button>
    </div>
  );
}
