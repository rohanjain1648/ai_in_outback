import OpenAI from 'openai';
import { ICommunityMember } from '../models/CommunityMember';
import { IUser } from '../models/User';
import { AppError } from '../utils/errors';

interface MatchingContext {
  user: IUser;
  member: ICommunityMember;
  potentialMatches: ICommunityMember[];
}

interface AIMatchingResult {
  score: number;
  reasoning: string;
  compatibilityFactors: {
    skillsAlignment: number;
    interestsAlignment: number;
    availabilityMatch: number;
    locationCompatibility: number;
    communicationStyle: number;
    experienceLevel: number;
  };
  recommendations: string[];
}

interface UserPreferenceLearning {
  userId: string;
  interactionType: 'connection_made' | 'connection_declined' | 'message_sent' | 'meeting_scheduled' | 'positive_feedback' | 'negative_feedback';
  targetUserId: string;
  contextData: {
    sharedSkills: string[];
    sharedInterests: string[];
    distance: number;
    meetingType: string;
    outcome?: 'successful' | 'unsuccessful';
  };
}

export class AIMatchingService {
  private static openai: OpenAI;

  static initialize() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. AI matching features will be limited.');
      return;
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Calculate enhanced matching score using AI
   */
  static async calculateAIMatchingScore(
    currentMember: ICommunityMember,
    potentialMatch: ICommunityMember,
    currentUser: IUser,
    matchUser: IUser
  ): Promise<AIMatchingResult> {
    try {
      if (!this.openai) {
        // Fallback to basic matching if OpenAI is not available
        return this.calculateBasicMatchingScore(currentMember, potentialMatch, currentUser, matchUser);
      }

      const prompt = this.buildMatchingPrompt(currentMember, potentialMatch, currentUser, matchUser);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specialized in rural community matching. Your role is to analyze compatibility between community members based on their skills, interests, availability, location, and communication preferences. 

Provide a detailed analysis with:
1. Overall compatibility score (0-100)
2. Breakdown of compatibility factors (each 0-100)
3. Reasoning for the score
4. Specific recommendations for connection

Focus on rural Australian context, considering factors like:
- Agricultural knowledge sharing
- Geographic isolation challenges
- Community support needs
- Skills exchange opportunities
- Cultural and traditional knowledge preservation

Respond in JSON format only.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const aiResult = JSON.parse(response);
      
      // Validate and structure the response
      return {
        score: Math.min(100, Math.max(0, aiResult.score || 0)),
        reasoning: aiResult.reasoning || 'AI analysis completed',
        compatibilityFactors: {
          skillsAlignment: Math.min(100, Math.max(0, aiResult.compatibilityFactors?.skillsAlignment || 0)),
          interestsAlignment: Math.min(100, Math.max(0, aiResult.compatibilityFactors?.interestsAlignment || 0)),
          availabilityMatch: Math.min(100, Math.max(0, aiResult.compatibilityFactors?.availabilityMatch || 0)),
          locationCompatibility: Math.min(100, Math.max(0, aiResult.compatibilityFactors?.locationCompatibility || 0)),
          communicationStyle: Math.min(100, Math.max(0, aiResult.compatibilityFactors?.communicationStyle || 0)),
          experienceLevel: Math.min(100, Math.max(0, aiResult.compatibilityFactors?.experienceLevel || 0)),
        },
        recommendations: Array.isArray(aiResult.recommendations) ? aiResult.recommendations : [],
      };

    } catch (error) {
      console.error('AI matching error:', error);
      // Fallback to basic matching
      return this.calculateBasicMatchingScore(currentMember, potentialMatch, currentUser, matchUser);
    }
  }

