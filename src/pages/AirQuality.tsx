import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wind, AlertTriangle, CheckCircle, TrendingUp, Loader2, Satellite } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import { getAirQualityData, type AirQualityData } from "@/services/earthdataApi";
import { Badge } from "@/components/ui/badge";

const AirQuality = () => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAQI, setCurrentAQI] = useState(0);

  useEffect(() => {
    loadAirQualityData();
  }, []);

  const loadAirQualityData = async () => {
    setLoading(true);
    const data = await getAirQualityData(14);
    setAirQualityData(data);
    if (data.length > 0) {
      setCurrentAQI(data[data.length - 1].aqi);
    }
    setLoading(false);
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500", textColor: "text-green-500" };
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-500" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-500", textColor: "text-orange-500" };
    return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-500" };
  };

  const aqiStatus = getAQIStatus(currentAQI);
  const latestData = airQualityData.length > 0 ? airQualityData[airQualityData.length - 1] : null;
  
  const currentMetrics = latestData ? [
    { label: "PM2.5", value: latestData.pm25.toString(), unit: "µg/m³", status: latestData.pm25 < 35 ? "good" : "moderate" },
    { label: "PM10", value: latestData.pm10.toString(), unit: "µg/m³", status: latestData.pm10 < 50 ? "good" : "moderate" },
    { label: "NO₂", value: latestData.no2.toString(), unit: "ppb", status: latestData.no2 < 53 ? "good" : "moderate" },
    { label: "O₃", value: latestData.o3.toString(), unit: "ppb", status: latestData.o3 < 55 ? "good" : "moderate" },
  ] : [];

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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Wind className="w-10 h-10 text-primary" />
                Air Quality Prediction
              </h1>
              <Badge className={aqiStatus.color}>{aqiStatus.label}</Badge>
              <Badge variant="outline" className="border-primary/30">
                <Satellite className="w-3 h-3 mr-1" />
                NASA Data
              </Badge>
            </div>
            <p className="text-muted-foreground">Real-time atmospheric monitoring and public health forecasting</p>
          </div>
        </div>

        {/* Current Metrics Grid */}
        {loading ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading air quality data...</p>
          </Card>
        ) : (
          <>
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
              <Area type="monotone" dataKey="pm25" stroke="hsl(189 94% 55%)" fillOpacity={1} fill="url(#colorPM25)" name="PM2.5 (µg/m³)" />
              <Area type="monotone" dataKey="pm10" stroke="hsl(280 80% 60%)" fillOpacity={1} fill="url(#colorPM10)" name="PM10 (µg/m³)" />
              <Line type="monotone" dataKey="no2" stroke="hsl(120 60% 50%)" name="NO₂ (ppb)" />
              <Line type="monotone" dataKey="o3" stroke="hsl(45 90% 60%)" name="O₃ (ppb)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Alerts & Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className={`p-6 ${aqiStatus.color}/10 border-${aqiStatus.color.split('-')[1]}-500/30`}>
            <div className="flex items-start gap-4">
              <AlertTriangle className={`w-6 h-6 ${aqiStatus.textColor} flex-shrink-0 mt-1`} />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{aqiStatus.label} Air Quality</h3>
                <p className="text-sm text-muted-foreground">
                  {currentAQI <= 50 && "Air quality is good. Enjoy outdoor activities!"}
                  {currentAQI > 50 && currentAQI <= 100 && "Air quality is acceptable. Sensitive groups should consider limiting prolonged outdoor activities."}
                  {currentAQI > 100 && "Air quality is unhealthy for sensitive groups. Everyone should limit prolonged outdoor exertion."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary/10 border-primary/30">
            <div className="flex items-start gap-4">
              <Satellite className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">NASA Data Integration</h3>
                <p className="text-sm text-muted-foreground">
                  This dashboard uses NASA atmospheric data and predictive models to forecast air quality and provide public health recommendations.
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
        </>
        )}
      </div>
    </div>
  );
};

export default AirQuality;
