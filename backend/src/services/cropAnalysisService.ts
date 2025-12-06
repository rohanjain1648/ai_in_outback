// @ts-nocheck
import OpenAI from 'openai';
import { ICropAnalysis } from '../models/CropMonitoring';

interface ICropAnalysisRequest {
  imageUrl: string;
  cropType: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  plantingDate?: Date;
}

class CropAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeCropImage(request: ICropAnalysisRequest): Promise<ICropAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(request);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: request.imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis received from AI model');
      }

      return this.parseAnalysisResponse(analysisText);
    } catch (error) {
      console.error('Error analyzing crop image:', error);
      
      // Fallback analysis if AI fails
      return this.getFallbackAnalysis(request.cropType);
    }
  }

  private buildAnalysisPrompt(request: ICropAnalysisRequest): string {
    const plantingInfo = request.plantingDate 
      ? `planted on ${request.plantingDate.toDateString()}` 
      : 'unknown planting date';

    return `
You are an expert agricultural AI analyzing a crop image. Please analyze this ${request.cropType} crop image (${plantingInfo}) and provide a detailed assessment in the following JSON format:

{
  "healthScore": <number 0-100>,
  "diseaseDetected": [<array of disease names if any>],
  "pestDetected": [<array of pest names if any>],
  "nutritionDeficiency": [<array of nutrient deficiencies if any>],
  "growthStage": "<growth stage description>",
  "recommendations": [<array of actionable recommendations>],
  "confidence": <number 0-1 representing confidence in analysis>
}

Focus on:
1. Overall plant health and vigor
2. Signs of disease (leaf spots, wilting, discoloration)
3. Pest damage (holes, chewing marks, insect presence)
4. Nutrient deficiencies (yellowing, stunting, leaf patterns)
5. Growth stage assessment
6. Practical farming recommendations

Provide specific, actionable advice for Australian farming conditions.
`;
  }

  private parseAnalysisResponse(analysisText: string): ICropAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          healthScore: Math.max(0, Math.min(100, parsed.healthScore || 75)),
          diseaseDetected: Array.isArray(parsed.diseaseDetected) ? parsed.diseaseDetected : [],
          pestDetected: Array.isArray(parsed.pestDetected) ? parsed.pestDetected : [],
          nutritionDeficiency: Array.isArray(parsed.nutritionDeficiency) ? parsed.nutritionDeficiency : [],
          growthStage: parsed.growthStage || 'Unknown',
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7))
        };
      }
    } catch (error) {
      console.error('Error parsing AI analysis response:', error);
    }

    // Fallback parsing if JSON extraction fails
    return this.extractAnalysisFromText(analysisText);
  }

  private extractAnalysisFromText(text: string): ICropAnalysis {
    // Simple text-based extraction as fallback
    const healthScore = this.extractNumber(text, /health.*?(\d+)/i) || 75;
    const confidence = this.extractNumber(text, /confidence.*?(\d+\.?\d*)/i) || 0.7;
    
    const diseases = this.extractList(text, /disease[s]?.*?:(.*?)(?:\n|$)/i);
    const pests = this.extractList(text, /pest[s]?.*?:(.*?)(?:\n|$)/i);
    const deficiencies = this.extractList(text, /deficien[cy|cies].*?:(.*?)(?:\n|$)/i);
    const recommendations = this.extractList(text, /recommend.*?:(.*?)(?:\n|$)/i);

    return {
      healthScore: Math.max(0, Math.min(100, healthScore)),
      diseaseDetected: diseases,
      pestDetected: pests,
      nutritionDeficiency: deficiencies,
      growthStage: 'Analysis in progress',
      recommendations: recommendations.length > 0 ? recommendations : ['Monitor crop development', 'Maintain regular watering schedule'],
      confidence: Math.max(0, Math.min(1, confidence))
    };
  }

  private extractNumber(text: string, regex: RegExp): number | null {
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : null;
  }

  private extractList(text: string, regex: RegExp): string[] {
    const match = text.match(regex);
    if (!match) return [];
    
    return match[1]
      .split(/[,;]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private getFallbackAnalysis(cropType: string): ICropAnalysis {
    return {
      healthScore: 75,
      diseaseDetected: [],
      pestDetected: [],
      nutritionDeficiency: [],
      growthStage: 'Monitoring required',
      recommendations: [
        `Monitor ${cropType} development closely`,
        'Ensure adequate water supply',
        'Check for pest activity regularly',
        'Consider soil testing for nutrient levels'
      ],
      confidence: 0.5
    };
  }

  async generateFarmingRecommendations(
    farmData: any,
    weatherData: any,
    cropAnalyses: ICropAnalysis[]
  ): Promise<string[]> {
    try {
      const prompt = `
As an agricultural AI expert, provide farming recommendations based on:

Farm Data:
- Farm type: ${farmData.farmType}
- Total area: ${farmData.totalArea} hectares
- Crops: ${farmData.crops.map((c: any) => `${c.name} (${c.variety})`).join(', ')}
- Livestock: ${farmData.livestock.map((l: any) => `${l.count} ${l.type}`).join(', ')}

Weather Conditions:
- Current temperature: ${weatherData.current.temperature}°C
- Humidity: ${weatherData.current.humidity}%
- Recent rainfall: ${weatherData.current.rainfall}mm
- Soil moisture: ${weatherData.agricultural.soilMoisture}%

Recent Crop Analysis Results:
${cropAnalyses.map(analysis => 
  `- Health score: ${analysis.healthScore}/100, Issues: ${[...analysis.diseaseDetected, ...analysis.pestDetected].join(', ') || 'None'}`
).join('\n')}

Provide 5-7 specific, actionable recommendations for the next 1-2 weeks.
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      });

      const recommendations = response.choices[0]?.message?.content;
      if (!recommendations) {
        return this.getDefaultRecommendations();
      }

      return recommendations
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(rec => rec.length > 10);
        
    } catch (error) {
      console.error('Error generating farming recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

  private getDefaultRecommendations(): string[] {
    return [
      'Monitor crop health daily and document any changes',
      'Maintain consistent irrigation schedule based on soil moisture',
      'Check weather forecasts for planning field activities',
      'Inspect equipment and ensure proper maintenance',
      'Review market prices for optimal harvest timing',
      'Consider soil testing for nutrient management planning'
    ];
  }
}

export const cropAnalysisService = new CropAnalysisService();