  /**
   * Build prompt for AI matching analysis
   */
  private static buildMatchingPrompt(
    currentMember: ICommunityMember,
    potentialMatch: ICommunityMember,
    currentUser: IUser,
    matchUser: IUser
  ): string {
    const currentLocation = currentUser.location;
    const matchLocation = matchUser.location;
    
    return `Analyze compatibility between these two rural community members:

MEMBER A:
- Location: ${currentLocation?.city || 'Unknown'}, ${currentLocation?.state || 'Unknown'} (${currentLocation?.region || 'Unknown region'})
- Age: ${this.calculateAge(currentUser.profile.dateOfBirth)}
- Occupation: ${currentUser.profile.occupation || 'Not specified'}
- Farm Type: ${currentUser.profile.farmType || 'Not specified'}
- Years in Area: ${currentUser.profile.yearsInArea || 'Not specified'}

Skills: ${currentMember.skills.map(s => `${s.name} (${s.level}, ${s.category}${s.canTeach ? ', can teach' : ''}${s.wantsToLearn ? ', wants to learn' : ''})`).join(', ')}

Interests: ${currentMember.interests.map(i => `${i.name} (${i.category}, ${i.intensity})`).join(', ')}

Availability: ${currentMember.availability.preferredMeetingTypes.join(', ')} | Response time: ${currentMember.availability.responseTime}

Communication Style: ${currentMember.interactionPatterns.communicationStyle}

MEMBER B:
- Location: ${matchLocation?.city || 'Unknown'}, ${matchLocation?.state || 'Unknown'} (${matchLocation?.region || 'Unknown region'})
- Age: ${this.calculateAge(matchUser.profile.dateOfBirth)}
- Occupation: ${matchUser.profile.occupation || 'Not specified'}
- Farm Type: ${matchUser.profile.farmType || 'Not specified'}
- Years in Area: ${matchUser.profile.yearsInArea || 'Not specified'}

Skills: ${potentialMatch.skills.map(s => `${s.name} (${s.level}, ${s.category}${s.canTeach ? ', can teach' : ''}${s.wantsToLearn ? ', wants to learn' : ''})`).join(', ')}

Interests: ${potentialMatch.interests.map(i => `${i.name} (${i.category}, ${i.intensity})`).join(', ')}

Availability: ${potentialMatch.availability.preferredMeetingTypes.join(', ')} | Response time: ${potentialMatch.availability.responseTime}

Communication Style: ${potentialMatch.interactionPatterns.communicationStyle}

MATCHING PREFERENCES:
Member A max distance: ${currentMember.matchingPreferences.maxDistance}km
Member A preferred skill levels: ${currentMember.matchingPreferences.preferredSkillLevels.join(', ')}
Member A priority categories: ${currentMember.matchingPreferences.priorityCategories.join(', ')}

Please provide a JSON response with:
{
  "score": <overall compatibility score 0-100>,
  "reasoning": "<detailed explanation of compatibility>",
  "compatibilityFactors": {
    "skillsAlignment": <0-100>,
    "interestsAlignment": <0-100>,
    "availabilityMatch": <0-100>,
    "locationCompatibility": <0-100>,
    "communicationStyle": <0-100>,
    "experienceLevel": <0-100>
  },
  "recommendations": ["<specific recommendation 1>", "<specific recommendation 2>", ...]
}`;
  }

