// src/routes/question.routes.ts
import { Router } from 'express';
import {
  createQuestion,
  getRiddles,
  getFlagIdentifies,
  getGoodHabits,
  getScienceQuestions,
  getImageDifferences,
  getImageMatching,
  getShadowImageMatching,
  getDotImages,
} from '../controllers/question.controller';
import { fileUploader } from '../utils/fileUploader';

const router = Router();

// Use multer middleware to handle file uploads.
// The 'fields' method allows different field names.
router.post(
  '/questions',
  fileUploader.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
  ]),
  createQuestion
);

// Separate GET endpoints for each type with pagination
router.get('/riddles', getRiddles);
router.get('/flag-identifies', getFlagIdentifies);
router.get('/good-habits', getGoodHabits);
router.get('/science', getScienceQuestions);
router.get('/image-differences', getImageDifferences);
router.get('/matching-image', getImageMatching);
router.get('/shadow-image-matching', getShadowImageMatching);
router.get('/dot-images', getDotImages);

export default router;
