// src/models/science.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

interface IScience extends IBaseQuestion {
  options: string[];
}

const ScienceSchema = new Schema<IScience>({
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr: string[]) {
        return arr.length >= 3 && arr.length <= 4;
      },
      message: 'Science question must have between 3 and 4 options.',
    },
  },
});

export const Science = BaseQuestion.discriminator<IScience>('science', ScienceSchema);