  /**
   * Fallback basic matching algorithm
   */
  private static calculateBasicMatchingScore(
    currentMember: ICommunityMember,
    potentialMatch: ICommunityMember,
    currentUser: IUser,
    matchUser: IUser
  ): AIMatchingResult {
    let totalScore = 0;
    const factors = {
      skillsAlignment: 0,
      interestsAlignment: 0,
      availabilityMatch: 0,
      locationCompatibility: 0,
      communicationStyle: 0,
      experienceLevel: 0,
    };

    // Skills alignment (25% weight)
    const skillsScore = this.calculateSkillsAlignment(currentMember.skills, potentialMatch.skills);
    factors.skillsAlignment = skillsScore;
    totalScore += skillsScore * 0.25;

    // Interests alignment (20% weight)
    const interestsScore = this.calculateInterestsAlignment(currentMember.interests, potentialMatch.interests);
    factors.interestsAlignment = interestsScore;
    totalScore += interestsScore * 0.20;

    // Availability match (15% weight)
    const availabilityScore = this.calculateAvailabilityMatch(currentMember.availability, potentialMatch.availability);
    factors.availabilityMatch = availabilityScore;
    totalScore += availabilityScore * 0.15;

    // Location compatibility (20% weight)
    const locationScore = this.calculateLocationCompatibility(currentUser.location, matchUser.location, currentMember.matchingPreferences.maxDistance);
    factors.locationCompatibility = locationScore;
    totalScore += locationScore * 0.20;

    // Communication style (10% weight)
    const communicationScore = this.calculateCommunicationStyleMatch(
      currentMember.interactionPatterns.communicationStyle,
      potentialMatch.interactionPatterns.communicationStyle
    );
    factors.communicationStyle = communicationScore;
    totalScore += communicationScore * 0.10;

    // Experience level compatibility (10% weight)
    const experienceScore = this.calculateExperienceCompatibility(currentUser, matchUser);
    factors.experienceLevel = experienceScore;
    totalScore += experienceScore * 0.10;

    return {
      score: Math.round(totalScore),
      reasoning: 'Basic compatibility analysis based on skills, interests, availability, location, and communication preferences.',
      compatibilityFactors: factors,
      recommendations: this.generateBasicRecommendations(currentMember, potentialMatch, factors),
    };
  }

  /**
   * Calculate skills alignment score
   */
  private static calculateSkillsAlignment(skills1: any[], skills2: any[]): number {
    if (skills1.length === 0 || skills2.length === 0) return 0;

    let matches = 0;
    let teachLearnMatches = 0;
    
    for (const skill1 of skills1) {
      for (const skill2 of skills2) {
        if (skill1.name.toLowerCase() === skill2.name.toLowerCase() || 
            skill1.category === skill2.category) {
          matches++;
          
          // Bonus for teach/learn compatibility
          if ((skill1.canTeach && skill2.wantsToLearn) || 
              (skill1.wantsToLearn && skill2.canTeach)) {
            teachLearnMatches++;
          }
        }
      }
    }

    const baseScore = (matches / Math.max(skills1.length, skills2.length)) * 70;
    const teachLearnBonus = (teachLearnMatches / Math.max(skills1.length, skills2.length)) * 30;
    
    return Math.min(100, baseScore + teachLearnBonus);
  }

  /**
   * Calculate interests alignment score
   */
  private static calculateInterestsAlignment(interests1: any[], interests2: any[]): number {
    if (interests1.length === 0 || interests2.length === 0) return 0;

    let matches = 0;
    let intensityBonus = 0;
    
    for (const interest1 of interests1) {
      for (const interest2 of interests2) {
        if (interest1.name.toLowerCase() === interest2.name.toLowerCase() || 
            interest1.category === interest2.category) {
          matches++;
          
          // Bonus for similar intensity levels
          if (interest1.intensity === interest2.intensity) {
            intensityBonus++;
          }
        }
      }
    }

    const baseScore = (matches / Math.max(interests1.length, interests2.length)) * 80;
    const intensityBonusScore = (intensityBonus / matches || 0) * 20;
    
    return Math.min(100, baseScore + intensityBonusScore);
  }

  /**
   * Calculate availability match score
   */
  private static calculateAvailabilityMatch(availability1: any, availability2: any): number {
    let score = 0;

    // Meeting type compatibility
    const commonMeetingTypes = availability1.preferredMeetingTypes.filter((type: string) =>
      availability2.preferredMeetingTypes.includes(type)
    );
    score += (commonMeetingTypes.length / Math.max(availability1.preferredMeetingTypes.length, availability2.preferredMeetingTypes.length)) * 50;

    // Response time compatibility
    const responseTimeScore = this.calculateResponseTimeCompatibility(availability1.responseTime, availability2.responseTime);
    score += responseTimeScore * 50;

    return Math.min(100, score);
  }

