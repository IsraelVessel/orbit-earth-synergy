import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Trash2, Calendar, TrendingUp, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

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

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
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

        {/* Simulations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Saved Simulations</h2>
            <Button onClick={() => navigate("/leo-commerce")} className="bg-primary">
              <Rocket className="w-4 h-4 mr-2" />
              Create New Simulation
            </Button>
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
              {simulations.map((simulation) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSimulation(simulation.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
    </div>
  );
};

export default Dashboard;
