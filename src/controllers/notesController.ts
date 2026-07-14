import { Request, Response, NextFunction } from 'express';
import asyncWrapper from '../middlewares/asyncWrapper';
import noteService from '../services/noteService';
import HttpStatus from '../utils/httpStatus';

export const getAllNotes = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, title, startDate, endDate } = req.query;
    const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
    const limit = Math.min(
      parseInt(String(req.query.limit ?? '10'), 10) || 10,
      100,
    );

    const result = await noteService.getNotes(
      {
        userId: (userId as string) || req.user!.userId,
        title: title as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      },
      page,
      limit,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  },
);

export const createNote = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { title, content } = req.body;
    const note = await noteService.createNote({
      title,
      content,
      userId: req.user!.userId,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  },
);

export const deleteNote = asyncWrapper(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    await noteService.deleteNote(id, req.user!.userId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Note deleted successfully',
    });
  },
);
