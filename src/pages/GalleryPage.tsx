import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, TEMPLATES } from "@/lib/templates";

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const filtered = activeFilter === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-primary px-4 py-3">
        <h1 className="text-lg font-bold text-primary-foreground tracking-tight">Inspiration Gallery</h1>
      </header>

      <div className="flex-1 overflow-y-auto pt-14 pb-16 px-4">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                activeFilter === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => navigate(`/?template=${encodeURIComponent(template.title)}`)}
              className="group relative overflow-hidden rounded-lg aspect-[4/3]"
            >
              <img
                src={template.imageUrl}
                alt={template.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs font-medium text-white">{template.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
