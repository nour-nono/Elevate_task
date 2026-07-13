import { Schema, model, Document, Model, Types } from 'mongoose';
import { IUser } from './user';

export interface INote extends Document<Types.ObjectId> {
  title: string;
  content: string;
  userId: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

interface INoteModel extends Model<INote> {}

const noteSchema = new Schema<INote, INoteModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r.__v;
        r.id = r._id;
        return r;
      },
    },
  },
);

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ title: 'text' });

const Note = model<INote, INoteModel>('Note', noteSchema);

export default Note;
