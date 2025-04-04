// src/models/goodHabit.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

interface IGoodHabit extends IBaseQuestion {
  options: string[];
}

const GoodHabitSchema = new Schema<IGoodHabit>({
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr: string[]) {
        return arr.length >= 3 && arr.length <= 4;
      },
      message: 'Good habit question must have between 3 and 4 options.',
    },
  },
});

export const GoodHabit = BaseQuestion.discriminator<IGoodHabit>('goodHabit', GoodHabitSchema);
