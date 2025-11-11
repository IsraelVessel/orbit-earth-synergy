import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy, Target, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Simulation {
  id: string;
  business_model: string;
  parameters: any;
  results: any;
  created_at: string;
}

interface DashboardInsightsWidgetProps {
  simulations: Simulation[];
}

const DashboardInsightsWidget = ({ simulations }: DashboardInsightsWidgetProps) => {
  if (!simulations.length) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Insights
          </CardTitle>
          <CardDescription>No simulations yet. Create your first one to see insights!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate insights
  const topPerformers = [...simulations]
    .sort((a, b) => (b.results?.roi || 0) - (a.results?.roi || 0))
    .slice(0, 3);

  const recentMilestones = simulations
    .filter(sim => {
      const roi = sim.results?.roi || 0;
      const profitMargin = sim.results?.profit_margin || 0;
      const breakEven = sim.results?.break_even_year || 0;
      return roi >= 100 || profitMargin >= 30 || (breakEven > 0 && breakEven <= 3);
    })
    .slice(0, 3);

  const avgROI = simulations.reduce((sum, sim) => sum + (sim.results?.roi || 0), 0) / simulations.length;
  const totalRevenue = simulations.reduce((sum, sim) => sum + (sim.results?.net_profit || 0), 0);

  // Prepare chart data - group by business model
  const modelPerformance: { [key: string]: { count: number; avgROI: number } } = {};
  simulations.forEach(sim => {
    if (!modelPerformance[sim.business_model]) {
      modelPerformance[sim.business_model] = { count: 0, avgROI: 0 };
    }
    modelPerformance[sim.business_model].count++;
    modelPerformance[sim.business_model].avgROI += sim.results?.roi || 0;
  });

  const chartData = Object.entries(modelPerformance).map(([model, data]) => ({
    name: model.split(' ')[0], // Shorten name
    roi: Math.round(data.avgROI / data.count),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Average ROI</p>
            <p className="text-2xl font-bold text-green-500">{avgROI.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Projected Profit</p>
            <p className="text-2xl font-bold text-primary">${(totalRevenue / 1000000).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Simulations</p>
            <p className="text-2xl font-bold">{simulations.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPerformers.map((sim, index) => (
            <div key={sim.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                  {index + 1}
                </Badge>
                <div>
                  <p className="text-sm font-medium truncate max-w-[150px]">{sim.business_model}</p>
                  <p className="text-xs text-muted-foreground">ROI: {sim.results?.roi?.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-cyan-500" />
            Recent Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentMilestones.length > 0 ? (
            recentMilestones.map((sim) => {
              const roi = sim.results?.roi || 0;
              const profitMargin = sim.results?.profit_margin || 0;
              const breakEven = sim.results?.break_even_year || 0;
              
              let milestone = "";
              if (roi >= 150) milestone = "🎯 ROI 150%+";
              else if (roi >= 100) milestone = "✅ ROI 100%+";
              else if (profitMargin >= 30) milestone = "💰 30% Margin";
              else if (breakEven > 0 && breakEven <= 3) milestone = "⚡ Quick Break-even";

              return (
                <div key={sim.id} className="p-2 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium truncate">{sim.business_model}</p>
                  <p className="text-xs text-muted-foreground">{milestone}</p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No milestones reached yet</p>
          )}
        </CardContent>
      </Card>

      {/* Performance by Model Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-base">Performance by Business Model</CardTitle>
          <CardDescription>Average ROI across different models</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }}
              />
              <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardInsightsWidget;
