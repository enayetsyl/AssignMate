// src/models/riddle.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

interface IRiddle extends IBaseQuestion {
  options: string[];
}

const RiddleSchema = new Schema<IRiddle>({
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr: string[]) {
        return arr.length >= 3 && arr.length <= 4;
      },
      message: 'Riddle must have between 3 and 4 options.',
    },
  },
});

export const Riddle = BaseQuestion.discriminator<IRiddle>('riddle', RiddleSchema);
