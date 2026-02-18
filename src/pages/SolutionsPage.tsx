import { useEffect } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  {
    title: "Walk-In Closet",
    description:
      "Multiple walls, island options, and a full wardrobe system to organize everything you own.",
    components: "Shelves, drawers, double-hang rods, jewelry trays, valet rods, shoe shelves",
    imageUrl: "https://images.unsplash.com/photo-1649361811423-a55616f7ab11?w=600&h=400&fit=crop",
  },
  {
    title: "Reach-In Closet",
    description:
      "Maximize small spaces with a single-wall system — 24–30\" deep with every inch optimized.",
    components: "Adjustable shelves, double-hang rods, pull-out baskets, hamper inserts",
    imageUrl: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=400&fit=crop",
  },
  {
    title: "Pantry",
    description:
      "Organize your kitchen with pull-out shelves, baskets, and smart storage solutions.",
    components: "Pull-out shelves, baskets, spice racks, door-mounted organizers",
    imageUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=400&fit=crop",
  },
  {
    title: "Laundry Room",
    description:
      "Add cabinets, folding surfaces, and hanging space to keep laundry organized and efficient.",
    components: "Cabinets, hanging rods, shelves, hamper pull-outs, folding counter",
    imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop",
  },
  {
    title: "Garage",
    description:
      "Wall and ceiling storage systems to reclaim your garage space and keep tools organized.",
    components: "Wall panels, hooks, overhead racks, cabinets, workbench",
    imageUrl: "https://images.unsplash.com/photo-1635108198322-18c814f9b70f?w=600&h=400&fit=crop",
  },
];

const MATERIALS = [
  '3/4" furniture-grade engineered wood',
  "Thermally-fused laminate surface",
  "Scratch-resistant finishes",
  'Custom-cut to 1/16" precision',
];

export default function SolutionsPage() {
  useEffect(() => {
    document.title = "Our Solutions | EasyClosets";
  }, []);

  return (
    <div className="flex-1 bg-background overflow-auto">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-8 space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
            Our Solutions
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Custom storage for every room in your home — designed by AI, built to last
          </p>
        </div>

        {/* Category cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              to={`/?template=${encodeURIComponent(cat.title)}`}
              className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <img
                src={cat.imageUrl}
                alt={cat.title}
                className="w-full h-44 object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.style.backgroundColor = "hsl(var(--secondary))";
                }}
              />
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-serif text-lg text-foreground mb-2">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {cat.description}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  <span className="font-medium text-foreground">
                    Key components:
                  </span>{" "}
                  {cat.components}
                </p>
                <span className="mt-auto text-xs font-medium text-accent group-hover:text-accent/80 transition-colors">
                  Design yours &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Materials section */}
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h2 className="font-serif text-2xl text-foreground mb-6">
            Premium Materials
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {MATERIALS.map((m) => (
              <div
                key={m}
                className="bg-secondary rounded-lg px-4 py-3 text-sm text-foreground"
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
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
