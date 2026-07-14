import { INote } from '../models/note';
import { IUser } from '../models/user';
import noteService from '../services/noteService';
import ApiError from '../utils/apiError';
import { GqlContext } from './context';

interface NoteFilter {
  userId?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
}

interface NotesArgs {
  filter?: NoteFilter;
  page?: number;
  limit?: number;
}

interface NoteByIdArgs {
  id: string;
}

function ensureAuth(ctx: GqlContext): void {
  if (!ctx.user) {
    throw ApiError.unauthorized(
      'Authentication required for this GraphQL operation',
    );
  }
}

function toIso(date: Date): string {
  return date instanceof Date ? date.toISOString() : String(date);
}

function mapUser(user: IUser) {
  return {
    id: (user._id as { toString(): string }).toString(),
    email: user.email,
    profilePic: user.profilePic || '',
  };
}

export const resolvers = {
  Query: {
    notes: async (_parent: unknown, args: NotesArgs, ctx: GqlContext) => {
      ensureAuth(ctx);
      const filter: NoteFilter = args.filter ?? {};
      const page = args.page ?? 1;
      const limit = Math.min(args.limit ?? 10, 100);

      return noteService.getNotes(filter, page, limit);
    },

    noteById: async (_parent: unknown, args: NoteByIdArgs, ctx: GqlContext) => {
      ensureAuth(ctx);
      const note = await noteService.getNoteByIdForUser(
        args.id,
        ctx.user!.userId,
      );
      if (!note) {
        throw ApiError.notFound('Note not found or you do not have access');
      }
      return note;
    },
  },

  Note: {
    id: (parent: INote) => (parent._id as { toString(): string }).toString(),
    owner: (parent: INote) => {
      const owner = parent.userId as unknown as IUser;
      if (owner && typeof owner === 'object' && '_id' in owner) {
        return mapUser(owner);
      }
      return null;
    },
    createdAt: (parent: INote) => toIso(parent.createdAt),
    updatedAt: (parent: INote) => toIso(parent.updatedAt),
  },
};

export default resolvers;
