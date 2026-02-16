import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, TEMPLATES } from "@/lib/templates";

const CATEGORY_MAP: Record<string, string> = {
  "All": "all",
  "Closet": "closet",
  "Pantry": "pantry",
  "Laundry": "laundry",
  "Garage": "garage",
  "More Spaces": "more",
};

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const filterKey = CATEGORY_MAP[activeFilter] || "all";
  const filtered = filterKey === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === filterKey);

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="bg-secondary/50 py-12 px-4 text-center">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          Idea Center
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Browse real customer projects and professional designs for inspiration.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                activeFilter === cat
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background text-foreground border-border hover:border-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-8">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                {/* Category badge */}
                <span className="absolute top-2 left-2 bg-foreground/70 text-background text-[10px] font-medium px-2 py-0.5 rounded-full capitalize">
                  {template.category === "more" ? "More Spaces" : template.category}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground mb-2">
                  {template.title}
                </p>
                <button
                  onClick={() => navigate(`/?template=${encodeURIComponent(template.title)}`)}
                  className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  Design something like this &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
