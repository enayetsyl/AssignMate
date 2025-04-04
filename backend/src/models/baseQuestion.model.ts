// src/models/baseQuestion.model.ts
import { Schema, model, Document, Model } from 'mongoose';

export interface IBaseQuestion extends Document {
  type: string;
  question: string;
  answer: string | number;
}

const BaseQuestionSchema = new Schema<IBaseQuestion>(
  {
    type: {
      type: String,
      required: true,
      enum: ['riddle', 'flagIdentify', 'goodHabit', 'science', 'imageDifference'],
    },
    question: { type: String, required: true },
    answer: { type: Schema.Types.Mixed, required: true },
  },
  { discriminatorKey: 'type', timestamps: true }
);

// Create an index on the type field for faster queries
BaseQuestionSchema.index({ type: 1 });

const BaseQuestion: Model<IBaseQuestion> = model<IBaseQuestion>('Question', BaseQuestionSchema);
export default BaseQuestion;
