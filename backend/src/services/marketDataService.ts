import axios from 'axios';

export interface IMarketPrice {
  commodity: string;
  variety?: string;
  price: number;
  unit: string; // per tonne, per kg, per head, etc.
  currency: string;
  market: string;
  date: Date;
  change: number; // percentage change from previous period
  trend: 'up' | 'down' | 'stable';
}

export interface IMarketForecast {
  commodity: string;
  currentPrice: number;
  forecastPrices: {
    period: string; // '1 week', '1 month', '3 months'
    predictedPrice: number;
    confidence: number;
  }[];
  factors: string[]; // factors affecting price
}

export interface IMarketAlert {
  commodity: string;
  alertType: 'price_increase' | 'price_decrease' | 'volatility' | 'opportunity';
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: Date;
}

class MarketDataService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.MARKET_DATA_API_KEY || '';
    this.baseUrl = 'https://api.marketdata.com/v1'; // Placeholder URL
  }

  async getCurrentPrices(commodities: string[]): Promise<IMarketPrice[]> {
    try {
      // In a real implementation, this would call actual market data APIs
      // For now, we'll simulate market data for Australian agricultural commodities
      return this.getSimulatedMarketData(commodities);
    } catch (error) {
      console.error('Error fetching market prices:', error);
      return this.getSimulatedMarketData(commodities);
    }
  }

  async getMarketForecast(commodity: string): Promise<IMarketForecast> {
    try {
      const currentPrice = await this.getCurrentPrice(commodity);
      
      // Simulate forecast data
      return {
        commodity,
        currentPrice: currentPrice.price,
        forecastPrices: [
          {
            period: '1 week',
            predictedPrice: currentPrice.price * (1 + (Math.random() - 0.5) * 0.1),
            confidence: 0.8
          },
          {
            period: '1 month',
            predictedPrice: currentPrice.price * (1 + (Math.random() - 0.5) * 0.2),
            confidence: 0.6
          },
          {
            period: '3 months',
            predictedPrice: currentPrice.price * (1 + (Math.random() - 0.5) * 0.3),
            confidence: 0.4
          }
        ],
        factors: this.getMarketFactors(commodity)
      };
    } catch (error) {
      console.error('Error generating market forecast:', error);
      throw new Error('Failed to generate market forecast');
    }
  }

  async getMarketAlerts(userCommodities: string[]): Promise<IMarketAlert[]> {
    const alerts: IMarketAlert[] = [];
    
    for (const commodity of userCommodities) {
      const prices = await this.getCurrentPrices([commodity]);
      const price = prices[0];
      
      if (price && Math.abs(price.change) > 5) {
        alerts.push({
          commodity,
          alertType: price.change > 0 ? 'price_increase' : 'price_decrease',
          message: `${commodity} price ${price.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(price.change).toFixed(1)}%`,
          severity: Math.abs(price.change) > 10 ? 'high' : 'medium',
          date: new Date()
        });
      }
    }

    return alerts;
  }

  private async getCurrentPrice(commodity: string): Promise<IMarketPrice> {
    const prices = await this.getCurrentPrices([commodity]);
    return prices[0];
  }

  private getSimulatedMarketData(commodities: string[]): IMarketPrice[] {
    const basePrices: { [key: string]: { price: number; unit: string } } = {
      'wheat': { price: 450, unit: 'per tonne' },
      'barley': { price: 380, unit: 'per tonne' },
      'canola': { price: 720, unit: 'per tonne' },
      'oats': { price: 320, unit: 'per tonne' },
      'corn': { price: 280, unit: 'per tonne' },
      'sorghum': { price: 260, unit: 'per tonne' },
      'cotton': { price: 2.1, unit: 'per kg' },
      'beef cattle': { price: 3200, unit: 'per head' },
      'dairy cattle': { price: 1800, unit: 'per head' },
      'sheep': { price: 180, unit: 'per head' },
      'wool': { price: 12.5, unit: 'per kg' },
      'milk': { price: 0.52, unit: 'per litre' }
    };

    return commodities.map(commodity => {
      const baseData = basePrices[commodity.toLowerCase()] || { price: 100, unit: 'per unit' };
      const change = (Math.random() - 0.5) * 20; // -10% to +10% change
      const currentPrice = baseData.price * (1 + change / 100);

      return {
        commodity,
        price: Math.round(currentPrice * 100) / 100,
        unit: baseData.unit,
        currency: 'AUD',
        market: 'Australian Commodity Exchange',
        date: new Date(),
        change: Math.round(change * 10) / 10,
        trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable'
      };
    });
  }

  private getMarketFactors(commodity: string): string[] {
    const commonFactors = [
      'Weather conditions',
      'Global demand',
      'Currency exchange rates',
      'Government policies',
      'Transportation costs'
    ];

    const specificFactors: { [key: string]: string[] } = {
      'wheat': ['Harvest season', 'Export demand from Asia', 'Drought conditions'],
      'beef cattle': ['Feed costs', 'Export markets', 'Domestic consumption'],
      'milk': ['Feed prices', 'Processing capacity', 'Export demand'],
      'cotton': ['Water availability', 'Textile industry demand', 'Competing crops']
    };

    return [
      ...commonFactors,
      ...(specificFactors[commodity.toLowerCase()] || [])
    ].slice(0, 6);
  }

  async getOptimalSellingTime(commodity: string, quantity: number): Promise<{
    recommendation: string;
    bestMonth: string;
    expectedPrice: number;
    reasoning: string[];
  }> {
    try {
      const forecast = await this.getMarketForecast(commodity);
      const bestForecast = forecast.forecastPrices.reduce((best, current) => 
        current.predictedPrice > best.predictedPrice ? current : best
      );

      return {
        recommendation: bestForecast.predictedPrice > forecast.currentPrice ? 'Wait' : 'Sell now',
        bestMonth: bestForecast.period,
        expectedPrice: bestForecast.predictedPrice,
        reasoning: [
          `Current price: $${forecast.currentPrice}`,
          `Predicted price in ${bestForecast.period}: $${bestForecast.predictedPrice.toFixed(2)}`,
          `Confidence level: ${(bestForecast.confidence * 100).toFixed(0)}%`,
          `Market factors: ${forecast.factors.slice(0, 2).join(', ')}`
        ]
      };
    } catch (error) {
      console.error('Error calculating optimal selling time:', error);
      return {
        recommendation: 'Monitor market conditions',
        bestMonth: 'Current period',
        expectedPrice: 0,
        reasoning: ['Market analysis unavailable']
      };
    }
  }
}

export const marketDataService = new MarketDataService();