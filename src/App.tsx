import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PromoBanner } from "@/components/PromoBanner";
import { SiteNav } from "@/components/SiteNav";
import ChatPage from "./pages/ChatPage";
import GalleryPage from "./pages/GalleryPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import WhyPage from "./pages/WhyPage";
import SolutionsPage from "./pages/SolutionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function SiteLayout() {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <PromoBanner />
      <SiteNav />
      <Outlet />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<ChatPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/idea-center" element={<GalleryPage />} />
            <Route path="/why-easyclosets" element={<WhyPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
