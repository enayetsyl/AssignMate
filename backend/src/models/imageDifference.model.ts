// src/models/imageDifference.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

interface IImageDifference extends IBaseQuestion {
  image: string;
}

const ImageDifferenceSchema = new Schema<IImageDifference>({
  image: { type: String, required: true }
});

export const ImageDifference = BaseQuestion.discriminator<IImageDifference>('imageDifference', ImageDifferenceSchema);
