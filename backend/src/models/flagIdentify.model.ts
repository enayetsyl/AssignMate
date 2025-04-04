// src/models/flagIdentify.model.ts
import { Schema } from 'mongoose';
import BaseQuestion, { IBaseQuestion } from './baseQuestion.model';

interface IFlagIdentify extends IBaseQuestion {
  image: string; // could be a URL or a path to the image
}

const FlagIdentifySchema = new Schema<IFlagIdentify>({
  image: { type: String, required: true },
});

export const FlagIdentify = BaseQuestion.discriminator<IFlagIdentify>('flagIdentify', FlagIdentifySchema);
