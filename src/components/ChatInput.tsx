import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_PHRASES = [
  "Describe your closet space...",
  "Upload a photo of your room...",
  "Try a walk-in closet design...",
  "What style are you going for?",
  "Tell me your storage needs...",
  "I have a reach-in closet to redesign...",
  "Show me a modern pantry...",
  "Help me organize my garage...",
];

function useTypingPlaceholder(phrases: string[], active: boolean) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);
  const deletingRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    cancelledRef.current = false;

    const schedule = (fn: () => void, ms: number) => {
      if (!cancelledRef.current) setTimeout(fn, ms);
    };

    const tick = () => {
      if (cancelledRef.current) return;
      const phrase = phrases[idxRef.current];

      if (!deletingRef.current) {
        setDisplayed((prev) => {
          const next = phrase.slice(0, prev.length + 1);
          if (next === phrase) {
            deletingRef.current = true;
            schedule(tick, 2250);
          } else {
            schedule(tick, 85);
          }
          return next;
        });
      } else {
        setDisplayed((prev) => {
          const next = prev.slice(0, -1);
          if (next === "") {
            deletingRef.current = false;
            idxRef.current = (idxRef.current + 1) % phrases.length;
            schedule(tick, 350);
          } else {
            schedule(tick, 40);
          }
          return next;
        });
      }
    };

    schedule(tick, 120);
    return () => { cancelledRef.current = true; };
  }, [active, phrases]);

  return { displayed, phraseIndex: idxRef.current };
}

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  disabled?: boolean;
  centered?: boolean;
  hideCamera?: boolean;
}

export function ChatInput({ onSend, disabled, centered, hideCamera }: ChatInputProps) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { displayed: placeholder, phraseIndex } = useTypingPlaceholder(PLACEHOLDER_PHRASES, !text && !disabled);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSend("", file);
      e.target.value = "";
    }
  };

  const inner = (
    <div className="bg-card border border-border rounded-2xl shadow-sm px-3 py-2 flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {!hideCamera && (
        <Button
          size="icon"
          className="shrink-0 bg-accent text-accent-foreground rounded-full h-9 w-9 hover:bg-accent/90"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          aria-label="Upload a photo"
        >
          <Camera className="h-5 w-5" />
        </Button>
      )}
      <div className="flex-1 relative">
        {!text && (
          <span className="absolute inset-0 flex items-center px-4 text-sm text-muted-foreground pointer-events-none" aria-hidden="true">
            {placeholder.split("").map((char, i) => (
              <span
                key={`${phraseIndex}-${i}`}
                className="typing-char-fade"
                style={{ animationDelay: `${i * 15}ms` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        )}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="w-full bg-secondary rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/50"
          disabled={disabled}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-accent"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        aria-label="Send message"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );

  if (centered) {
    return inner;
  }

  return (
    <div className="px-3 py-2">
      {inner}
    </div>
  );
}
