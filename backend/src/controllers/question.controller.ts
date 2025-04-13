// src/controllers/question.controller.ts
import { Request, Response } from 'express';
import BaseQuestion from '../models/baseQuestion.model';
import { Riddle } from '../models/riddle.model';
import { FlagIdentify } from '../models/flagIdentify.model';
import { GoodHabit } from '../models/goodHabit.model';
import { Science } from '../models/science.model';
import { ImageDifference } from '../models/imageDifference.model';
import { fileUploader } from '../utils/fileUploader';
import { Matching } from '../models/matching.model';
import { ShadowMatching } from '../models/shadowMatching.model';
import { DotImage } from '../models/dotImage.model';

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract common fields from body
    const { type, question, answer, options } = req.body;
    let newQuestion;

    switch (type) {
      case 'riddle':
        // For options we assume frontend sends comma-separated string
        newQuestion = await Riddle.create({
          type,
          question,
          answer,
          options: JSON.parse(options || '[]'), // or split string if needed
        });
        break;

      case 'flagIdentify': {
        // Expecting file in req.files with field name 'image'
        if (!req.files || !('image' in req.files)) {
          res.status(400).json({ error: 'No file uploaded for flagIdentify' });
          return;
        }
        const file = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0];
        const result = await fileUploader.uploadToCloudinary(file);
        newQuestion = await FlagIdentify.create({
          type,
          question,
          answer,
          image: result.secure_url,
        });
        break;
      }

      case 'goodHabit':
        newQuestion = await GoodHabit.create({
          type,
          question,
          answer,
          options: JSON.parse(options || '[]'),
        });
        break;

      case 'science':
        newQuestion = await Science.create({
          type,
          question,
          answer,
          options: JSON.parse(options || '[]'),
        });
        break;

      case 'imageDifference': {
        // Expecting two files: one for image1 and one for image2
        if (
          !req.files ||
          !('image' in req.files) 
        ) {
          res.status(400).json({ error: 'An image is required for imageDifference' });
          return;
        }
        const file = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0];
        const result = await fileUploader.uploadToCloudinary(file);
        newQuestion = await ImageDifference.create({
          type,
          question,
          answer,
          image: result.secure_url,
        });
        break;
      }

      case 'matching': {
        if (!req.files || !('image' in req.files)) {
          res.status(400).json({ error: 'An image is required for matching' });
          return;
        }
        const file = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0];
        const result = await fileUploader.uploadToCloudinary(file);
        newQuestion = await Matching.create({
          type,
          question,
          answer,
          image: result.secure_url,
        });
        break;
      }

      case 'shadowMatching': {
        if (!req.files || !('image' in req.files)) {
          res.status(400).json({ error: 'An image is required for shadowMatching' });
          return;
        }
        const file = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0];
        const result = await fileUploader.uploadToCloudinary(file);
        newQuestion = await ShadowMatching.create({
          type,
          question,
          answer,
          image: result.secure_url,
        });
        break;
      }

      case 'dotImage': {
        if (!req.files || !('image' in req.files)) {
          res.status(400).json({ error: 'An image is required for dotImage' });
          return;
        }
        const file = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0];
        const result = await fileUploader.uploadToCloudinary(file);
        newQuestion = await DotImage.create({
          type,
          question,
          answer,
          image: result.secure_url,
        });
        break;
      }

      default:
        res.status(400).json({ error: 'Invalid question type' });
        return;
    }

    res.status(201).json(newQuestion);
  } catch (error: any) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const getQuestionsByType = async (type: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const questions = await BaseQuestion.find({ type }).skip(skip).limit(limit);
  const total = await BaseQuestion.countDocuments({ type });
  return { questions, total };
};

export const getRiddles = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('riddle', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching riddles:', error);
    res.status(500).json({ error: 'Failed to fetch riddles' });
  }
};

// Similarly update the other type-specific getters:
export const getFlagIdentifies = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('flagIdentify', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching flag identify questions:', error);
    res.status(500).json({ error: 'Failed to fetch flag identify questions' });
  }
};

export const getGoodHabits = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('goodHabit', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching good habit questions:', error);
    res.status(500).json({ error: 'Failed to fetch good habit questions' });
  }
};

export const getScienceQuestions = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('science', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching science questions:', error);
    res.status(500).json({ error: 'Failed to fetch science questions' });
  }
};

export const getImageDifferences = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('imageDifference', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching image difference questions:', error);
    res.status(500).json({ error: 'Failed to fetch image difference questions' });
  }
};

// Add type-specific getters:
export const getImageMatching = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('matching', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching matching questions:', error);
    res.status(500).json({ error: 'Failed to fetch matching questions' });
  }
};

export const getShadowImageMatching = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('shadowMatching', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching shadow matching questions:', error);
    res.status(500).json({ error: 'Failed to fetch shadow matching questions' });
  }
};

export const getDotImages = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const { questions, total } = await getQuestionsByType('dotImage', page, limit);
    res.status(200).json({ questions, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching dot image questions:', error);
    res.status(500).json({ error: 'Failed to fetch dot image questions' });
  }
};