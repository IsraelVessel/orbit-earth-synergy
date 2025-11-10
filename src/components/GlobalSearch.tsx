import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, FileText, Layout, Activity, Wind, Building2, Microscope, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Simulation {
  id: string;
  business_model: string;
  created_at: string;
  results: any;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<Simulation[]>([]);

  useEffect(() => {
    if (open) {
      fetchSimulations();
    }
  }, [open]);

  const fetchSimulations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("simulations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setSimulations(data);
  };

  const modules = [
    { name: "Air Quality", path: "/air-quality", icon: Wind },
    { name: "Urban Health", path: "/urban-health", icon: Building2 },
    { name: "Space Biology", path: "/space-biology", icon: Microscope },
    { name: "LEO Commerce", path: "/leo-commerce", icon: Rocket },
  ];

  const pages = [
    { name: "Dashboard", path: "/dashboard", icon: Layout },
    { name: "Profile", path: "/profile", icon: Activity },
  ];

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search simulations, modules, or pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.path}
              onSelect={() => handleSelect(page.path)}
              className="cursor-pointer"
            >
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Modules">
          {modules.map((module) => (
            <CommandItem
              key={module.path}
              onSelect={() => handleSelect(module.path)}
              className="cursor-pointer"
            >
              <module.icon className="mr-2 h-4 w-4" />
              <span>{module.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {simulations.length > 0 && (
          <CommandGroup heading="Recent Simulations">
            {simulations.map((sim) => (
              <CommandItem
                key={sim.id}
                onSelect={() => handleSelect("/dashboard")}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>
                  {sim.business_model} - ROI: {sim.results?.roi?.toFixed(1)}%
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
