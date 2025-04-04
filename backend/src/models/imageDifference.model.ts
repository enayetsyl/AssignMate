// src/models/imageDifference.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

interface IImageDifference extends IBaseQuestion {
  image1: string;
  image2: string;
  // answer is already in the base schema as number
}

const ImageDifferenceSchema = new Schema<IImageDifference>({
  image1: { type: String, required: true },
  image2: { type: String, required: true },
  // If the answer is always a number, you might add validation here.
});

export const ImageDifference = BaseQuestion.discriminator<IImageDifference>('imageDifference', ImageDifferenceSchema);
