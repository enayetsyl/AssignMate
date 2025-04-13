// src/models/dotImage.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

export interface IDotImage extends IBaseQuestion {
  image: string;
}

const DotImageSchema = new Schema<IDotImage>({
  image: { type: String, required: true },
});

export const DotImage = BaseQuestion.discriminator<IDotImage>(
  'dotImage',
  DotImageSchema
);
