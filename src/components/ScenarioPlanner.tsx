import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScenarioPlannerProps {
  simulationId: string;
  baseParameters: any;
  onRunScenario: (parameters: any) => void;
}

export const ScenarioPlanner = ({ simulationId, baseParameters, onRunScenario }: ScenarioPlannerProps) => {
  const [scenarioName, setScenarioName] = useState("");
  const [description, setDescription] = useState("");
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery({
    queryKey: ["simulation-scenarios", simulationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulation_scenarios")
        .select("*")
        .eq("simulation_id", simulationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createScenarioMutation = useMutation({
    mutationFn: async () => {
      const scenarioParameters = { ...baseParameters };
      
      Object.entries(adjustments).forEach(([key, multiplier]) => {
        if (scenarioParameters[key] !== undefined) {
          scenarioParameters[key] *= multiplier;
        }
      });

      const { error } = await supabase.from("simulation_scenarios").insert({
        simulation_id: simulationId,
        scenario_name: scenarioName,
        description,
        parameters: scenarioParameters,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Scenario saved successfully" });
      setScenarioName("");
      setDescription("");
      setAdjustments({});
      queryClient.invalidateQueries({ queryKey: ["simulation-scenarios", simulationId] });
    },
  });

  const presetScenarios = [
    { name: "Best Case", icon: TrendingUp, factor: 1.3, description: "+30% all parameters" },
    { name: "Worst Case", icon: TrendingDown, factor: 0.7, description: "-30% all parameters" },
    { name: "Conservative", icon: Minus, factor: 0.9, description: "-10% all parameters" },
  ];

  const applyPreset = (factor: number, name: string) => {
    const adjusted = { ...baseParameters };
    Object.keys(adjusted).forEach(key => {
      if (typeof adjusted[key] === 'number') {
        adjusted[key] *= factor;
      }
    });
    onRunScenario(adjusted);
    toast({ title: `${name} scenario applied` });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">What-If Analysis</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {presetScenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Button
                key={scenario.name}
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => applyPreset(scenario.factor, scenario.name)}
              >
                <Icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">{scenario.name}</div>
                  <div className="text-xs text-muted-foreground">{scenario.description}</div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="scenarioName">Scenario Name</Label>
            <Input
              id="scenarioName"
              placeholder="e.g., Market downturn"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the market conditions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <Button
            onClick={() => createScenarioMutation.mutate()}
            disabled={!scenarioName || createScenarioMutation.isPending}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Save Scenario
          </Button>
        </div>
      </div>

      {scenarios.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Saved Scenarios</h4>
          <div className="space-y-2">
            {scenarios.slice(0, 5).map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onRunScenario(scenario.parameters)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{scenario.scenario_name}</p>
                  {scenario.description && (
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                  )}
                </div>
                <Badge variant="secondary">Load</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};