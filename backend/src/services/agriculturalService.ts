import { Farm, IFarm } from '../models/Farm';
import { CropMonitoring, ICropMonitoring } from '../models/CropMonitoring';
import { weatherService, IAgriculturalWeatherData } from './weatherService';
import { cropAnalysisService } from './cropAnalysisService';
import { marketDataService, IMarketPrice, IMarketAlert } from './marketDataService';
import mongoose from 'mongoose';

export interface IDashboardData {
  farm: IFarm;
  weather: IAgriculturalWeatherData;
  marketPrices: IMarketPrice[];
  marketAlerts: IMarketAlert[];
  recentAnalyses: ICropMonitoring[];
  recommendations: string[];
  summary: {
    totalCrops: number;
    totalLivestock: number;
    healthyCrops: number;
    alertsCount: number;
    avgHealthScore: number;
  };
}

class AgriculturalService {
  async getFarmDashboard(userId: string): Promise<IDashboardData> {
    try {
      // Get user's farm
      const farm = await Farm.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!farm) {
        throw new Error('Farm not found for user');
      }

      // Get weather data for farm location
      const weather = await weatherService.getAgriculturalWeatherData(
        farm.location.coordinates.latitude,
        farm.location.coordinates.longitude
      );

      // Get market prices for farm's commodities
      const commodities = [
        ...farm.crops.map(crop => crop.name),
        ...farm.livestock.map(livestock => livestock.type)
      ];
      const marketPrices = await marketDataService.getCurrentPrices(commodities);
      const marketAlerts = await marketDataService.getMarketAlerts(commodities);

      // Get recent crop analyses
      const recentAnalyses = await CropMonitoring.find({ farmId: farm._id })
        .sort({ createdAt: -1 })
        .limit(10);

      // Generate AI recommendations
      const recommendations = await cropAnalysisService.generateFarmingRecommendations(
        farm,
        weather,
        recentAnalyses.map(analysis => analysis.analysis)
      );

      // Calculate summary statistics
      const summary = this.calculateSummary(farm, recentAnalyses, marketAlerts);

      return {
        farm,
        weather,
        marketPrices,
        marketAlerts,
        recentAnalyses,
        recommendations,
        summary
      };
    } catch (error) {
      console.error('Error generating farm dashboard:', error);
      throw new Error('Failed to generate farm dashboard');
    }
  }

  async createOrUpdateFarm(userId: string, farmData: Partial<IFarm>): Promise<IFarm> {
    try {
      const existingFarm = await Farm.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      
      if (existingFarm) {
        Object.assign(existingFarm, farmData);
        return await existingFarm.save();
      } else {
        const newFarm = new Farm({
          ...farmData,
          userId: new mongoose.Types.ObjectId(userId)
        });
        return await newFarm.save();
      }
    } catch (error) {
      console.error('Error creating/updating farm:', error);
      throw new Error('Failed to create or update farm');
    }
  }

  async analyzeCropPhoto(
    farmId: string,
    cropName: string,
    photoUrl: string,
    metadata: any
  ): Promise<ICropMonitoring> {
    try {
      // Perform AI analysis
      const analysis = await cropAnalysisService.analyzeCropImage({
        imageUrl: photoUrl,
        cropType: cropName,
        location: metadata.location,
        plantingDate: metadata.plantingDate
      });

      // Save analysis to database
      const cropMonitoring = new CropMonitoring({
        farmId: new mongoose.Types.ObjectId(farmId),
        cropName,
        photoUrl,
        photoMetadata: {
          captureDate: metadata.captureDate || new Date(),
          location: metadata.location,
          weather: metadata.weather
        },
        analysis,
        aiModel: 'gpt-4-vision-preview',
        processed: true
      });

      return await cropMonitoring.save();
    } catch (error) {
      console.error('Error analyzing crop photo:', error);
      throw new Error('Failed to analyze crop photo');
    }
  }

  async getCropAnalysisHistory(farmId: string, cropName?: string): Promise<ICropMonitoring[]> {
    try {
      const query: any = { farmId: new mongoose.Types.ObjectId(farmId) };
      if (cropName) {
        query.cropName = cropName;
      }

      return await CropMonitoring.find(query)
        .sort({ createdAt: -1 })
        .limit(50);
    } catch (error) {
      console.error('Error fetching crop analysis history:', error);
      throw new Error('Failed to fetch crop analysis history');
    }
  }

  async getMarketInsights(farmId: string): Promise<{
    prices: IMarketPrice[];
    alerts: IMarketAlert[];
    recommendations: any[];
  }> {
    try {
      const farm = await Farm.findById(farmId);
      if (!farm) {
        throw new Error('Farm not found');
      }

      const commodities = [
        ...farm.crops.map(crop => crop.name),
        ...farm.livestock.map(livestock => livestock.type)
      ];

      const prices = await marketDataService.getCurrentPrices(commodities);
      const alerts = await marketDataService.getMarketAlerts(commodities);

      // Generate selling recommendations for each commodity
      const recommendations = await Promise.all(
        commodities.map(async (commodity) => {
          try {
            const recommendation = await marketDataService.getOptimalSellingTime(commodity, 1);
            return {
              commodity,
              ...recommendation
            };
          } catch (error) {
            return {
              commodity,
              recommendation: 'Monitor market conditions',
              bestMonth: 'Current period',
              expectedPrice: 0,
              reasoning: ['Analysis unavailable']
            };
          }
        })
      );

      return {
        prices,
        alerts,
        recommendations
      };
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw new Error('Failed to get market insights');
    }
  }

  private calculateSummary(
    farm: IFarm,
    recentAnalyses: ICropMonitoring[],
    marketAlerts: IMarketAlert[]
  ) {
    const totalCrops = farm.crops.length;
    const totalLivestock = farm.livestock.reduce((sum, livestock) => sum + livestock.count, 0);
    
    const healthScores = recentAnalyses.map(analysis => analysis.analysis.healthScore);
    const avgHealthScore = healthScores.length > 0 
      ? Math.round(healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length)
      : 0;
    
    const healthyCrops = recentAnalyses.filter(analysis => analysis.analysis.healthScore >= 70).length;
    const alertsCount = marketAlerts.filter(alert => alert.severity === 'high').length;

    return {
      totalCrops,
      totalLivestock,
      healthyCrops,
      alertsCount,
      avgHealthScore
    };
  }

  async getWeatherData(latitude: number, longitude: number): Promise<IAgriculturalWeatherData> {
    return await weatherService.getAgriculturalWeatherData(latitude, longitude);
  }

  async getFarmsByLocation(latitude: number, longitude: number, radiusKm: number = 50): Promise<IFarm[]> {
    try {
      return await Farm.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusKm * 1000 // Convert km to meters
          }
        }
      }).limit(20);
    } catch (error) {
      console.error('Error finding farms by location:', error);
      throw new Error('Failed to find farms by location');
    }
  }
}

export const agriculturalService = new AgriculturalService();