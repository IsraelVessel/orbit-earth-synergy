import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Droplets, Thermometer, TreePine, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const UrbanHealth = () => {
  const sustainabilityData = [
    { metric: "Air Quality", score: 72, target: 85 },
    { metric: "Water Quality", score: 88, target: 90 },
    { metric: "Green Space", score: 65, target: 75 },
    { metric: "Energy Efficiency", score: 78, target: 85 },
    { metric: "Waste Management", score: 82, target: 90 },
    { metric: "Public Transport", score: 70, target: 80 },
  ];

  const cityMetrics = [
    { city: "NYC", airQuality: 68, greenSpace: 45, waterQuality: 82, temperature: 72 },
    { city: "LA", airQuality: 62, greenSpace: 38, waterQuality: 75, temperature: 85 },
    { city: "Chicago", airQuality: 71, greenSpace: 52, waterQuality: 88, temperature: 65 },
    { city: "Houston", airQuality: 64, greenSpace: 42, waterQuality: 78, temperature: 88 },
    { city: "Seattle", airQuality: 82, greenSpace: 68, waterQuality: 92, temperature: 62 },
  ];

  const indicators = [
    { icon: Thermometer, label: "Temperature", value: "72°F", status: "optimal", color: "text-green-500" },
    { icon: Droplets, label: "Water Quality", value: "88%", status: "good", color: "text-blue-500" },
    { icon: TreePine, label: "Green Coverage", value: "45%", status: "moderate", color: "text-yellow-500" },
    { icon: Building2, label: "Urban Density", value: "8.5K/km²", status: "high", color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Users className="w-10 h-10 text-primary" />
              Urban Health & Sustainability
            </h1>
            <p className="text-muted-foreground">NASA Earth observation data for smart city planning</p>
          </div>
        </div>

        {/* Key Indicators */}
        <div className="grid md:grid-cols-4 gap-6">
          {indicators.map((indicator, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_hsl(189_94%_55%/0.2)] transition-all">
              <div className="space-y-4">
                <indicator.icon className={`w-8 h-8 ${indicator.color}`} />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{indicator.label}</div>
                  <div className="text-3xl font-bold">{indicator.value}</div>
                  <div className={`text-sm mt-1 capitalize ${indicator.color}`}>{indicator.status}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sustainability Radar */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Sustainability Index</h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={sustainabilityData}>
                <PolarGrid stroke="hsl(237 36% 18%)" />
                <PolarAngleAxis dataKey="metric" stroke="hsl(215 20% 65%)" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis stroke="hsl(215 20% 65%)" />
                <Radar name="Current Score" dataKey="score" stroke="hsl(189 94% 55%)" fill="hsl(189 94% 55%)" fillOpacity={0.3} />
                <Radar name="Target" dataKey="target" stroke="hsl(280 80% 60%)" fill="hsl(280 80% 60%)" fillOpacity={0.2} />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(222 47% 8%)", 
                    border: "1px solid hsl(237 36% 18%)",
                    borderRadius: "0.5rem"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* City Comparison */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Multi-City Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={cityMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(237 36% 18%)" />
                <XAxis dataKey="city" stroke="hsl(215 20% 65%)" />
                <YAxis stroke="hsl(215 20% 65%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(222 47% 8%)", 
                    border: "1px solid hsl(237 36% 18%)",
                    borderRadius: "0.5rem"
                  }}
                />
                <Legend />
                <Bar dataKey="airQuality" fill="hsl(189 94% 55%)" name="Air Quality" />
                <Bar dataKey="greenSpace" fill="hsl(120 60% 50%)" name="Green Space" />
                <Bar dataKey="waterQuality" fill="hsl(210 80% 60%)" name="Water Quality" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Data Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <TreePine className="w-5 h-5 text-green-500" />
              Green Infrastructure
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Urban green spaces reduce temperature by 2-8°F and improve air quality by 25%.
            </p>
            <div className="text-2xl font-bold text-green-500">+18%</div>
            <div className="text-xs text-muted-foreground">Growth since 2020</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Water Management
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Smart water systems reduce waste by 30% and improve quality monitoring.
            </p>
            <div className="text-2xl font-bold text-blue-500">88%</div>
            <div className="text-xs text-muted-foreground">Quality Score</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-500" />
              Heat Islands
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Urban heat islands identified through thermal imaging require mitigation.
            </p>
            <div className="text-2xl font-bold text-orange-500">15</div>
            <div className="text-xs text-muted-foreground">Areas Identified</div>
          </Card>
        </div>

        {/* NASA Data Sources */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="font-bold mb-4">NASA Earth Observation Data Sources</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-primary">MODIS</div>
              <div className="text-muted-foreground">Land cover & vegetation</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-primary">Landsat</div>
              <div className="text-muted-foreground">Urban heat mapping</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-primary">VIIRS</div>
              <div className="text-muted-foreground">Night-time imagery</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-primary">SMAP</div>
              <div className="text-muted-foreground">Soil moisture data</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UrbanHealth;
