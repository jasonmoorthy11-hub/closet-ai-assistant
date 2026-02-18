import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Ruler, Palette, Truck, Heart } from "lucide-react";

const STEPS = [
  {
    number: 1,
    title: "Explore",
    description:
      "Browse customer projects and professional designs for inspiration. Visit our Idea Center to see what's possible.",
    Icon: Search,
  },
  {
    number: 2,
    title: "Measure",
    description:
      "Take accurate measurements of your space — it only takes about 10 minutes with a tape measure.",
    Icon: Ruler,
  },
  {
    number: 3,
    title: "Design with AI",
    description:
      "Upload a photo and our AI design tool will create a custom EasyClosets layout tailored to your space and style.",
    Icon: Palette,
    highlight: true,
  },
  {
    number: 4,
    title: "Receive & Install",
    description:
      "Fast free shipping on orders $400+. Simple 4–6 hour DIY installation with phone support available.",
    Icon: Truck,
  },
  {
    number: 5,
    title: "Enjoy",
    description:
      "Organize your space and enjoy beautifully designed storage for years to come. Backed by our Limited Lifetime Warranty.",
    Icon: Heart,
  },
];

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = "How It Works | EasyClosets";
  }, []);

  return (
    <div className="flex-1 bg-background overflow-auto">
      {/* Steps */}
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-8">
        {/* Header */}
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2 text-center">
          How It Works
        </h1>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-10">
          From inspiration to installation — designing your custom space is simple with EasyClosets
        </p>
        <div className="space-y-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`flex gap-5 items-start p-5 rounded-xl border transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                step.highlight
                  ? "border-accent bg-accent/5"
                  : "border-border bg-card"
              }`}
            >
              {/* Number + Icon */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    step.highlight
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <step.Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mt-1.5">
                  Step {step.number}
                </span>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-serif text-lg text-foreground mb-1">
                  {step.title}
                  {step.highlight && (
                    <span className="ml-2 inline-block text-xs font-sans font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full align-middle">
                      Our AI
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
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
