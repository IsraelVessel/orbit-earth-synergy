import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Trash2, Calendar, TrendingUp, Rocket, Download, Filter, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BusinessSimulator from "@/components/BusinessSimulator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Simulation {
  id: string;
  business_model: string;
  parameters: any;
  results: any;
  created_at: string;
}

interface Profile {
  first_name: string;
  last_name: string;
}

const Dashboard = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [editingSimulation, setEditingSimulation] = useState<Simulation | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Fetch simulations
      const { data: simulationsData, error } = await supabase
        .from("simulations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSimulations(simulationsData || []);
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

  const deleteSimulation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("simulations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSimulations(prev => prev.filter(sim => sim.id !== id));
      toast({
        title: "Success",
        description: "Simulation deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSimulation = (simulation: Simulation) => {
    setEditingSimulation(simulation);
  };

  const handleCloseSimulator = () => {
    setEditingSimulation(null);
    fetchDashboardData(); // Refresh data after editing
  };

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  // Filter and sort simulations
  const filteredAndSortedSimulations = useMemo(() => {
    let filtered = [...simulations];

    // Apply filter
    if (filterBy !== "all") {
      filtered = filtered.filter(sim => sim.business_model === filterBy);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "roi-desc":
          return (b.results?.roi || 0) - (a.results?.roi || 0);
        case "roi-asc":
          return (a.results?.roi || 0) - (b.results?.roi || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [simulations, filterBy, sortBy]);

  // Prepare chart data
  const trendData = useMemo(() => {
    const sortedByDate = [...simulations].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return sortedByDate.map((sim, index) => ({
      name: `Sim ${index + 1}`,
      date: new Date(sim.created_at).toLocaleDateString(),
      roi: sim.results?.roi || 0,
      netProfit: (sim.results?.netProfit || 0) / 1000000,
      profitMargin: sim.results?.profitMargin || 0,
    }));
  }, [simulations]);

  const businessModelData = useMemo(() => {
    const modelStats: { [key: string]: { count: number; avgROI: number; totalROI: number } } = {};
    simulations.forEach(sim => {
      if (!modelStats[sim.business_model]) {
        modelStats[sim.business_model] = { count: 0, avgROI: 0, totalROI: 0 };
      }
      modelStats[sim.business_model].count++;
      modelStats[sim.business_model].totalROI += sim.results?.roi || 0;
    });

    return Object.entries(modelStats).map(([name, stats]) => ({
      name,
      count: stats.count,
      avgROI: Math.round(stats.totalROI / stats.count),
    }));
  }, [simulations]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 36%)', 'hsl(189 94% 43%)', 'hsl(271 91% 65%)'];

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add header
      pdf.setFontSize(20);
      pdf.text('Simulation Dashboard Report', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add stats
      pdf.setFontSize(14);
      pdf.text('Overview Statistics', 15, 45);
      pdf.setFontSize(10);
      pdf.text(`Total Simulations: ${simulations.length}`, 15, 55);
      pdf.text(`Average ROI: ${simulations.length > 0 ? Math.round(simulations.reduce((acc, sim) => acc + (sim.results?.roi || 0), 0) / simulations.length) : 0}%`, 15, 62);
      pdf.text(`Business Models: ${new Set(simulations.map(sim => sim.business_model)).size}`, 15, 69);

      // Capture charts
      const chartsElement = document.getElementById('charts-section');
      if (chartsElement) {
        const canvas = await html2canvas(chartsElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addPage();
        pdf.text('Performance Charts', pageWidth / 2, 20, { align: 'center' });
        pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      }

      // Add simulation details
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Simulation Details', 15, 20);
      
      let yPos = 30;
      filteredAndSortedSimulations.slice(0, 10).forEach((sim, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(11);
        pdf.text(`${index + 1}. ${sim.business_model}`, 15, yPos);
        pdf.setFontSize(9);
        pdf.text(`Date: ${new Date(sim.created_at).toLocaleDateString()}`, 20, yPos + 6);
        pdf.text(`ROI: ${sim.results?.roi || 0}% | Net Profit: ${formatCurrency(sim.results?.netProfit || 0)}`, 20, yPos + 12);
        pdf.text(`Margin: ${sim.results?.profitMargin || 0}% | Break-even: Year ${sim.results?.breakEvenYear || 0}`, 20, yPos + 18);
        yPos += 26;
      });

      pdf.save(`simulation-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Success",
        description: "PDF report generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.first_name || "User"}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's your personalized dashboard with all your saved simulations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Total Simulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{simulations.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Avg ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {simulations.length > 0
                  ? Math.round(
                      simulations.reduce((acc, sim) => acc + (sim.results?.roi || 0), 0) /
                        simulations.length
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Rocket className="w-4 h-4 mr-2" />
                Business Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-500">
                {new Set(simulations.map(sim => sim.business_model)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {simulations.length > 0 && (
          <div id="charts-section" className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Performance Analytics</h2>
              <Button onClick={exportToPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF Report
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ROI & Profit Trends</CardTitle>
                  <CardDescription>Performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="roi" stroke="hsl(var(--primary))" name="ROI %" strokeWidth={2} />
                      <Line type="monotone" dataKey="profitMargin" stroke="hsl(142 76% 36%)" name="Margin %" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Model Comparison</CardTitle>
                  <CardDescription>Average ROI by model</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={businessModelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="avgROI" fill="hsl(var(--primary))" name="Avg ROI %" />
                      <Bar dataKey="count" fill="hsl(189 94% 43%)" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Net Profit Over Time</CardTitle>
                  <CardDescription>Profit trends (in millions)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="netProfit" stroke="hsl(142 76% 36%)" name="Net Profit ($M)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Model Distribution</CardTitle>
                  <CardDescription>Simulations by model type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={businessModelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="count"
                      >
                        {businessModelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Simulations List */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Saved Simulations</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {Array.from(new Set(simulations.map(sim => sim.business_model))).map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="roi-desc">Highest ROI</SelectItem>
                  <SelectItem value="roi-asc">Lowest ROI</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => navigate("/leo-commerce")} className="bg-primary">
                <Rocket className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>

          {simulations.length === 0 ? (
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Simulations Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first business simulation
              </p>
              <Button onClick={() => navigate("/leo-commerce")}>
                Create Simulation
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredAndSortedSimulations.map((simulation) => (
                <Card key={simulation.id} className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <Rocket className="w-5 h-5 text-primary" />
                          {simulation.business_model}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(simulation.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSimulation(simulation)}
                          className="text-primary hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSimulation(simulation.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">ROI</div>
                        <div className="text-xl font-bold text-primary">
                          {simulation.results?.roi || 0}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Net Profit</div>
                        <div className="text-xl font-bold text-green-500">
                          {formatCurrency(simulation.results?.netProfit || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Break-even</div>
                        <div className="text-lg font-semibold">
                          Year {simulation.results?.breakEvenYear || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Margin</div>
                        <div className="text-lg font-semibold text-cyan-500">
                          {simulation.results?.profitMargin || 0}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="text-xs text-muted-foreground mb-2">Parameters</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Launch: {formatCurrency(simulation.parameters?.launchCost || 0)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Market: {formatCurrency(simulation.parameters?.marketSize || 0)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Years: {simulation.parameters?.years || 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Simulation Modal */}
      {editingSimulation && (
        <BusinessSimulator
          model={{
            title: editingSimulation.business_model,
            icon: Rocket,
            defaults: editingSimulation.parameters,
            revenueMultiplier: 1,
            riskFactor: 10
          }}
          onClose={handleCloseSimulator}
          simulationId={editingSimulation.id}
          initialParams={editingSimulation.parameters}
          initialResults={editingSimulation.results}
        />
      )}
    </div>
  );
};

export default Dashboard;
