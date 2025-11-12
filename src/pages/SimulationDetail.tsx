import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, DollarSign, PieChart as PieChartIcon, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ShareSimulationDialog } from "@/components/ShareSimulationDialog";
import { VersionHistoryDialog } from "@/components/VersionHistoryDialog";
import { ABTestDialog } from "@/components/ABTestDialog";
import { ScenarioPlanner } from "@/components/ScenarioPlanner";

interface Simulation {
  id: string;
  business_model: string;
  parameters: any;
  results: any;
  created_at: string;
}

const SimulationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [localParameters, setLocalParameters] = useState<any>(null);
  const [localResults, setLocalResults] = useState<any>(null);

  useEffect(() => {
    fetchSimulation();
  }, [id]);

  const exportToPDF = async () => {
    if (!reportRef.current || !simulation) return;
    
    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(`${simulation.business_model} - Simulation Report`, pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      
      // Capture the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 35;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${simulation.business_model.replace(/\s+/g, '_')}_Report.pdf`);
      
      toast({
        title: "Success",
        description: "PDF report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const fetchSimulation = async () => {
    try {
      const { data, error } = await supabase
        .from("simulations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setSimulation(data);
      if (data) {
        setLocalParameters(data.parameters);
        setLocalResults(data.results);
      }
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
          <p className="text-muted-foreground">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-6 py-8">
          <p className="text-muted-foreground">Simulation not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const results = localResults || simulation.results;
  const parameters = localParameters || simulation.parameters;

  const handleVersionRestore = (restoredParams: any, restoredResults: any) => {
    setLocalParameters(restoredParams);
    setLocalResults(restoredResults);
  };

  const handleScenarioRun = (scenarioParams: any) => {
    setLocalParameters(scenarioParams);
    // Recalculate results based on new parameters (simplified calculation)
    const totalRevenue = scenarioParams.monthlyRevenue * 12 || results.total_revenue;
    const totalCosts = scenarioParams.productionCost * 12 || results.total_costs;
    const netProfit = totalRevenue - totalCosts;
    const roi = ((netProfit / (scenarioParams.initialInvestment || 1)) * 100);
    const profitMargin = ((netProfit / totalRevenue) * 100);
    
    setLocalResults({
      ...results,
      total_revenue: totalRevenue,
      total_costs: totalCosts,
      net_profit: netProfit,
      roi,
      profit_margin: profitMargin,
    });
  };

  // Prepare time-series projection data (simulated 12-month projection)
  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const growthRate = 1 + (results.roi / 100 / 12);
    return {
      month: `Month ${month}`,
      revenue: Math.round(results.total_revenue * Math.pow(growthRate, month)),
      costs: Math.round(results.total_costs * (1 + month * 0.02)),
      profit: Math.round((results.total_revenue * Math.pow(growthRate, month)) - (results.total_costs * (1 + month * 0.02))),
    };
  });

  // Cost breakdown data
  const costBreakdownData = [
    { name: "Fixed Costs", value: parameters.fixed_costs || results.total_costs * 0.4 },
    { name: "Variable Costs", value: parameters.variable_costs || results.total_costs * 0.3 },
    { name: "Marketing", value: parameters.marketing_budget || results.total_costs * 0.2 },
    { name: "Operations", value: results.total_costs * 0.1 },
  ];

  // Revenue streams data
  const revenueStreamsData = [
    { name: "Primary Revenue", value: results.total_revenue * 0.7 },
    { name: "Secondary Revenue", value: results.total_revenue * 0.2 },
    { name: "Other Income", value: results.total_revenue * 0.1 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex gap-2">
            <ShareSimulationDialog 
              simulationId={simulation.id} 
              simulationName={simulation.business_model} 
            />
            <VersionHistoryDialog 
              simulationId={simulation.id} 
              onRestore={handleVersionRestore}
            />
            <ABTestDialog 
              businessModel={simulation.business_model}
              baseParameters={parameters}
            />
            <Button onClick={exportToPDF} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        <div ref={reportRef}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{simulation.business_model}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(simulation.created_at).toLocaleDateString()}
            </p>
          </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.roi?.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{results.net_profit?.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.profit_margin?.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Streams</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
          </TabsList>

          <TabsContent value="projections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>12-Month Financial Projection</CardTitle>
                <CardDescription>Projected revenue, costs, and profit over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="costs" stroke="#82ca9d" strokeWidth={2} name="Costs" />
                    <Line type="monotone" dataKey="profit" stroke="#ffc658" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Distribution</CardTitle>
                  <CardDescription>Breakdown of total costs by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={costBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Comparison</CardTitle>
                  <CardDescription>Detailed cost amounts by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                      <Bar dataKey="value" fill="#8884d8">
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Breakdown of revenue by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueStreamsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#82ca9d"
                        dataKey="value"
                      >
                        {revenueStreamsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                  <CardDescription>Detailed revenue amounts by stream</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueStreamsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                      <Bar dataKey="value" fill="#82ca9d">
                        {revenueStreamsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Parameters</CardTitle>
                <CardDescription>Input parameters used for this simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(parameters).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 border border-border rounded-lg">
                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Scenario Planning */}
        <div className="mt-8">
          <ScenarioPlanner
            simulationId={simulation.id}
            baseParameters={parameters}
            onRunScenario={handleScenarioRun}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationDetail;
