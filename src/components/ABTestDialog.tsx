import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TestTube2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface ABTestDialogProps {
  businessModel: string;
  baseParameters: any;
}

export const ABTestDialog = ({ businessModel, baseParameters }: ABTestDialogProps) => {
  const [testName, setTestName] = useState("");
  const [numVariations, setNumVariations] = useState(3);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createTestMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate variations with parameter adjustments
      const variations = Array.from({ length: numVariations }, (_, i) => {
        const variation = { ...baseParameters };
        const factor = 1 + (i * 0.2 - 0.2); // -20%, 0%, +20%, etc.
        
        if (variation.initialInvestment) variation.initialInvestment *= factor;
        if (variation.monthlyRevenue) variation.monthlyRevenue *= factor;
        if (variation.productionCost) variation.productionCost *= factor;
        
        return {
          name: `Variation ${String.fromCharCode(65 + i)}`,
          parameters: variation,
        };
      });

      const { data, error } = await supabase
        .from("ab_tests")
        .insert({
          user_id: user.id,
          test_name: testName,
          business_model: businessModel,
          base_parameters: baseParameters,
          variations,
          status: "running",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "A/B test created successfully" });
      setIsOpen(false);
      setTestName("");
      navigate(`/simulation-compare?testId=${data.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Error creating A/B test", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TestTube2 className="h-4 w-4 mr-2" />
          Run A/B Test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create A/B Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              placeholder="e.g., Revenue optimization test"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variations">Number of Variations</Label>
            <Input
              id="variations"
              type="number"
              min={2}
              max={5}
              value={numVariations}
              onChange={(e) => setNumVariations(parseInt(e.target.value) || 2)}
            />
            <p className="text-xs text-muted-foreground">
              Variations will automatically adjust parameters by ±20% increments
            </p>
          </div>
          <Button 
            onClick={() => createTestMutation.mutate()} 
            disabled={!testName || createTestMutation.isPending}
            className="w-full"
          >
            Create Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};