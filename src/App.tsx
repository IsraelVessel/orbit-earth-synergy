import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AirQuality from "./pages/AirQuality";
import UrbanHealth from "./pages/UrbanHealth";
import SpaceBiology from "./pages/SpaceBiology";
import LEOCommerce from "./pages/LEOCommerce";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/air-quality" element={<AirQuality />} />
          <Route path="/urban-health" element={<UrbanHealth />} />
          <Route path="/space-biology" element={<SpaceBiology />} />
          <Route path="/leo-commerce" element={<LEOCommerce />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
