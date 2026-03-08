import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import DevCopilot from "./pages/DevCopilot";
import QATester from "./pages/QATester";
import LeadResearch from "./pages/LeadResearch";
import CompetitiveIntel from "./pages/CompetitiveIntel";
import DataExtractor from "./pages/DataExtractor";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/leads" element={<LeadResearch />} />
          <Route path="/intel" element={<CompetitiveIntel />} />
          <Route path="/extract" element={<DataExtractor />} />
          <Route path="/workflows" element={<WorkflowBuilder />} />
          <Route path="/copilot" element={<DevCopilot />} />
          <Route path="/qa" element={<QATester />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
