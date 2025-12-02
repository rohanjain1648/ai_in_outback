import OpenAI from 'openai';
import { elasticsearchService } from './elasticsearchService';

interface SearchIntent {
  category?: string;
  subcategory?: string;
  location?: string;
  availability?: string;
  pricing?: string;
  tags: string[];
  urgency?: 'low' | 'medium' | 'high';
  timeframe?: string;
  refinedQuery: string;
}

class AISearchService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async processNaturalLanguageQuery(query: string, userLocation?: { lat: number; lon: number }): Promise<{
    intent: SearchIntent;
    searchParams: any;
    suggestions: string[];
  }> {
    try {
      // Use AI to understand the search intent
      const intent = await this.extractSearchIntent(query);
      
      // Convert intent to search parameters
      const searchParams = this.convertIntentToSearchParams(intent, userLocation);
      
      // Generate search suggestions
      const suggestions = await this.generateSearchSuggestions(query, intent);

      return {
        intent,
        searchParams,
        suggestions
      };
    } catch (error) {
      console.error('AI search processing error:', error);
      // Fallback to basic search
      return {
        intent: {
          tags: [],
          refinedQuery: query
        },
        searchParams: { query },
        suggestions: []
      };
    }
  }

  private async extractSearchIntent(query: string): Promise<SearchIntent> {
    const prompt = `
Analyze this rural community resource search query and extract structured information:

Query: "${query}"

Extract the following information in JSON format:
{
  "category": "equipment|services|knowledge|materials|transportation|accommodation|emergency|other",
  "subcategory": "specific subcategory if mentioned",
  "location": "any location mentioned (town, region, postcode)",
  "availability": "available|unavailable|limited",
  "pricing": "free|paid|donation|barter",
  "tags": ["relevant", "tags", "from", "query"],
  "urgency": "low|medium|high",
  "timeframe": "when they need it (today, this week, etc.)",
  "refinedQuery": "cleaned up search query focusing on the resource"
}

Consider Australian rural context:
- Equipment: tractors, tools, farm machinery, utes, trailers
- Services: veterinary, mechanical, transport, labor
- Knowledge: farming techniques, local expertise, training
- Materials: feed, seeds, building supplies, fuel
- Transportation: rides, delivery, livestock transport
- Accommodation: temporary housing, camping, emergency shelter
- Emergency: medical, fire, flood, drought assistance

Only include fields that are clearly indicated in the query. Leave fields null if not mentioned.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant specialized in understanding rural Australian community resource needs. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response content');
      
      const intent = JSON.parse(content);
      
      // Validate and clean the response
      return {
        category: intent.category || undefined,
        subcategory: intent.subcategory || undefined,
        location: intent.location || undefined,
        availability: intent.availability || undefined,
        pricing: intent.pricing || undefined,
        tags: Array.isArray(intent.tags) ? intent.tags : [],
        urgency: intent.urgency || undefined,
        timeframe: intent.timeframe || undefined,
        refinedQuery: intent.refinedQuery || query
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return {
        tags: [],
        refinedQuery: query
      };
    }
  }

  private convertIntentToSearchParams(intent: SearchIntent, userLocation?: { lat: number; lon: number }) {
    const params: any = {
      query: intent.refinedQuery
    };

    if (intent.category) {
      params.category = intent.category;
    }

    if (intent.availability) {
      params.availability = intent.availability;
    }

    if (intent.pricing) {
      params.pricing = intent.pricing;
    }

    if (intent.tags && intent.tags.length > 0) {
      params.tags = intent.tags;
    }

    // Handle location
    if (intent.location && userLocation) {
      // For now, use user location with expanded radius if they mentioned a specific location
      params.location = {
        ...userLocation,
        radius: '100km' // Expand radius when they mention a specific location
      };
    } else if (userLocation) {
      params.location = {
        ...userLocation,
        radius: '50km'
      };
    }

    // Adjust sorting based on urgency
    if (intent.urgency === 'high') {
      params.sortBy = 'distance'; // Prioritize nearby resources for urgent needs
    } else if (intent.urgency === 'low') {
      params.sortBy = 'rating'; // Prioritize quality for non-urgent needs
    }

    return params;
  }

  private async generateSearchSuggestions(originalQuery: string, intent: SearchIntent): Promise<string[]> {
    try {
      const prompt = `
Based on this rural resource search query and extracted intent, suggest 3-5 alternative search queries that might help the user find what they need:

Original Query: "${originalQuery}"
Category: ${intent.category || 'not specified'}
Tags: ${intent.tags.join(', ') || 'none'}

Generate practical alternative searches for Australian rural communities. Focus on:
1. Different ways to describe the same resource
2. Related resources they might not have considered
3. Broader or narrower search terms
4. Local Australian terminology

Return as a JSON array of strings: ["suggestion 1", "suggestion 2", ...]
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an AI assistant helping rural Australians find community resources. Respond only with valid JSON array.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const content = response.choices[0].message.content;
      if (!content) return [];

      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return [];
    }
  }

  async generateResourceRecommendations(userId: string, userPreferences: any, userLocation?: { lat: number; lon: number }): Promise<any[]> {
    try {
      // Get user's search history and interaction patterns (would be implemented with actual data)
      const userContext = await this.getUserContext(userId);
      
      const prompt = `
Generate resource recommendations for a rural community member based on their profile:

User Context:
- Location: ${userLocation ? `${userLocation.lat}, ${userLocation.lon}` : 'not specified'}
- Interests: ${userPreferences.interests?.join(', ') || 'not specified'}
- Skills: ${userPreferences.skills?.join(', ') || 'not specified'}
- Recent searches: ${userContext.recentSearches?.join(', ') || 'none'}
- Community role: ${userPreferences.role || 'community member'}

Suggest 5-10 resource categories or specific resources they might find valuable. Consider:
1. Resources related to their skills/interests
2. Seasonal needs (farming, weather-related)
3. Community building opportunities
4. Emergency preparedness
5. Local business opportunities

Return as JSON array of objects:
[
  {
    "category": "equipment|services|knowledge|materials|transportation|accommodation|emergency|other",
    "title": "suggested resource title",
    "description": "why this would be useful",
    "searchQuery": "query to find this resource",
    "priority": "high|medium|low"
  }
]
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an AI assistant specialized in rural Australian community resource recommendations. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      if (!content) return [];

      const recommendations = JSON.parse(content);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private async getUserContext(userId: string): Promise<any> {
    // This would typically fetch from database
    // For now, return empty context
    return {
      recentSearches: [],
      viewedResources: [],
      bookmarkedCategories: []
    };
  }

  async enhanceSearchResults(results: any[], originalQuery: string): Promise<any[]> {
    try {
      // Add AI-generated explanations for why each result matches
      const enhancedResults = await Promise.all(
        results.slice(0, 10).map(async (result) => {
          try {
            const explanation = await this.generateMatchExplanation(result, originalQuery);
            return {
              ...result,
              aiExplanation: explanation
            };
          } catch (error) {
            return result;
          }
        })
      );

      return enhancedResults;
    } catch (error) {
      console.error('Error enhancing search results:', error);
      return results;
    }
  }

  private async generateMatchExplanation(resource: any, query: string): Promise<string> {
    const prompt = `
Explain in 1-2 sentences why this resource matches the user's search query:

Query: "${query}"
Resource: ${resource.title}
Description: ${resource.description}
Category: ${resource.category}
Tags: ${resource.tags?.join(', ') || 'none'}

Write a helpful explanation for why this resource is relevant to their search.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are helpful and concise. Explain resource matches clearly.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 100
    });

    return response.choices[0].message.content || '';
  }
}

export const aiSearchService = new AISearchService();