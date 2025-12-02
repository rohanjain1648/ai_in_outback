/**
 * Database Optimization and Indexing Utilities
 * 
 * Provides utilities for optimizing MongoDB queries, managing indexes,
 * and monitoring database performance.
 */

import mongoose, { Model, Document, Query } from 'mongoose';

// Query performance monitoring
interface QueryMetrics {
  operation: string;
  collection: string;
  executionTime: number;
  documentsExamined: number;
  documentsReturned: number;
  indexUsed: boolean;
  timestamp: number;
}

export class DatabasePerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private slowQueryThreshold = 100; // milliseconds
  private maxMetrics = 1000;

  recordQuery(metrics: QueryMetrics) {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow queries
    if (metrics.executionTime > this.slowQueryThreshold) {
      console.warn('Slow query detected:', {
        operation: metrics.operation,
        collection: metrics.collection,
        executionTime: metrics.executionTime,
        efficiency: metrics.documentsReturned / metrics.documentsExamined
      });
    }
  }

  getSlowQueries(threshold?: number): QueryMetrics[] {
    const limit = threshold || this.slowQueryThreshold;
    return this.metrics.filter(metric => metric.executionTime > limit);
  }

  getQueryStats() {
    if (this.metrics.length === 0) return null;

    const totalQueries = this.metrics.length;
    const avgExecutionTime = this.metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries;
    const slowQueries = this.getSlowQueries().length;
    
    return {
      totalQueries,
      avgExecutionTime,
      slowQueries,
      slowQueryPercentage: (slowQueries / totalQueries) * 100
    };
  }
}

// Query optimization utilities
export class QueryOptimizer {
  static optimizeFind<T extends Document>(
    model: Model<T>,
    filter: any,
    options: {
      select?: string;
      sort?: any;
      limit?: number;
      skip?: number;
      populate?: string | any[];
      lean?: boolean;
    } = {}
  ): Query<T[], T> {
    let query = model.find(filter);

    // Apply lean for better performance
    if (options.lean !== false) {
      query = query.lean();
    }

    // Apply field selection
    if (options.select) {
      query = query.select(options.select);
    }

    // Apply sorting
    if (options.sort) {
      query = query.sort(options.sort);
    }

    // Apply pagination
    if (options.skip) {
      query = query.skip(options.skip);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // Apply population
    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach(pop => {
          query = query.populate(pop);
        });
      } else {
        query = query.populate(options.populate);
      }
    }

    return query;
  }

  static createPaginatedQuery<T extends Document>(
    model: Model<T>,
    filter: any,
    page: number = 1,
    limit: number = 10,
    sort: any = { createdAt: -1 },
    select?: string
  ) {
    const skip = (page - 1) * limit;
    
    const query = this.optimizeFind(model, filter, {
      select,
      sort,
      limit,
      skip,
      lean: true
    });

    const countQuery = model.countDocuments(filter);

    return {
      query,
      countQuery,
      pagination: {
        page,
        limit,
        skip
      }
    };
  }
}

// Index management utilities
export class IndexManager {
  private static indexes: Map<string, any[]> = new Map();

  static defineIndexes(modelName: string, indexes: any[]) {
    this.indexes.set(modelName, indexes);
  }

  static async createIndexes(model: Model<any>, indexes?: any[]) {
    const indexesToCreate = indexes || this.indexes.get(model.modelName) || [];
    
    for (const index of indexesToCreate) {
      try {
        await model.createIndex(index.fields, index.options || {});
        console.log(`Created index for ${model.modelName}:`, index.fields);
      } catch (error) {
        console.error(`Failed to create index for ${model.modelName}:`, error);
      }
    }
  }
}

// Common index definitions
export const CommonIndexes = {
  User: [
    { fields: { email: 1 }, options: { unique: true } },
    { fields: { 'location.postcode': 1 } },
    { fields: { createdAt: -1 } }
  ],
  Resource: [
    { fields: { category: 1, 'location.postcode': 1 } },
    { fields: { ownerId: 1 } },
    { fields: { 'availability.status': 1 } },
    { fields: { createdAt: -1 } }
  ],
  CommunityMember: [
    { fields: { userId: 1 }, options: { unique: true } },
    { fields: { 'skills.category': 1 } },
    { fields: { isAvailableForMatching: 1 } }
  ]
};

// Initialize database optimization
export async function initializeDatabaseOptimization() {
  const monitor = new DatabasePerformanceMonitor();
  
  // Setup indexes for all models
  const models = mongoose.models;
  for (const [modelName, model] of Object.entries(models)) {
    const indexes = CommonIndexes[modelName as keyof typeof CommonIndexes];
    if (indexes) {
      await IndexManager.createIndexes(model as Model<any>, indexes);
    }
  }
  
  console.log('Database optimization initialized');
  return monitor;
}