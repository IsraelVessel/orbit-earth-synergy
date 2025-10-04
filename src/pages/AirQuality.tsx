import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wind, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const AirQuality = () => {
  // Mock data for air quality monitoring
  const airQualityData = [
    { time: "00:00", pm25: 35, pm10: 45, no2: 28, o3: 42 },
    { time: "04:00", pm25: 42, pm10: 52, no2: 32, o3: 38 },
    { time: "08:00", pm25: 68, pm10: 82, no2: 58, o3: 35 },
    { time: "12:00", pm25: 75, pm10: 95, no2: 65, o3: 62 },
    { time: "16:00", pm25: 62, pm10: 78, no2: 52, o3: 58 },
    { time: "20:00", pm25: 48, pm10: 58, no2: 38, o3: 45 },
  ];

  const currentMetrics = [
    { label: "PM2.5", value: "48", unit: "µg/m³", status: "moderate", trend: "+5%" },
    { label: "PM10", value: "58", unit: "µg/m³", status: "moderate", trend: "+3%" },
    { label: "NO₂", value: "38", unit: "ppb", status: "good", trend: "-2%" },
    { label: "O₃", value: "45", unit: "ppb", status: "good", trend: "+1%" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-500";
      case "moderate": return "text-yellow-500";
      case "unhealthy": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "good": return "bg-green-500/10 border-green-500/30";
      case "moderate": return "bg-yellow-500/10 border-yellow-500/30";
      case "unhealthy": return "bg-red-500/10 border-red-500/30";
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
              <Wind className="w-10 h-10 text-primary" />
              Air Quality Prediction
            </h1>
            <p className="text-muted-foreground">Real-time atmospheric monitoring and public health forecasting</p>
          </div>
        </div>

        {/* Current Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {currentMetrics.map((metric, index) => (
            <Card key={index} className={`p-6 ${getStatusBg(metric.status)} border`}>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium capitalize ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {metric.trend}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Chart */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6">24-Hour Pollutant Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={airQualityData}>
              <defs>
                <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(189 94% 55%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(189 94% 55%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280 80% 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(280 80% 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(237 36% 18%)" />
              <XAxis dataKey="time" stroke="hsl(215 20% 65%)" />
              <YAxis stroke="hsl(215 20% 65%)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(222 47% 8%)", 
                  border: "1px solid hsl(237 36% 18%)",
                  borderRadius: "0.5rem"
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="pm25" stroke="hsl(189 94% 55%)" fillOpacity={1} fill="url(#colorPM25)" name="PM2.5" />
              <Area type="monotone" dataKey="pm10" stroke="hsl(280 80% 60%)" fillOpacity={1} fill="url(#colorPM10)" name="PM10" />
              <Line type="monotone" dataKey="no2" stroke="hsl(120 60% 50%)" name="NO₂" />
              <Line type="monotone" dataKey="o3" stroke="hsl(45 90% 60%)" name="O₃" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Alerts & Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Moderate Air Quality Alert</h3>
                <p className="text-sm text-muted-foreground">
                  PM2.5 and PM10 levels are moderate. Sensitive groups should consider limiting prolonged outdoor activities.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-500/10 border-green-500/30">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Health Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Air quality is acceptable for most individuals. Unusually sensitive people should consider reducing prolonged outdoor exertion.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Sources */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="font-bold mb-4">Data Sources & Integration</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-primary">NASA Satellites</div>
              <div className="text-muted-foreground">MODIS, VIIRS atmospheric data</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-primary">Ground Sensors</div>
              <div className="text-muted-foreground">Real-time monitoring stations</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-primary">ML Forecasting</div>
              <div className="text-muted-foreground">Predictive air quality models</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AirQuality;
