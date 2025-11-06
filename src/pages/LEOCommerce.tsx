import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, DollarSign, TrendingUp, Globe, Satellite, Factory } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import BusinessSimulator from "@/components/BusinessSimulator";
import { useState } from "react";

const LEOCommerce = () => {
  const [activeSimulation, setActiveSimulation] = useState<any>(null);
  const marketData = [
    { sector: "Manufacturing", value: 35, color: "hsl(189 94% 55%)" },
    { sector: "Research", value: 25, color: "hsl(280 80% 60%)" },
    { sector: "Tourism", value: 20, color: "hsl(120 60% 50%)" },
    { sector: "Communications", value: 15, color: "hsl(45 90% 60%)" },
    { sector: "Other", value: 5, color: "hsl(0 80% 60%)" },
  ];

  const revenueProjection = [
    { year: "2024", revenue: 450, investment: 320 },
    { year: "2025", revenue: 680, investment: 425 },
    { year: "2026", revenue: 920, investment: 580 },
    { year: "2027", revenue: 1340, investment: 720 },
    { year: "2028", revenue: 1850, investment: 890 },
    { year: "2029", revenue: 2480, investment: 1100 },
  ];

  const businessModels = [
    {
      title: "Zero-G Manufacturing",
      icon: Factory,
      viability: "High",
      investment: "$50M - $200M",
      roi: "5-7 years",
      description: "Manufacturing of advanced materials, pharmaceuticals, and fiber optics in microgravity conditions.",
      challenges: ["Launch costs", "Supply chain logistics", "Quality control"],
      color: "from-cyan-500 to-blue-600",
      defaults: {
        launchCost: 100000000,
        operationalCost: 30000000,
        marketSize: 1500000000,
        marketShare: 0.08,
        growthRate: 35,
        years: 10
      },
      revenueMultiplier: 1.2,
      riskFactor: 15
    },
    {
      title: "Space Tourism",
      icon: Rocket,
      viability: "Medium",
      investment: "$100M - $500M",
      roi: "8-10 years",
      description: "Suborbital and orbital tourism experiences for private customers and researchers.",
      challenges: ["Safety certification", "Insurance costs", "Market demand"],
      color: "from-purple-500 to-pink-600",
      defaults: {
        launchCost: 250000000,
        operationalCost: 80000000,
        marketSize: 2000000000,
        marketShare: 0.05,
        growthRate: 45,
        years: 10
      },
      revenueMultiplier: 1.5,
      riskFactor: 25
    },
    {
      title: "Satellite Services",
      icon: Satellite,
      viability: "High",
      investment: "$20M - $80M",
      roi: "3-5 years",
      description: "In-orbit servicing, repair, and refueling of existing satellite infrastructure.",
      challenges: ["Technical complexity", "Regulatory approval", "Debris mitigation"],
      color: "from-green-500 to-emerald-600",
      defaults: {
        launchCost: 50000000,
        operationalCost: 20000000,
        marketSize: 800000000,
        marketShare: 0.12,
        growthRate: 28,
        years: 10
      },
      revenueMultiplier: 1.0,
      riskFactor: 10
    },
  ];

  const getViabilityColor = (viability: string) => {
    switch (viability) {
      case "High": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "Low": return "bg-red-500/10 text-red-500 border-red-500/30";
      default: return "bg-card";
    }
  };

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
              <Globe className="w-10 h-10 text-primary" />
              LEO Commercialization
            </h1>
            <p className="text-muted-foreground">Sustainable business models for low Earth orbit operations</p>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Market Distribution 2024</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(222 47% 8%)", 
                    border: "1px solid hsl(237 36% 18%)",
                    borderRadius: "0.5rem"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Revenue Projections</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(237 36% 18%)" />
                <XAxis dataKey="year" stroke="hsl(215 20% 65%)" />
                <YAxis stroke="hsl(215 20% 65%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(222 47% 8%)", 
                    border: "1px solid hsl(237 36% 18%)",
                    borderRadius: "0.5rem"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(189 94% 55%)" strokeWidth={3} name="Revenue ($M)" />
                <Line type="monotone" dataKey="investment" stroke="hsl(280 80% 60%)" strokeWidth={3} name="Investment ($M)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Business Models */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Business Model Simulator
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {businessModels.map((model, index) => (
              <Card key={index} className="group p-6 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_hsl(189_94%_55%/0.3)] transition-all">
                <div className="space-y-4">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${model.color}`}>
                    <model.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{model.title}</h3>
                      <Badge variant="outline" className={getViabilityColor(model.viability)}>
                        {model.viability}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Investment</span>
                      <span className="font-medium">{model.investment}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ROI Timeline</span>
                      <span className="font-medium">{model.roi}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="text-sm font-medium mb-2">Key Challenges:</div>
                    <div className="flex flex-wrap gap-2">
                      {model.challenges.map((challenge, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                    onClick={() => setActiveSimulation(model)}
                  >
                    Run Simulation
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <TrendingUp className="w-8 h-8 text-cyan-500 mb-3" />
            <h3 className="font-bold mb-2">Market Growth</h3>
            <div className="text-3xl font-bold text-cyan-500 mb-1">42%</div>
            <p className="text-sm text-muted-foreground">Annual growth rate (2024-2029)</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <Satellite className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-bold mb-2">Active Companies</h3>
            <div className="text-3xl font-bold text-purple-500 mb-1">87</div>
            <p className="text-sm text-muted-foreground">Commercial LEO operators</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <DollarSign className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-bold mb-2">Investment</h3>
            <div className="text-3xl font-bold text-green-500 mb-1">$2.4B</div>
            <p className="text-sm text-muted-foreground">Total LEO investment 2024</p>
          </Card>
        </div>

        {/* Regulatory & Sustainability */}
        <Card className="p-8 bg-gradient-cosmic/20 border-primary/30">
          <h2 className="text-2xl font-bold mb-6">Sustainability & Compliance</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-primary">Regulatory Framework</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  FCC licensing for commercial operations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  International space law compliance (Outer Space Treaty)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Debris mitigation and end-of-life disposal requirements
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Export control and technology transfer regulations
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-primary">Sustainability Goals</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Zero-debris launches by 2030
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  100% satellite deorbiting within 5 years post-mission
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Sustainable propulsion systems (electric, green propellants)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Active debris removal and in-orbit recycling initiatives
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Simulation Modal */}
      {activeSimulation && (
        <BusinessSimulator 
          model={activeSimulation} 
          onClose={() => setActiveSimulation(null)} 
        />
      )}
    </div>
  );
};

export default LEOCommerce;
