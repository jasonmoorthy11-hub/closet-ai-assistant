import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page Not Found | EasyClosets";
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 bg-background">
      <p className="font-serif text-6xl text-accent mb-4">404</p>
      <h1 className="font-serif text-2xl text-foreground mb-2">This closet is empty</h1>
      <p className="text-muted-foreground text-sm text-center max-w-sm mb-8">
        We couldn't find the page you're looking for. Let's get you back to designing your dream space.
      </p>
      <div className="flex gap-3">
        <Link to="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Start Designing
          </Button>
        </Link>
        <Link to="/idea-center">
          <Button variant="outline">Browse Ideas</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
