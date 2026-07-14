import noteRepository, {
  NoteQueryFilter,
} from '../repositories/noteRepository';
import {
  PaginatedResult,
  PaginationOptions,
} from '../repositories/baseRepository';
import { INote } from '../models/note';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';

export interface CreateNoteInput {
  title: string;
  content: string;
  userId: string;
}

class NoteService {
  async createNote(input: CreateNoteInput): Promise<INote> {
    const note = await noteRepository.createNote({
      title: input.title,
      content: input.content,
      userId: input.userId,
    });
    await note.populate('userId', 'email profilePic');
    logger.info(`Note created by user ${input.userId}: ${note._id}`);
    return note;
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    const note = await noteRepository.findByIdForUser(noteId, userId);
    if (!note) {
      throw ApiError.notFound(
        'Note not found or you do not have permission to delete it',
      );
    }
    await noteRepository.deleteByIdAndUser(noteId, userId);
    logger.info(`Note deleted: ${noteId} by user ${userId}`);
  }

  async getNotes(
    filter: NoteQueryFilter,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<INote>> {
    return noteRepository.findNotesPaginated(filter, { page, limit });
  }

  async getNoteByIdForUser(
    noteId: string,
    userId: string,
  ): Promise<INote | null> {
    return noteRepository.findByIdForUser(noteId, userId);
  }
}

const noteService = new NoteService();
export default noteService;
export type { PaginatedResult, PaginationOptions };
