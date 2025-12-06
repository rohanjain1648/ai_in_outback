// @ts-nocheck
import OpenAI from 'openai';
import WellbeingCheckIn, { IWellbeingCheckIn } from '../models/WellbeingCheckIn';
import MentalHealthResource, { IMentalHealthResource } from '../models/MentalHealthResource';
import SupportConnection, { ISupportConnection } from '../models/SupportConnection';
import PeerSupportChat from '../models/PeerSupportChat';
import User from '../models/User';
import { generateRandomAlias } from '../utils/anonymization';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class WellbeingService {
  /**
   * Analyze wellbeing check-in using AI to identify risk levels and support needs
   */
  async analyzeWellbeingCheckIn(checkIn: Partial<IWellbeingCheckIn>): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    aiAnalysis: {
      sentiment: number;
      concernFlags: string[];
      supportRecommendations: string[];
      riskFactors: string[];
    };
    followUpRequired: boolean;
  }> {
    try {
      const { moodScore, stressLevel, sleepQuality, socialConnection, physicalActivity, notes, tags } = checkIn;
      
      // Calculate base risk score
      const avgScore = (moodScore! + (11 - stressLevel!) + sleepQuality! + socialConnection! + physicalActivity!) / 5;
      
      // AI analysis of notes and context
      let aiAnalysis = {
        sentiment: 0,
        concernFlags: [] as string[],
        supportRecommendations: [] as string[],
        riskFactors: [] as string[]
      };

      if (notes && notes.trim().length > 0) {
        const prompt = `
        Analyze this wellbeing check-in for mental health concerns. Provide a JSON response with:
        - sentiment: number between -1 (very negative) and 1 (very positive)
        - concernFlags: array of specific concerns found (e.g., "suicidal ideation", "social isolation", "substance use")
        - supportRecommendations: array of support suggestions
        - riskFactors: array of identified risk factors

        Wellbeing data:
        - Mood: ${moodScore}/10
        - Stress: ${stressLevel}/10
        - Sleep: ${sleepQuality}/10
        - Social connection: ${socialConnection}/10
        - Physical activity: ${physicalActivity}/10
        - Tags: ${tags?.join(', ') || 'none'}
        - Notes: "${notes}"

        Be sensitive and focus on identifying genuine mental health concerns while avoiding false positives.
        `;

        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500
        });

        try {
          const analysis = JSON.parse(response.choices[0].message.content || '{}');
          aiAnalysis = {
            sentiment: analysis.sentiment || 0,
            concernFlags: analysis.concernFlags || [],
            supportRecommendations: analysis.supportRecommendations || [],
            riskFactors: analysis.riskFactors || []
          };
        } catch (parseError) {
          console.error('Error parsing AI analysis:', parseError);
        }
      }

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let followUpRequired = false;

      // Critical risk indicators
      const criticalFlags = ['suicidal ideation', 'self harm', 'crisis', 'emergency'];
      if (aiAnalysis.concernFlags.some(flag => 
        criticalFlags.some(critical => flag.toLowerCase().includes(critical.toLowerCase()))
      )) {
        riskLevel = 'critical';
        followUpRequired = true;
      }
      // High risk: very low scores or multiple concerning factors
      else if (avgScore <= 3 || moodScore! <= 2 || aiAnalysis.concernFlags.length >= 3) {
        riskLevel = 'high';
        followUpRequired = true;
      }
      // Medium risk: low scores or some concerning factors
      else if (avgScore <= 5 || moodScore! <= 4 || aiAnalysis.concernFlags.length >= 1) {
        riskLevel = 'medium';
        followUpRequired = avgScore <= 4;
      }

      return {
        riskLevel,
        aiAnalysis,
        followUpRequired
      };
    } catch (error) {
      console.error('Error analyzing wellbeing check-in:', error);
      // Fallback analysis based on scores only
      const avgScore = (checkIn.moodScore! + (11 - checkIn.stressLevel!) + 
                       checkIn.sleepQuality! + checkIn.socialConnection! + 
                       checkIn.physicalActivity!) / 5;
      
      return {
        riskLevel: avgScore <= 3 ? 'high' : avgScore <= 5 ? 'medium' : 'low',
        aiAnalysis: {
          sentiment: 0,
          concernFlags: [],
          supportRecommendations: ['Consider speaking with a mental health professional'],
          riskFactors: []
        },
        followUpRequired: avgScore <= 4
      };
    }
  }

  /**
   * Create a wellbeing check-in with AI analysis
   */
  async createWellbeingCheckIn(userId: string, checkInData: Partial<IWellbeingCheckIn>): Promise<IWellbeingCheckIn> {
    const analysis = await this.analyzeWellbeingCheckIn(checkInData);
    
    const checkIn = new WellbeingCheckIn({
      ...checkInData,
      userId,
      riskLevel: analysis.riskLevel,
      aiAnalysis: analysis.aiAnalysis,
      followUpRequired: analysis.followUpRequired,
      followUpDate: analysis.followUpRequired ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
    });

    await checkIn.save();

    // If critical risk, trigger immediate crisis intervention
    if (analysis.riskLevel === 'critical') {
      await this.triggerCrisisIntervention(userId, checkIn._id);
    }

    return checkIn;
  }

  /**
   * Get wellbeing dashboard data for a user
   */
  async getWellbeingDashboard(userId: string, days: number = 30): Promise<{
    recentCheckIns: IWellbeingCheckIn[];
    trends: {
      mood: number[];
      stress: number[];
      sleep: number[];
      social: number[];
      activity: number[];
      dates: string[];
    };
    riskAssessment: {
      currentRisk: string;
      riskTrend: 'improving' | 'stable' | 'declining';
      lastCheckIn: Date;
    };
    supportConnections: ISupportConnection[];
    recommendedResources: IMentalHealthResource[];
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const checkIns = await WellbeingCheckIn.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 }).limit(30);

    const supportConnections = await SupportConnection.find({
      $or: [{ supporterId: userId }, { supporteeId: userId }],
      status: 'active'
    }).populate('supporterId supporteeId', 'firstName lastName');

    const user = await User.findById(userId);
    const recommendedResources = await this.getRecommendedResources(userId, user?.location?.state);

    // Calculate trends
    const trends = {
      mood: checkIns.map(c => c.moodScore).reverse(),
      stress: checkIns.map(c => c.stressLevel).reverse(),
      sleep: checkIns.map(c => c.sleepQuality).reverse(),
      social: checkIns.map(c => c.socialConnection).reverse(),
      activity: checkIns.map(c => c.physicalActivity).reverse(),
      dates: checkIns.map(c => c.date.toISOString().split('T')[0]).reverse()
    };

    // Risk assessment
    const latestCheckIn = checkIns[0];
    const riskTrend = this.calculateRiskTrend(checkIns);

    return {
      recentCheckIns: checkIns,
      trends,
      riskAssessment: {
        currentRisk: latestCheckIn?.riskLevel || 'unknown',
        riskTrend,
        lastCheckIn: latestCheckIn?.date || new Date()
      },
      supportConnections,
      recommendedResources
    };
  }

  /**
   * Find and match peer support connections
   */
  async findSupportMatches(userId: string, supportType: 'peer_support' | 'mentor' | 'buddy' = 'peer_support'): Promise<ISupportConnection[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get user's recent check-ins to understand support needs
    const recentCheckIns = await WellbeingCheckIn.find({ userId }).sort({ date: -1 }).limit(5);
    const supportAreas = this.extractSupportAreas(recentCheckIns);

    // Find potential supporters
    const potentialSupporters = await User.find({
      _id: { $ne: userId },
      'wellbeingProfile.willingToSupport': true,
      'wellbeingProfile.supportAreas': { $in: supportAreas },
      'location.state': user.location?.state
    }).limit(10);

    const matches: ISupportConnection[] = [];

    for (const supporter of potentialSupporters) {
      const matchingScore = await this.calculateSupportMatchingScore(user, supporter, supportAreas);
      
      if (matchingScore.overall > 0.6) {
        const connection = new SupportConnection({
          supporterId: supporter._id,
          supporteeId: userId,
          connectionType: supportType,
          matchingScore: matchingScore.overall,
          matchingFactors: matchingScore.factors,
          supportAreas,
          isAnonymous: true,
          anonymousIds: {
            supporterAlias: generateRandomAlias(),
            supporteeAlias: generateRandomAlias()
          }
        });

        matches.push(connection);
      }
    }

    return matches.sort((a, b) => b.matchingScore - a.matchingScore);
  }

  /**
   * Get mental health resources based on user location and needs
   */
  async getRecommendedResources(userId: string, state?: string): Promise<IMentalHealthResource[]> {
    const user = await User.findById(userId);
    const userState = state || user?.location?.state || 'NSW';

    // Get user's recent check-ins to understand needs
    const recentCheckIns = await WellbeingCheckIn.find({ userId }).sort({ date: -1 }).limit(3);
    const concernFlags = recentCheckIns.flatMap(c => c.aiAnalysis?.concernFlags || []);
    
    const query: any = {
      $or: [
        { 'location.state': userState },
        { 'location.isNational': true }
      ],
      isVerified: true
    };

    // Prioritize resources based on identified concerns
    if (concernFlags.length > 0) {
      query.specializations = { $in: concernFlags };
    }

    const resources = await MentalHealthResource.find(query)
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10);

    return resources;
  }

  /**
   * Trigger crisis intervention for high-risk users
   */
  private async triggerCrisisIntervention(userId: string, checkInId: string): Promise<void> {
    // Log crisis event
    console.log(`CRISIS INTERVENTION TRIGGERED for user ${userId}, check-in ${checkInId}`);
    
    // In a real implementation, this would:
    // 1. Send immediate notification to crisis response team
    // 2. Provide user with immediate crisis resources
    // 3. Potentially contact emergency services if configured
    // 4. Create priority support connection
    
    // For now, we'll create a high-priority support connection
    const crisisResources = await MentalHealthResource.find({
      category: 'crisis',
      'availability.is24x7': true
    }).limit(3);

    // Update user's profile to indicate crisis status
    await User.findByIdAndUpdate(userId, {
      'wellbeingProfile.crisisStatus': {
        isActive: true,
        triggeredAt: new Date(),
        checkInId,
        resourcesProvided: crisisResources.map(r => r._id)
      }
    });
  }

  /**
   * Calculate risk trend from recent check-ins
   */
  private calculateRiskTrend(checkIns: IWellbeingCheckIn[]): 'improving' | 'stable' | 'declining' {
    if (checkIns.length < 2) return 'stable';

    const riskScores = checkIns.map(c => {
      switch (c.riskLevel) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 1;
      }
    });

    const recent = riskScores.slice(0, Math.ceil(riskScores.length / 2));
    const older = riskScores.slice(Math.ceil(riskScores.length / 2));

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg < olderAvg - 0.3) return 'improving';
    if (recentAvg > olderAvg + 0.3) return 'declining';
    return 'stable';
  }

  /**
   * Extract support areas from check-ins
   */
  private extractSupportAreas(checkIns: IWellbeingCheckIn[]): string[] {
    const areas = new Set<string>();
    
    checkIns.forEach(checkIn => {
      checkIn.tags?.forEach(tag => areas.add(tag));
      checkIn.aiAnalysis?.concernFlags?.forEach(flag => areas.add(flag));
    });

    return Array.from(areas);
  }

  /**
   * Calculate matching score between users for support connections
   */
  private async calculateSupportMatchingScore(user: any, supporter: any, supportAreas: string[]): Promise<{
    overall: number;
    factors: {
      locationProximity: number;
      experienceSimilarity: number;
      availabilityMatch: number;
      personalityMatch: number;
      supportNeedsAlignment: number;
    };
  }> {
    // This is a simplified matching algorithm
    // In a real implementation, this would be more sophisticated
    
    const factors = {
      locationProximity: user.location?.state === supporter.location?.state ? 1 : 0.3,
      experienceSimilarity: 0.7, // Would analyze shared experiences
      availabilityMatch: 0.8, // Would check availability preferences
      personalityMatch: 0.6, // Would use personality assessment
      supportNeedsAlignment: supporter.wellbeingProfile?.supportAreas?.some((area: string) => 
        supportAreas.includes(area)) ? 0.9 : 0.4
    };

    const overall = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;

    return { overall, factors };
  }
}

export default new WellbeingService();