  /**
   * Calculate location compatibility score
   */
  private static calculateLocationCompatibility(location1: any, location2: any, maxDistance: number): number {
    if (!location1 || !location2 || !location1.coordinates || !location2.coordinates) {
      return 50; // Neutral score if location data is missing
    }

    const distance = this.calculateDistance(
      location1.coordinates[1], location1.coordinates[0],
      location2.coordinates[1], location2.coordinates[0]
    );

    if (distance <= maxDistance) {
      // Score decreases as distance increases, but stays high within max distance
      return Math.max(60, 100 - (distance / maxDistance) * 40);
    } else {
      // Penalty for being outside max distance, but not zero
      return Math.max(10, 60 - ((distance - maxDistance) / maxDistance) * 50);
    }
  }

  /**
   * Calculate communication style match
   */
  private static calculateCommunicationStyleMatch(style1: string, style2: string): number {
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      formal: { formal: 100, professional: 80, friendly: 60, casual: 40 },
      professional: { professional: 100, formal: 80, friendly: 70, casual: 50 },
      friendly: { friendly: 100, professional: 70, casual: 80, formal: 60 },
      casual: { casual: 100, friendly: 80, professional: 50, formal: 40 },
    };

    return compatibilityMatrix[style1]?.[style2] || 50;
  }

  /**
   * Calculate experience level compatibility
   */
  private static calculateExperienceCompatibility(user1: IUser, user2: IUser): number {
    const years1 = user1.profile.yearsInArea || 0;
    const years2 = user2.profile.yearsInArea || 0;
    
    const yearsDiff = Math.abs(years1 - years2);
    
    // Higher score for similar experience levels, but also value mentor/mentee relationships
    if (yearsDiff <= 2) return 100;
    if (yearsDiff <= 5) return 80;
    if (yearsDiff <= 10) return 70; // Good for mentor/mentee
    return 50;
  }

  /**
   * Calculate response time compatibility
   */
  private static calculateResponseTimeCompatibility(time1: string, time2: string): number {
    const timeValues: { [key: string]: number } = {
      'immediate': 4,
      'within-hour': 3,
      'within-day': 2,
      'within-week': 1,
    };

    const diff = Math.abs(timeValues[time1] - timeValues[time2]);
    return Math.max(25, 100 - (diff * 25));
  }

  /**
   * Generate basic recommendations
   */
  private static generateBasicRecommendations(
    currentMember: ICommunityMember,
    potentialMatch: ICommunityMember,
    factors: any
  ): string[] {
    const recommendations: string[] = [];

    if (factors.skillsAlignment > 70) {
      recommendations.push("Strong skills compatibility - consider skill sharing or collaboration");
    }

    if (factors.interestsAlignment > 70) {
      recommendations.push("Shared interests detected - great foundation for friendship");
    }

    if (factors.availabilityMatch > 70) {
      recommendations.push("Compatible schedules - easy to arrange meetings");
    }

    if (factors.locationCompatibility > 80) {
      recommendations.push("Close proximity - ideal for in-person meetings");
    }

    if (recommendations.length === 0) {
      recommendations.push("Consider connecting to explore potential collaboration opportunities");
    }

    return recommendations;
  }

  /**
   * Learn from user interaction patterns
   */
  static async learnFromUserInteraction(learningData: UserPreferenceLearning): Promise<void> {
    // This would typically update the user's interaction patterns in the database
    // For now, we'll log the learning data for future ML model training
    console.log('Learning from user interaction:', learningData);
    
    // TODO: Implement machine learning model updates based on user interactions
    // This could involve:
    // 1. Updating user preference weights
    // 2. Adjusting matching algorithm parameters
    // 3. Training recommendation models
    // 4. Updating success/failure patterns
  }

  /**
   * Utility function to calculate age from date of birth
   */
  private static calculateAge(dateOfBirth?: Date): string {
    if (!dateOfBirth) return 'Unknown';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Initialize the service
AIMatchingService.initialize();