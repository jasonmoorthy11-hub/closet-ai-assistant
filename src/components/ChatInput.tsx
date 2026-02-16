import { useRef, useState } from "react";
import { Camera, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
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

  return (
    <div className="border-t border-border bg-background px-3 py-2 flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground"
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
      >
        <Camera className="h-5 w-5" />
      </Button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
        className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
        disabled={disabled}
      />
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-primary"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}
