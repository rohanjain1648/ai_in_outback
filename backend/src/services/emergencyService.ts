import { Server as SocketIOServer } from 'socket.io';
import EmergencyAlert, { IEmergencyAlert } from '../models/EmergencyAlert';
import { User, IUser } from '../models/User';
import { OpenAI } from 'openai';
import { calculateDistance } from '../utils/geolocation';

export class EmergencyService {
  private io: SocketIOServer;
  private openai: OpenAI;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Create and broadcast emergency alert
  async createAlert(alertData: Partial<IEmergencyAlert>): Promise<IEmergencyAlert> {
    try {
      // AI analysis for alert validation and enhancement
      if (alertData.source?.type === 'community' || alertData.source?.type === 'ai_generated') {
        const aiAnalysis = await this.analyzeAlert(alertData);
        alertData.aiAnalysis = aiAnalysis;
        
        // Auto-verify high confidence AI analysis
        if (aiAnalysis.confidence > 0.8) {
          alertData.source!.verificationStatus = 'verified';
        }
      }

      const alert = new EmergencyAlert(alertData);
      await alert.save();

      // Broadcast to affected users
      await this.broadcastAlert(alert);

      return alert;
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  }

  // AI analysis of emergency alerts
  private async analyzeAlert(alertData: Partial<IEmergencyAlert>): Promise<any> {
    try {
      const prompt = `
        Analyze this emergency alert for validity and risk assessment:
        
        Title: ${alertData.title}
        Description: ${alertData.description}
        Type: ${alertData.type}
        Severity: ${alertData.severity}
        Location: ${alertData.location?.description}
        
        Provide analysis in JSON format:
        {
          "riskScore": 0.0-1.0,
          "confidence": 0.0-1.0,
          "predictedImpact": "description",
          "recommendedResponse": "action steps",
          "isLikelyValid": boolean
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        riskScore: 0.5,
        confidence: 0.3,
        predictedImpact: 'Unable to analyze',
        recommendedResponse: 'Follow standard emergency procedures',
        isLikelyValid: true
      };
    }
  }

  // Broadcast alert to affected users
  private async broadcastAlert(alert: IEmergencyAlert): Promise<void> {
    try {
      // Find users in affected area
      const affectedUsers = await User.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: alert.location.coordinates
            },
            $maxDistance: alert.location.radius * 1000
          }
        },
        isActive: true
      });

      // Broadcast to all connected users in area
      this.io.emit('emergency:alert', {
        alert: alert.toObject(),
        affectedUsers: affectedUsers.length
      });

      // Send targeted notifications to affected users
      affectedUsers.forEach((user: IUser) => {
        const userCoords = user.location?.coordinates || [0, 0];
        const alertCoords = alert.location.coordinates;
        
        this.io.to(`user:${user._id}`).emit('emergency:targeted_alert', {
          alert: alert.toObject(),
          distance: calculateDistance(
            userCoords[1], // latitude
            userCoords[0], // longitude
            alertCoords[1], // latitude
            alertCoords[0]  // longitude
          )
        });
      });

      console.log(`Emergency alert broadcasted to ${affectedUsers.length} users`);
    } catch (error) {
      console.error('Error broadcasting alert:', error);
    }
  }

  // Get active alerts for location
  async getActiveAlerts(coordinates: [number, number], radius: number = 50): Promise<IEmergencyAlert[]> {
    try {
      return await EmergencyAlert.find({
        isActive: true,
        status: 'active',
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radius * 1000
          }
        }
      }).sort({ priority: -1, createdAt: -1 });
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  // Report community emergency
  async reportEmergency(userId: string, reportData: {
    title: string;
    description: string;
    type: string;
    severity: string;
    location: {
      coordinates: [number, number];
      description: string;
    };
    images?: string[];
  }): Promise<IEmergencyAlert> {
    try {
      const alertData: Partial<IEmergencyAlert> = {
        title: reportData.title,
        description: reportData.description,
        type: reportData.type as any,
        severity: reportData.severity as any,
        location: {
          coordinates: reportData.location.coordinates,
          radius: 10, // Default 10km radius for community reports
          regions: [],
          description: reportData.location.description
        },
        source: {
          type: 'community',
          reportedBy: userId as any,
          verificationStatus: 'pending'
        },
        priority: this.calculatePriority(reportData.severity as any, reportData.type),
        metadata: {
          recommendedActions: this.getDefaultActions(reportData.type),
          contactInfo: {
            emergency: '000',
            local: 'Contact local authorities'
          }
        }
      };

      return await this.createAlert(alertData);
    } catch (error) {
      console.error('Error reporting emergency:', error);
      throw error;
    }
  }

  // User response to alert
  async respondToAlert(
    alertId: string, 
    userId: string, 
    response: {
      responseType: 'acknowledged' | 'safe' | 'need_help' | 'false_alarm';
      message?: string;
      location?: [number, number];
    }
  ): Promise<void> {
    try {
      const alert = await EmergencyAlert.findById(alertId);
      if (!alert) throw new Error('Alert not found');

      alert.responses = alert.responses || [];
      alert.responses.push({
        userId: userId as any,
        responseType: response.responseType,
        message: response.message,
        location: response.location,
        timestamp: new Date()
      });

      await alert.save();

      // Broadcast response update
      this.io.emit('emergency:response_update', {
        alertId,
        response: response,
        totalResponses: alert.responses.length
      });

      // If multiple false alarm reports, flag for review
      const falseAlarmCount = alert.responses.filter(r => r.responseType === 'false_alarm').length;
      if (falseAlarmCount >= 3 && alert.source.verificationStatus !== 'false_alarm') {
        alert.source.verificationStatus = 'false_alarm';
        alert.status = 'cancelled';
        await alert.save();
        
        this.io.emit('emergency:alert_cancelled', { alertId, reason: 'Multiple false alarm reports' });
      }
    } catch (error) {
      console.error('Error responding to alert:', error);
      throw error;
    }
  }

  // AI-powered emergency coordination
  async coordinateResponse(alertId: string): Promise<any> {
    try {
      const alert = await EmergencyAlert.findById(alertId).populate('responses.userId');
      if (!alert) throw new Error('Alert not found');

      const responses = alert.responses || [];
      const needHelpResponses = responses.filter(r => r.responseType === 'need_help');
      const safeResponses = responses.filter(r => r.responseType === 'safe');

      const coordinationPrompt = `
        Emergency Coordination Analysis:
        
        Alert: ${alert.title}
        Type: ${alert.type}
        Severity: ${alert.severity}
        Location: ${alert.location.description}
        
        Responses:
        - Need Help: ${needHelpResponses.length}
        - Safe: ${safeResponses.length}
        - Total Responses: ${responses.length}
        
        Provide coordination recommendations in JSON:
        {
          "priorityActions": ["action1", "action2"],
          "resourceNeeds": ["resource1", "resource2"],
          "riskAssessment": "assessment",
          "nextSteps": ["step1", "step2"]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: coordinationPrompt }],
        temperature: 0.3,
        max_tokens: 600
      });

