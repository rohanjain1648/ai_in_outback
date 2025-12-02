import axios from 'axios';

export interface IWeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
    rainfall: number;
  };
  forecast: IWeatherForecast[];
}

export interface IWeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  humidity: number;
  rainfall: number;
  condition: string;
  icon: string;
  windSpeed: number;
  uvIndex: number;
}

export interface IAgriculturalWeatherData extends IWeatherData {
  agricultural: {
    soilMoisture: number;
    evapotranspiration: number;
    growingDegreeDays: number;
    frostRisk: boolean;
    irrigationRecommendation: string;
    sprayingConditions: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.baseUrl = 'http://api.weatherapi.com/v1';
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<IWeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/current.json`, {
        params: {
          key: this.apiKey,
          q: `${latitude},${longitude}`,
          aqi: 'no'
        }
      });

      const data = response.data;
      return {
        location: {
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          lat: data.location.lat,
          lon: data.location.lon
        },
        current: {
          temperature: data.current.temp_c,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          windDirection: data.current.wind_dir,
          pressure: data.current.pressure_mb,
          visibility: data.current.vis_km,
          uvIndex: data.current.uv,
          condition: data.current.condition.text,
          icon: data.current.condition.icon,
          rainfall: data.current.precip_mm
        },
        forecast: []
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<IWeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast.json`, {
        params: {
          key: this.apiKey,
          q: `${latitude},${longitude}`,
          days: Math.min(days, 10), // API limit
          aqi: 'no',
          alerts: 'no'
        }
      });

      const data = response.data;
      const forecast: IWeatherForecast[] = data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        avgTemp: day.day.avgtemp_c,
        humidity: day.day.avghumidity,
        rainfall: day.day.totalprecip_mm,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        windSpeed: day.day.maxwind_kph,
        uvIndex: day.day.uv
      }));

      return {
        location: {
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          lat: data.location.lat,
          lon: data.location.lon
        },
        current: {
          temperature: data.current.temp_c,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          windDirection: data.current.wind_dir,
          pressure: data.current.pressure_mb,
          visibility: data.current.vis_km,
          uvIndex: data.current.uv,
          condition: data.current.condition.text,
          icon: data.current.condition.icon,
          rainfall: data.current.precip_mm
        },
        forecast
      };
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  async getAgriculturalWeatherData(latitude: number, longitude: number): Promise<IAgriculturalWeatherData> {
    const weatherData = await this.getWeatherForecast(latitude, longitude, 7);
    
    // Calculate agricultural metrics
    const agricultural = this.calculateAgriculturalMetrics(weatherData);

    return {
      ...weatherData,
      agricultural
    };
  }

  private calculateAgriculturalMetrics(weatherData: IWeatherData) {
    const current = weatherData.current;
    const forecast = weatherData.forecast;

    // Calculate soil moisture estimate (simplified)
    const recentRainfall = forecast.slice(0, 3).reduce((sum, day) => sum + day.rainfall, 0);
    const soilMoisture = Math.min(100, Math.max(0, (recentRainfall * 10) + (current.humidity * 0.3)));

    // Calculate evapotranspiration (simplified Penman equation approximation)
    const evapotranspiration = (current.temperature * 0.1) + (current.windSpeed * 0.05) - (current.humidity * 0.02);

    // Calculate growing degree days (base temperature 10°C)
    const growingDegreeDays = forecast.reduce((sum, day) => {
      const avgTemp = (day.maxTemp + day.minTemp) / 2;
      return sum + Math.max(0, avgTemp - 10);
    }, 0);

    // Frost risk assessment
    const frostRisk = forecast.some(day => day.minTemp < 2);

    // Irrigation recommendation
    let irrigationRecommendation = 'Monitor';
    if (soilMoisture < 30) {
      irrigationRecommendation = 'Irrigate immediately';
    } else if (soilMoisture < 50) {
      irrigationRecommendation = 'Consider irrigation';
    } else if (soilMoisture > 80) {
      irrigationRecommendation = 'Reduce irrigation';
    }

    // Spraying conditions
    let sprayingConditions: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    if (current.windSpeed > 15 || current.rainfall > 0) {
      sprayingConditions = 'poor';
    } else if (current.windSpeed > 10 || current.humidity > 85) {
      sprayingConditions = 'fair';
    } else if (current.windSpeed < 5 && current.humidity < 70) {
      sprayingConditions = 'excellent';
    }

    return {
      soilMoisture: Math.round(soilMoisture),
      evapotranspiration: Math.round(evapotranspiration * 100) / 100,
      growingDegreeDays: Math.round(growingDegreeDays),
      frostRisk,
      irrigationRecommendation,
      sprayingConditions
    };
  }
}

export const weatherService = new WeatherService();