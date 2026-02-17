import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onNewChat: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-secondary/50 border-b border-border px-4 py-2">
      <span className="text-sm font-medium text-muted-foreground">
        AI Design Assistant
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewChat}
        className="text-accent hover:bg-accent/10 h-7 text-xs"
        aria-label="Start new chat"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        New Chat
      </Button>
    </div>
  );
}
