import {
  Document,
  Model,
  QueryFilter,
  UpdateQuery,
  PopulateOptions,
  Types,
} from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: PopulateOptions | string | (PopulateOptions | string)[];
  select?: string | Record<string, number>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(
    id: string | Types.ObjectId,
    populate?: PopulateOptions | string,
  ): Promise<T | null> {
    const query = this.model.findById(id);
    if (populate) {
      if (typeof populate === 'string') query.populate(populate);
      else query.populate(populate);
    }
    return query.exec();
  }

  async findOne(
    filter: QueryFilter<T>,
    populate?: PopulateOptions | string,
  ): Promise<T | null> {
    const query = this.model.findOne(filter);
    if (populate) {
      if (typeof populate === 'string') query.populate(populate);
      else query.populate(populate);
    }
    return query.exec();
  }

  async find(
    filter: QueryFilter<T> = {},
    options: PaginationOptions = {},
  ): Promise<T[]> {
    const query = this.model.find(filter);
    if (options.sort) query.sort(options.sort);
    if (options.select) query.select(options.select);
    if (options.populate) {
      if (typeof options.populate === 'string')
        query.populate(options.populate);
      else query.populate(options.populate);
    }
    if (options.limit) query.limit(options.limit);
    if (options.page && options.limit) {
      query.skip((options.page - 1) * options.limit);
    }
    return query.exec();
  }

  async findPaginated(
    filter: QueryFilter<T> = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, options.limit ?? 10);

    const [items, total] = await Promise.all([
      this.find(filter, { ...options, page, limit }),
      this.count(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;
    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async updateById(
    id: string | Types.ObjectId,
    data: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();
  }

  async updateOne(
    filter: QueryFilter<T>,
    data: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, data, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();
  }

  async deleteById(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async deleteOne(filter: QueryFilter<T>): Promise<boolean> {
    const result = await this.model.deleteOne(filter).exec();
    return result.deletedCount > 0;
  }

  async deleteMany(filter: QueryFilter<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  async exists(filter: QueryFilter<T>): Promise<boolean> {
    const doc = await this.model.exists(filter).exec();
    return doc !== null;
  }
}

export default BaseRepository;
