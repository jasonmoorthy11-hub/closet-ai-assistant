import { Link } from "react-router-dom";
import { Search, Ruler, Palette, Truck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex-1 bg-background overflow-auto min-h-0">
      {/* Hero */}
      <div className="bg-secondary/50 py-12 px-4 text-center">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          How It Works
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          From inspiration to installation — designing your custom space is
          simple with EasyClosets.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`flex gap-5 items-start p-5 rounded-xl border transition-colors ${
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
          <Link to="/">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Designing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
