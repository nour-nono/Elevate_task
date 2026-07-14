import express from 'express';
import {
  getAllNotes,
  createNote,
  deleteNote,
} from '../controllers/notesController';
import authenticate from '../middlewares/auth';
import requireUser from '../middlewares/requireUser';
import validate from '../middlewares/validate';
import { createNoteSchema } from '../validations/noteValidation';

const router = express.Router();

router
  .route('/')
  .get(authenticate, requireUser, getAllNotes)
  .post(authenticate, requireUser, validate(createNoteSchema), createNote);

router.route('/:id').delete(authenticate, requireUser, deleteNote);

export default router;
