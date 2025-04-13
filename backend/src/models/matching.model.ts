// src/models/matching.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

export interface IMatching extends IBaseQuestion {
  image: string;
}

const MatchingSchema = new Schema<IMatching>({
  image: { type: String, required: true },
});

export const Matching = BaseQuestion.discriminator<IMatching>(
  'matching',
  MatchingSchema
);
