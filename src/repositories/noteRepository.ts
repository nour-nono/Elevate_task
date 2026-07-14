import { QueryFilter, Types } from 'mongoose';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from './baseRepository';
import Note, { INote } from '../models/note';

export interface NoteQueryFilter {
  userId?: string;
  title?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

class NoteRepository extends BaseRepository<INote> {
  constructor() {
    super(Note);
  }

  buildFilter(filter: NoteQueryFilter = {}): QueryFilter<INote> {
    const query: QueryFilter<INote> = {};

    if (filter.userId) {
      query.userId = new Types.ObjectId(filter.userId);
    }
    if (filter.title) {
      query.title = { $regex: filter.title, $options: 'i' };
    }
    const dateRange: Record<string, Date> = {};
    if (filter.startDate) {
      dateRange.$gte = new Date(filter.startDate as string);
    }
    if (filter.endDate) {
      dateRange.$lte = new Date(filter.endDate as string);
    }
    if (Object.keys(dateRange).length > 0) {
      query.createdAt = dateRange;
    }

    return query;
  }

  async findNotesPaginated(
    filter: NoteQueryFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INote>> {
    return this.findPaginated(this.buildFilter(filter), {
      sort: { createdAt: -1 },
      populate: { path: 'userId', select: 'email profilePic' },
      ...options,
    });
  }

  async createNote(data: {
    title: string;
    content: string;
    userId: string | Types.ObjectId;
  }): Promise<INote> {
    return this.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
    } as Partial<INote>);
  }

  async findByIdForUser(noteId: string, userId: string): Promise<INote | null> {
    return this.findOne(
      { _id: new Types.ObjectId(noteId), userId: new Types.ObjectId(userId) },
      { path: 'userId', select: 'email profilePic' },
    );
  }

  async deleteByIdAndUser(noteId: string, userId: string): Promise<boolean> {
    const result = await this.deleteOne({
      _id: new Types.ObjectId(noteId),
      userId: new Types.ObjectId(userId),
    });
    return result;
  }
}

const noteRepository = new NoteRepository();
export default noteRepository;
