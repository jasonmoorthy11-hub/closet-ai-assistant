import { Link } from "react-router-dom";
import { Shield, Truck, Wrench, Leaf, Scissors, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const VALUE_PROPS = [
  {
    title: "Quality You Can Trust",
    description:
      "3/4\" furniture-grade engineered wood with thermally-fused laminate. Each 8-foot section supports up to 1,200 lbs.",
    Icon: Award,
  },
  {
    title: "Factory-Direct Savings",
    description:
      "Save up to 40% compared to retail. No middlemen, no showroom markup — just real-time transparent pricing.",
    Icon: Truck,
  },
  {
    title: "Simple DIY Installation",
    description:
      "Pre-cut, ready-to-install components. Most installations take 4–6 hours — no experience needed, phone support included.",
    Icon: Wrench,
  },
];

const HIGHLIGHTS = [
  { text: "Limited Lifetime Warranty", Icon: Shield },
  { text: "Free shipping on orders $400+", Icon: Truck },
  { text: "Custom-cut to the nearest 1/16\"", Icon: Scissors },
  { text: "100% recycled wood fiber core", Icon: Leaf },
  { text: "CARB2 compliant / eco-certified", Icon: Leaf },
];

const TESTIMONIALS = [
  {
    name: "Denise W.",
    location: "Walk-In Closet",
    quote:
      "The quality is outstanding and it was so easy and much cheaper to install myself. I love how everything has a place now!",
  },
  {
    name: "Kim",
    location: "Michigan",
    quote:
      "SO DURABLE and highly customizable. The design tools made it simple to plan exactly what I needed. Best investment for our home.",
  },
  {
    name: "Wendy",
    location: "Fresno, CA",
    quote:
      "The designer expertise was incredible. Stress-free ordering from start to finish. Our closet looks like it belongs in a magazine.",
  },
];

export default function WhyPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <div className="bg-secondary/50 py-12 px-4 text-center">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
          Why Choose EasyClosets?
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Premium custom storage, factory-direct to your door — at a fraction of
          the cost.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Value props grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {VALUE_PROPS.map((prop) => (
            <div
              key={prop.title}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto mb-4">
                <prop.Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">
                {prop.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prop.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional highlights */}
        <div>
          <h2 className="font-serif text-2xl text-foreground text-center mb-6">
            Built to Last
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3"
              >
                <item.Icon className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="font-serif text-2xl text-foreground text-center mb-6">
            What Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-card border border-border rounded-xl p-6"
              >
                <p className="text-sm text-muted-foreground leading-relaxed italic mb-4">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-serif text-2xl text-foreground mb-4">
            Ready to design your space?
          </h2>
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
