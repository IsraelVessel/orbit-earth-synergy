import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";

interface Simulation {
  id: string;
  business_model: string;
  parameters: any;
  results: any;
  created_at: string;
}

const SimulationCompare = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimulations();
  }, [searchParams]);

  const fetchSimulations = async () => {
    const ids = searchParams.get("ids")?.split(",") || [];
    
    if (ids.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 simulations to compare",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("simulations")
        .select("*")
        .in("id", ids);

      if (error) throw error;
      setSimulations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading simulations...</p>
        </div>
      </div>
    );
  }

  // Prepare comparison data
  const metricsData = simulations.map((sim) => ({
    name: sim.business_model.substring(0, 20),
    ROI: sim.results.roi || 0,
    "Profit Margin": sim.results.profit_margin || 0,
    "Net Profit (K)": (sim.results.net_profit || 0) / 1000,
  }));

  const radarData = [
    {
      metric: "ROI",
      ...Object.fromEntries(simulations.map((sim, i) => [`Sim${i + 1}`, sim.results.roi || 0])),
    },
    {
      metric: "Profit Margin",
      ...Object.fromEntries(simulations.map((sim, i) => [`Sim${i + 1}`, sim.results.profit_margin || 0])),
    },
    {
      metric: "Revenue (K)",
      ...Object.fromEntries(simulations.map((sim, i) => [`Sim${i + 1}`, (sim.results.total_revenue || 0) / 1000])),
    },
    {
      metric: "Efficiency",
      ...Object.fromEntries(simulations.map((sim, i) => [`Sim${i + 1}`, ((sim.results.net_profit || 0) / (sim.results.total_costs || 1)) * 100])),
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Compare Simulations</h1>
          <p className="text-muted-foreground">
            Side-by-side comparison of {simulations.length} simulations
          </p>
        </div>

        {/* Side-by-side comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {simulations.map((sim, index) => (
            <Card key={sim.id} className="border-2" style={{ borderColor: COLORS[index % COLORS.length] }}>
              <CardHeader>
                <CardTitle className="text-lg">{sim.business_model}</CardTitle>
                <CardDescription>
                  {new Date(sim.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className="font-bold">{sim.results.roi?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Net Profit</span>
                  <span className="font-bold">₦{sim.results.net_profit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <span className="font-bold">{sim.results.profit_margin?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-bold">₦{sim.results.total_revenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Costs</span>
                  <span className="font-bold">₦{sim.results.total_costs?.toLocaleString()}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/simulation/${sim.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Comparison</CardTitle>
              <CardDescription>ROI, Profit Margin, and Net Profit comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ROI" fill={COLORS[0]} />
                  <Bar dataKey="Profit Margin" fill={COLORS[1]} />
                  <Bar dataKey="Net Profit (K)" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
              <CardDescription>Multi-dimensional performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  {simulations.map((_, index) => (
                    <Radar
                      key={`sim${index}`}
                      name={simulations[index].business_model.substring(0, 15)}
                      dataKey={`Sim${index + 1}`}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Parameters Comparison Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Parameters Comparison</CardTitle>
            <CardDescription>Detailed comparison of input parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold">Parameter</th>
                    {simulations.map((sim, index) => (
                      <th key={sim.id} className="text-left p-3 font-semibold" style={{ color: COLORS[index % COLORS.length] }}>
                        {sim.business_model.substring(0, 20)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(simulations[0]?.parameters || {}).map((param) => (
                    <tr key={param} className="border-b border-border">
                      <td className="p-3 text-sm capitalize">{param.replace(/_/g, ' ')}</td>
                      {simulations.map((sim) => (
                        <td key={sim.id} className="p-3 text-sm">
                          {typeof sim.parameters[param] === 'number'
                            ? sim.parameters[param].toLocaleString()
                            : String(sim.parameters[param])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimulationCompare;
