import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from "recharts";
import { Calculator, TrendingUp, AlertCircle, CheckCircle, DollarSign, Rocket, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SimulationParams {
  launchCost: number;
  operationalCost: number;
  marketSize: number;
  marketShare: number;
  growthRate: number;
  years: number;
}

interface BusinessModel {
  title: string;
  icon: any;
  defaults: SimulationParams;
  revenueMultiplier: number;
  riskFactor: number;
}

interface SimulatorProps {
  model: BusinessModel;
  onClose: () => void;
}

const BusinessSimulator = ({ model, onClose }: SimulatorProps) => {
  const [params, setParams] = useState<SimulationParams>(model.defaults);
  const [results, setResults] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
    roi: 0,
    breakEvenYear: 0,
    profitMargin: 0
  });
  const [saving, setSaving] = useState(false);
  const { toast: showToast } = useToast();

  // Run simulation whenever parameters change
  useEffect(() => {
    runSimulation();
  }, [params]);

  const runSimulation = () => {
    const simulationData = [];
    let cumulativeRevenue = 0;
    let cumulativeCost = 0;
    let breakEven = 0;

    for (let year = 0; year <= params.years; year++) {
      // Calculate market penetration with S-curve growth
      const marketPenetration = params.marketShare * (1 - Math.exp(-params.growthRate * year / 100));
      
      // Revenue calculation with market size and growth
      const baseRevenue = params.marketSize * marketPenetration * model.revenueMultiplier;
      const yearlyGrowth = Math.pow(1 + params.growthRate / 100, year);
      const revenue = baseRevenue * yearlyGrowth;
      
      // Cost calculation (decreases over time due to economies of scale)
      const launchCostYear = year === 0 ? params.launchCost : params.launchCost * 0.3; // One-time heavy launch, then maintenance
      const operationalCostYear = params.operationalCost * Math.pow(0.95, year); // 5% reduction per year
      const totalCost = launchCostYear + operationalCostYear;
      
      // Risk adjustment
      const riskAdjustedRevenue = revenue * (1 - model.riskFactor / 100);
      
      cumulativeRevenue += riskAdjustedRevenue;
      cumulativeCost += totalCost;
      
      const netProfitYear = riskAdjustedRevenue - totalCost;
      const cumulativeProfit = cumulativeRevenue - cumulativeCost;
      
      if (cumulativeProfit > 0 && breakEven === 0) {
        breakEven = year;
      }

      simulationData.push({
        year: `Year ${year}`,
        revenue: Math.round(riskAdjustedRevenue),
        costs: Math.round(totalCost),
        profit: Math.round(netProfitYear),
        cumulativeProfit: Math.round(cumulativeProfit),
        marketShare: Math.round(marketPenetration * 100) / 100
      });
    }

    setResults(simulationData);
    
    const finalMetrics = {
      totalRevenue: Math.round(cumulativeRevenue),
      totalCost: Math.round(cumulativeCost),
      netProfit: Math.round(cumulativeRevenue - cumulativeCost),
      roi: Math.round(((cumulativeRevenue - cumulativeCost) / cumulativeCost) * 100),
      breakEvenYear: breakEven,
      profitMargin: Math.round(((cumulativeRevenue - cumulativeCost) / cumulativeRevenue) * 100)
    };
    
    setMetrics(finalMetrics);
  };

  const updateParam = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
    toast.success("Simulation updated", { duration: 1000 });
  };

  const getViabilityStatus = () => {
    if (metrics.roi > 100 && metrics.breakEvenYear <= 5) {
      return { label: "Highly Viable", color: "text-green-500", icon: CheckCircle };
    } else if (metrics.roi > 50 && metrics.breakEvenYear <= 7) {
      return { label: "Viable", color: "text-yellow-500", icon: AlertCircle };
    } else {
      return { label: "High Risk", color: "text-red-500", icon: AlertCircle };
    }
  };

  const viability = getViabilityStatus();

  const saveSimulation = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("simulations").insert([{
        user_id: user.id,
        business_model: model.title,
        parameters: params as any,
        results: metrics as any,
      }]);

      if (error) throw error;

      showToast({
        title: "Success",
        description: "Simulation saved successfully!",
      });
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="container mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Calculator className="w-8 h-8 text-primary" />
              {model.title} Simulation
            </h2>
            <p className="text-muted-foreground mt-2">Adjust parameters to model your business scenario</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveSimulation} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Simulation"}
            </Button>
            <Button onClick={onClose} variant="outline">Close Simulator</Button>
          </div>
        </div>

        {/* Viability Badge */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <viability.icon className={`w-6 h-6 ${viability.color}`} />
              <div>
                <div className="text-sm text-muted-foreground">Business Viability</div>
                <div className={`text-xl font-bold ${viability.color}`}>{viability.label}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{metrics.roi}%</div>
                <div className="text-xs text-muted-foreground">ROI</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">${(metrics.totalRevenue / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-muted-foreground">Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">Year {metrics.breakEvenYear}</div>
                <div className="text-xs text-muted-foreground">Break-even</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-500">{metrics.profitMargin}%</div>
                <div className="text-xs text-muted-foreground">Margin</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Parameters Panel */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Simulation Parameters
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Initial Launch Cost</Label>
                  <span className="text-sm font-medium text-primary">${(params.launchCost / 1000000).toFixed(0)}M</span>
                </div>
                <Slider
                  value={[params.launchCost]}
                  onValueChange={([value]) => updateParam('launchCost', value)}
                  min={10000000}
                  max={500000000}
                  step={10000000}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Annual Operating Cost</Label>
                  <span className="text-sm font-medium text-primary">${(params.operationalCost / 1000000).toFixed(0)}M</span>
                </div>
                <Slider
                  value={[params.operationalCost]}
                  onValueChange={([value]) => updateParam('operationalCost', value)}
                  min={5000000}
                  max={200000000}
                  step={5000000}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Target Market Size</Label>
                  <span className="text-sm font-medium text-primary">${(params.marketSize / 1000000).toFixed(0)}M</span>
                </div>
                <Slider
                  value={[params.marketSize]}
                  onValueChange={([value]) => updateParam('marketSize', value)}
                  min={50000000}
                  max={5000000000}
                  step={50000000}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Market Share Target</Label>
                  <span className="text-sm font-medium text-primary">{(params.marketShare * 100).toFixed(1)}%</span>
                </div>
                <Slider
                  value={[params.marketShare * 100]}
                  onValueChange={([value]) => updateParam('marketShare', value / 100)}
                  min={0.1}
                  max={25}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Annual Growth Rate</Label>
                  <span className="text-sm font-medium text-primary">{params.growthRate}%</span>
                </div>
                <Slider
                  value={[params.growthRate]}
                  onValueChange={([value]) => updateParam('growthRate', value)}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Projection Years</Label>
                  <span className="text-sm font-medium text-primary">{params.years} years</span>
                </div>
                <Slider
                  value={[params.years]}
                  onValueChange={([value]) => updateParam('years', value)}
                  min={3}
                  max={15}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Risk Factor: {model.riskFactor}%</span>
                  </div>
                  <p className="text-xs">Revenue adjusted for market uncertainty and operational risks</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Charts Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue vs Costs */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Financial Projection</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(237 36% 18%)" />
                  <XAxis dataKey="year" stroke="hsl(215 20% 65%)" />
                  <YAxis stroke="hsl(215 20% 65%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 8%)",
                      border: "1px solid hsl(237 36% 18%)",
                      borderRadius: "0.5rem"
                    }}
                    formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(189 94% 55%)" fill="hsl(189 94% 55% / 0.3)" name="Revenue" />
                  <Area type="monotone" dataKey="costs" stroke="hsl(0 80% 60%)" fill="hsl(0 80% 60% / 0.3)" name="Costs" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Cumulative Profit */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Cumulative Profit Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(237 36% 18%)" />
                  <XAxis dataKey="year" stroke="hsl(215 20% 65%)" />
                  <YAxis stroke="hsl(215 20% 65%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 8%)",
                      border: "1px solid hsl(237 36% 18%)",
                      borderRadius: "0.5rem"
                    }}
                    formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="cumulativeProfit" stroke="hsl(120 60% 50%)" strokeWidth={3} name="Cumulative Profit" />
                  <Line type="monotone" dataKey="profit" stroke="hsl(280 80% 60%)" strokeWidth={2} name="Annual Profit" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Key Insights */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                <div className="text-sm text-muted-foreground">Net Profit</div>
                <div className="text-2xl font-bold text-green-500">${(metrics.netProfit / 1000000).toFixed(1)}M</div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <TrendingUp className="w-6 h-6 text-cyan-500 mb-2" />
                <div className="text-sm text-muted-foreground">Total Investment</div>
                <div className="text-2xl font-bold text-cyan-500">${(metrics.totalCost / 1000000).toFixed(1)}M</div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CheckCircle className="w-6 h-6 text-purple-500 mb-2" />
                <div className="text-sm text-muted-foreground">Profit Margin</div>
                <div className="text-2xl font-bold text-purple-500">{metrics.profitMargin}%</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSimulator;
