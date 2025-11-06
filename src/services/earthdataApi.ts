// NASA Earthdata API for Air Quality and Urban Environmental Data
// Using publicly available NASA data sources

export interface AirQualityData {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

export interface UrbanHealthMetrics {
  city: string;
  temperature: number;
  greenSpace: number;
  airQuality: number;
  waterQuality: number;
  population: number;
  healthScore: number;
}

/**
 * Generate realistic air quality data based on atmospheric patterns
 * In production, this would use NASA POWER API or Earthdata
 */
export async function getAirQualityData(days = 7): Promise<AirQualityData[]> {
  // Simulating data that follows realistic atmospheric patterns
  // TODO: Replace with actual NASA POWER API or Earthdata API calls
  
  const data: AirQualityData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Base values with realistic variation
    const baseAQI = 50 + Math.random() * 50;
    const variation = Math.sin(i / 2) * 15;
    
    data.push({
      date: date.toISOString().split('T')[0],
      aqi: Math.round(baseAQI + variation),
      pm25: Math.round(12 + Math.random() * 15 + variation / 2),
      pm10: Math.round(20 + Math.random() * 25 + variation),
      o3: Math.round(30 + Math.random() * 20 + variation),
      no2: Math.round(15 + Math.random() * 10),
      so2: Math.round(5 + Math.random() * 8),
      co: Math.round(0.4 + Math.random() * 0.6, )
    });
  }
  
  return data;
}

/**
 * Get urban health metrics for multiple cities
 * Based on NASA Earth observation data patterns
 */
export async function getUrbanHealthMetrics(): Promise<UrbanHealthMetrics[]> {
  // Real cities with realistic environmental metrics
  // TODO: Integrate with actual NASA SEDAC and Earthdata APIs
  
  return [
    {
      city: 'New York',
      temperature: 22.5,
      greenSpace: 27.0,
      airQuality: 68,
      waterQuality: 82,
      population: 8336817,
      healthScore: 72
    },
    {
      city: 'Los Angeles',
      temperature: 24.8,
      greenSpace: 15.5,
      airQuality: 52,
      waterQuality: 78,
      population: 3979576,
      healthScore: 64
    },
    {
      city: 'Tokyo',
      temperature: 21.2,
      greenSpace: 35.2,
      airQuality: 71,
      waterQuality: 88,
      population: 13960000,
      healthScore: 79
    },
    {
      city: 'Singapore',
      temperature: 27.5,
      greenSpace: 47.0,
      airQuality: 75,
      waterQuality: 92,
      population: 5686000,
      healthScore: 85
    },
    {
      city: 'London',
      temperature: 15.8,
      greenSpace: 33.0,
      airQuality: 63,
      waterQuality: 85,
      population: 8982000,
      healthScore: 74
    },
    {
      city: 'Copenhagen',
      temperature: 12.5,
      greenSpace: 55.8,
      airQuality: 88,
      waterQuality: 95,
      population: 794128,
      healthScore: 91
    },
    {
      city: 'Lagos',
      temperature: 27.2,
      greenSpace: 12.8,
      airQuality: 48,
      waterQuality: 62,
      population: 14862000,
      healthScore: 58
    },
    {
      city: 'Abuja',
      temperature: 26.5,
      greenSpace: 28.5,
      airQuality: 61,
      waterQuality: 71,
      population: 3652000,
      healthScore: 67
    },
    {
      city: 'Jos',
      temperature: 22.8,
      greenSpace: 38.2,
      airQuality: 72,
      waterQuality: 76,
      population: 900000,
      healthScore: 74
    },
    {
      city: 'Kano',
      temperature: 26.8,
      greenSpace: 15.3,
      airQuality: 54,
      waterQuality: 65,
      population: 3931000,
      healthScore: 62
    }
  ];
}

/**
 * Get environmental time series data for a city
 */
export async function getCityEnvironmentalData(city: string, months = 12) {
  const data = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Seasonal variation
    const seasonalFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2);
    
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      temperature: 15 + seasonalFactor * 10 + Math.random() * 5,
      airQuality: 60 + seasonalFactor * 15 + Math.random() * 10,
      greenCover: 30 + Math.random() * 5
    });
  }
  
  return data;
}

/**
 * NASA POWER API - Prediction of Worldwide Energy Resources
 * This is a real NASA API for atmospheric and solar data
 */
export async function getNASAPowerData(
  latitude: number,
  longitude: number,
  parameters: string[] = ['T2M', 'PRECTOTCORR', 'RH2M']
) {
  try {
    const paramString = parameters.join(',');
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${paramString}&community=RE&longitude=${longitude}&latitude=${latitude}&start=20240101&end=20241231&format=JSON`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('NASA POWER API error');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching NASA POWER data:', error);
    return null;
  }
}
