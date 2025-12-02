import { Client } from '@elastic/elasticsearch';
import { IResource } from '../models/Resource';

class ElasticsearchService {
  private client: Client;
  private indexName = 'rural-connect-resources';

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_AUTH ? {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || ''
      } : undefined
    });
  }

  async initialize() {
    try {
      // Check if index exists
      const exists = await this.client.indices.exists({
        index: this.indexName
      });

      if (!exists) {
        await this.createIndex();
      }
    } catch (error) {
      console.error('Elasticsearch initialization error:', error);
      // Don't throw error to allow app to continue without Elasticsearch
    }
  }

  private async createIndex() {
    await this.client.indices.create({
      index: this.indexName,
      settings: {
        analysis: {
          analyzer: {
            australian_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'stop',
                'australian_synonym',
                'stemmer'
              ]
            }
          },
          filter: {
            australian_synonym: {
              type: 'synonym',
              synonyms: [
                'tractor,farm equipment,agricultural machinery',
                'ute,utility vehicle,truck',
                'mob,group,herd',
                'paddock,field,pasture',
                'station,farm,property',
                'bore,well,water source',
                'shed,barn,storage',
                'fencing,fence,boundary'
              ]
            }
          }
        }
      },
      mappings: {
        properties: {
          title: {
            type: 'text',
            analyzer: 'australian_analyzer',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          },
          description: {
            type: 'text',
            analyzer: 'australian_analyzer'
          },
          category: { type: 'keyword' },
          subcategory: { type: 'keyword' },
          tags: { type: 'keyword' },
          searchKeywords: { type: 'keyword' },
          location: {
            type: 'geo_point'
          },
          address: { type: 'text' },
          postcode: { type: 'keyword' },
          state: { type: 'keyword' },
          region: { type: 'keyword' },
          availability: {
            properties: {
              status: { type: 'keyword' },
              quantity: { type: 'integer' }
            }
          },
          pricing: {
            properties: {
              type: { type: 'keyword' },
              amount: { type: 'float' }
            }
          },
          rating: {
            properties: {
              average: { type: 'float' },
              count: { type: 'integer' }
            }
          },
          isActive: { type: 'boolean' },
          isVerified: { type: 'boolean' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
          viewCount: { type: 'integer' },
          bookingCount: { type: 'integer' }
        }
      }
    });
  }

  async indexResource(resource: IResource) {
    try {
      await this.client.index({
        index: this.indexName,
        id: (resource._id as any).toString(),
        document: {
          title: resource.title,
          description: resource.description,
          category: resource.category,
          subcategory: resource.subcategory,
          tags: resource.tags,
          searchKeywords: resource.searchKeywords,
          location: {
            lat: resource.location.coordinates[1],
            lon: resource.location.coordinates[0]
          },
          address: resource.location.address,
          postcode: resource.location.postcode,
          state: resource.location.state,
          region: resource.location.region,
          availability: resource.availability,
          pricing: resource.pricing,
          rating: resource.rating,
          isActive: resource.isActive,
          isVerified: resource.isVerified,
          createdAt: resource.createdAt,
          updatedAt: resource.updatedAt,
          viewCount: resource.viewCount,
          bookingCount: resource.bookingCount
        }
      });
    } catch (error) {
      console.error('Error indexing resource:', error);
    }
  }

  async updateResource(resourceId: string, resource: Partial<IResource>) {
    try {
      const updateBody: any = {};
      
      if (resource.title) updateBody.title = resource.title;
      if (resource.description) updateBody.description = resource.description;
      if (resource.category) updateBody.category = resource.category;
      if (resource.subcategory) updateBody.subcategory = resource.subcategory;
      if (resource.tags) updateBody.tags = resource.tags;
      if (resource.searchKeywords) updateBody.searchKeywords = resource.searchKeywords;
      if (resource.location) {
        updateBody.location = {
          lat: resource.location.coordinates[1],
          lon: resource.location.coordinates[0]
        };
        updateBody.address = resource.location.address;
        updateBody.postcode = resource.location.postcode;
        updateBody.state = resource.location.state;
        updateBody.region = resource.location.region;
      }
      if (resource.availability) updateBody.availability = resource.availability;
      if (resource.pricing) updateBody.pricing = resource.pricing;
      if (resource.rating) updateBody.rating = resource.rating;
      if (resource.isActive !== undefined) updateBody.isActive = resource.isActive;
      if (resource.isVerified !== undefined) updateBody.isVerified = resource.isVerified;
      if (resource.updatedAt) updateBody.updatedAt = resource.updatedAt;
      if (resource.viewCount !== undefined) updateBody.viewCount = resource.viewCount;
      if (resource.bookingCount !== undefined) updateBody.bookingCount = resource.bookingCount;

      await this.client.update({
        index: this.indexName,
        id: resourceId,
        doc: updateBody
      });
    } catch (error) {
      console.error('Error updating resource in Elasticsearch:', error);
    }
  }

  async deleteResource(resourceId: string) {
    try {
      await this.client.delete({
        index: this.indexName,
        id: resourceId
      });
    } catch (error) {
      console.error('Error deleting resource from Elasticsearch:', error);
    }
  }

  async searchResources(params: {
    query?: string;
    category?: string;
    location?: { lat: number; lon: number; radius?: string };
    availability?: string;
    pricing?: string;
    tags?: string[];
    verified?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'distance' | 'rating' | 'date' | 'popularity';
  }) {
    try {
      const {
        query,
        category,
        location,
        availability,
        pricing,
        tags,
        verified,
        limit = 20,
        offset = 0,
        sortBy = 'relevance'
      } = params;

      const searchBody: any = {
        query: {
          bool: {
            must: [],
            filter: [
              { term: { isActive: true } }
            ]
          }
        },
        from: offset,
        size: limit
      };

      // Text search
      if (query) {
        searchBody.query.bool.must.push({
          multi_match: {
            query,
            fields: [
              'title^3',
              'description^2',
              'tags^2',
              'searchKeywords',
              'category',
              'subcategory'
            ],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      } else {
        searchBody.query.bool.must.push({ match_all: {} });
      }

      // Category filter
      if (category) {
        searchBody.query.bool.filter.push({
          term: { category }
        });
      }

      // Location filter
      if (location) {
        searchBody.query.bool.filter.push({
          geo_distance: {
            distance: location.radius || '50km',
            location: {
              lat: location.lat,
              lon: location.lon
            }
          }
        });
      }

      // Availability filter
      if (availability) {
        searchBody.query.bool.filter.push({
          term: { 'availability.status': availability }
        });
      }

      // Pricing filter
      if (pricing) {
        searchBody.query.bool.filter.push({
          term: { 'pricing.type': pricing }
        });
      }

      // Tags filter
      if (tags && tags.length > 0) {
        searchBody.query.bool.filter.push({
          terms: { tags }
        });
      }

      // Verified filter
      if (verified !== undefined) {
        searchBody.query.bool.filter.push({
          term: { isVerified: verified }
        });
      }

      // Sorting
      switch (sortBy) {
        case 'distance':
          if (location) {
            searchBody.sort = [{
              _geo_distance: {
                location: {
                  lat: location.lat,
                  lon: location.lon
                },
                order: 'asc',
                unit: 'km'
              }
            }];
          }
          break;
        case 'rating':
          searchBody.sort = [{ 'rating.average': { order: 'desc' } }];
          break;
        case 'date':
          searchBody.sort = [{ createdAt: { order: 'desc' } }];
          break;
        case 'popularity':
          searchBody.sort = [
            { bookingCount: { order: 'desc' } },
            { viewCount: { order: 'desc' } }
          ];
          break;
        default:
          // Relevance (default Elasticsearch scoring)
          break;
      }

      const response = await this.client.search({
        index: this.indexName,
        ...searchBody
      });

      return {
        resources: (response.hits?.hits || []).map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          distance: hit.sort && hit.sort[0] ? hit.sort[0] : undefined,
          ...hit._source
        })),
        total: (response.hits?.total as any)?.value || 0,
        maxScore: response.hits?.max_score || 0
      };
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  async getSuggestions(query: string, limit: number = 5) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        suggest: {
          title_suggest: {
            prefix: query,
            completion: {
              field: 'title.suggest',
              size: limit
            }
          }
        }
      });

      const suggestions = response.suggest?.title_suggest?.[0]?.options;
      if (Array.isArray(suggestions)) {
        return suggestions.map((option: any) => ({
          text: option.text,
          score: option._score
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  async getAggregations(filters: any = {}) {
    try {
      const searchBody: any = {
        size: 0,
        query: {
          bool: {
            filter: [
              { term: { isActive: true } }
            ]
          }
        },
        aggs: {
          categories: {
            terms: { field: 'category', size: 20 }
          },
          states: {
            terms: { field: 'state', size: 10 }
          },
          pricing_types: {
            terms: { field: 'pricing.type', size: 10 }
          },
          availability_status: {
            terms: { field: 'availability.status', size: 10 }
          },
          popular_tags: {
            terms: { field: 'tags', size: 20 }
          }
        }
      };

      // Apply filters to aggregations
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          searchBody.query.bool.filter.push({
            term: { [key]: filters[key] }
          });
        }
      });

      const response = await this.client.search({
        index: this.indexName,
        ...searchBody
      });

      return response.aggregations || {};
    } catch (error) {
      console.error('Error getting aggregations:', error);
      return {};
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return true; // If ping succeeds, it's healthy
    } catch (error) {
      return false;
    }
  }
}

export const elasticsearchService = new ElasticsearchService();