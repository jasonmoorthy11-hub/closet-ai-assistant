import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onNewChat: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-primary px-4 py-3">
      <h1 className="text-lg font-bold text-primary-foreground tracking-tight">EasyClosets</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewChat}
        className="text-primary-foreground hover:bg-primary-foreground/10"
      >
        <Plus className="h-4 w-4 mr-1" />
        New Chat
      </Button>
    </header>
  );
}
