import { MessageSquare, LayoutGrid } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { path: "/", label: "Chat", icon: MessageSquare },
  { path: "/gallery", label: "Gallery", icon: LayoutGrid },
];

export function BottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background">
      {TABS.map((tab) => {
        const active = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
