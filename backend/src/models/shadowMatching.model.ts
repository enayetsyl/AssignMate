// src/models/shadowMatching.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

export interface IShadowMatching extends IBaseQuestion {
  image: string;
}

const ShadowMatchingSchema = new Schema<IShadowMatching>({
  image: { type: String, required: true },
});

export const ShadowMatching = BaseQuestion.discriminator<IShadowMatching>(
  'shadowMatching',
  ShadowMatchingSchema
);
