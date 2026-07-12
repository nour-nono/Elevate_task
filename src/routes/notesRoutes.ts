import express from 'express';
import {
  getAllNotes,
  createNote,
  deleteNote,
} from '../controllers/notesController';

const router = express.Router();

router.route('/').get(getAllNotes).post(createNote);

router.route('/:id').delete(deleteNote);

export default router;
