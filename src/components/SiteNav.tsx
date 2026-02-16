import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Our Solutions", path: "/solutions" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Idea Center", path: "/idea-center" },
  { label: "Why EasyClosets?", path: "/why-easyclosets" },
] as const;

export function SiteNav() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="font-serif text-xl tracking-wider shrink-0">
          <span className="text-accent">EASY</span>
          <span className="text-foreground">CLOSETS</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === link.path
                  ? "text-accent"
                  : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: CTA + mobile hamburger */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            >
              Get Started for Free
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-card">
              <div className="flex flex-col gap-1 mt-8">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.path}>
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-secondary ${
                        location.pathname === link.path
                          ? "text-accent bg-secondary"
                          : "text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