      const coordination = JSON.parse(response.choices[0].message.content || '{}');
      
      // Broadcast coordination update
      this.io.emit('emergency:coordination_update', {
        alertId,
        coordination,
        timestamp: new Date()
      });

      return coordination;
    } catch (error) {
      console.error('Error coordinating response:', error);
      throw error;
    }
  }

  // Integrate with emergency services APIs (placeholder for real integrations)
  async integrateOfficialAlerts(): Promise<void> {
    try {
      // This would integrate with real emergency services APIs
      // For now, we'll simulate with sample data
      console.log('Checking for official emergency alerts...');
      
      // Example integration points:
      // - Bureau of Meteorology API
      // - Emergency Alert Australia
      // - State emergency services
      // - Local council alerts
      
      // Simulated official alert
      const sampleOfficialAlert = {
        title: 'Severe Weather Warning',
        description: 'Severe thunderstorms expected with heavy rainfall and strong winds',
        type: 'weather' as const,
        severity: 'high' as const,
        location: {
          coordinates: [151.2093, -33.8688] as [number, number],
          radius: 100,
          regions: ['Sydney', 'NSW'],
          description: 'Greater Sydney Area'
        },
        source: {
          type: 'official' as const,
          organization: 'Bureau of Meteorology',
          verificationStatus: 'verified' as const
        },
        priority: 8,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        metadata: {
          recommendedActions: [
            'Stay indoors',
            'Avoid driving if possible',
            'Secure outdoor items'
          ],
          contactInfo: {
            emergency: '000',
            local: 'SES 132 500',
            website: 'http://www.bom.gov.au'
          }
        }
      };

      // Only create if similar alert doesn't exist
      const existingAlert = await EmergencyAlert.findOne({
        'source.type': 'official',
        'source.organization': 'Bureau of Meteorology',
        status: 'active',
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });

      if (!existingAlert) {
        await this.createAlert(sampleOfficialAlert);
        console.log('Official alert integrated successfully');
      }
    } catch (error) {
      console.error('Error integrating official alerts:', error);
    }
  }

  // Helper methods
  private calculatePriority(severity: string, type: string): number {
    const severityMap = { low: 2, medium: 5, high: 7, critical: 10 };
    const typeMap = { 
      medical: 2, 
      fire: 3, 
      flood: 2, 
      weather: 1, 
      security: 2, 
      infrastructure: 1, 
      community: 1 
    };
    
    return Math.min(10, (severityMap[severity as keyof typeof severityMap] || 5) + 
                        (typeMap[type as keyof typeof typeMap] || 1));
  }

  private getDefaultActions(type: string): string[] {
    const actionMap: { [key: string]: string[] } = {
      fire: ['Evacuate if instructed', 'Call 000', 'Stay low if smoke present'],
      flood: ['Move to higher ground', 'Avoid driving through water', 'Call 000 if trapped'],
      weather: ['Stay indoors', 'Secure loose items', 'Monitor weather updates'],
      medical: ['Call 000', 'Provide first aid if trained', 'Stay with affected person'],
      security: ['Call 000', 'Stay in safe location', 'Do not approach'],
      infrastructure: ['Avoid affected area', 'Report to authorities', 'Use alternative routes'],
      community: ['Follow local guidance', 'Check on neighbors', 'Stay informed']
    };
    
    return actionMap[type] || ['Call 000 if emergency', 'Follow official guidance'];
  }
}

export default EmergencyService;