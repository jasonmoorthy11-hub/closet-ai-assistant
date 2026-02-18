import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  useEffect(() => {
    document.title = "Idea Center | EasyClosets";
  }, []);

  const filterKey = CATEGORY_MAP[activeFilter] || "all";
  const filtered = filterKey === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === filterKey);

  return (
    <div className="flex-1 bg-background overflow-auto">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-8">
        {/* Header */}
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2 text-center">
          Idea Center
        </h1>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-8">
          Browse real customer projects and professional designs for inspiration
        </p>

        {/* Filter chips */}
        <div className="flex gap-2 py-3 justify-center flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                activeFilter === cat
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background text-foreground border-border hover:border-accent hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-8">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => navigate(`/?template=${template.id}`)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.style.backgroundColor = "hsl(var(--secondary))";
                  }}
                />
                <span className="absolute top-2 left-2 bg-foreground/70 text-background text-[10px] font-medium px-2 py-0.5 rounded-full capitalize">
                  {template.category === "more" ? "More Spaces" : template.category}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground mb-1">{template.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{template.description}</p>
                <span className="text-xs font-medium text-accent group-hover:text-accent/80 transition-colors">
                  Design something like this &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-8 pb-4">
          <h2 className="font-serif text-2xl text-foreground mb-4">
            Ready to design your space?
          </h2>
          <Link
            to="/"
            className="inline-block bg-accent text-accent-foreground font-medium text-sm px-6 py-3 rounded-full hover:bg-accent/90 transition-colors"
          >
            Start Designing
          </Link>
        </div>
      </div>
    </div>
  );
}
