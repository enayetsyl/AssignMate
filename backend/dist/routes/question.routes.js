"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/question.routes.ts
const express_1 = require("express");
const question_controller_1 = require("../controllers/question.controller");
const fileUploader_1 = require("../utils/fileUploader");
const router = (0, express_1.Router)();
// Use multer middleware to handle file uploads.
// The 'fields' method allows different field names.
router.post('/questions', fileUploader_1.fileUploader.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
]), question_controller_1.createQuestion);
// Separate GET endpoints for each type with pagination
router.get('/riddles', question_controller_1.getRiddles);
router.get('/flag-identifies', question_controller_1.getFlagIdentifies);
router.get('/good-habits', question_controller_1.getGoodHabits);
router.get('/science', question_controller_1.getScienceQuestions);
router.get('/image-differences', question_controller_1.getImageDifferences);
router.get('/matching-image', question_controller_1.getImageMatching);
router.get('/shadow-image-matching', question_controller_1.getShadowImageMatching);
router.get('/dot-images', question_controller_1.getDotImages);
exports.default = router;
