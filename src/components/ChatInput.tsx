import { useRef, useState } from "react";
import { Camera, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  disabled?: boolean;
  centered?: boolean;
}

export function ChatInput({ onSend, disabled, centered }: ChatInputProps) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
      <Button
        size="icon"
        className="shrink-0 bg-accent text-accent-foreground rounded-full h-9 w-9 hover:bg-accent/90"
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
        aria-label="Upload a photo"
      >
        <Camera className="h-5 w-5" />
      </Button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Describe your space or upload a photo..."
        className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
        disabled={disabled}
      />
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
