"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDotImages = exports.getShadowImageMatching = exports.getImageMatching = exports.getImageDifferences = exports.getScienceQuestions = exports.getGoodHabits = exports.getFlagIdentifies = exports.getRiddles = exports.getQuestionsByType = exports.createQuestion = void 0;
const baseQuestion_model_1 = __importDefault(require("../models/baseQuestion.model"));
const riddle_model_1 = require("../models/riddle.model");
const flagIdentify_model_1 = require("../models/flagIdentify.model");
const goodHabit_model_1 = require("../models/goodHabit.model");
const science_model_1 = require("../models/science.model");
const imageDifference_model_1 = require("../models/imageDifference.model");
const fileUploader_1 = require("../utils/fileUploader");
const matching_model_1 = require("../models/matching.model");
const shadowMatching_model_1 = require("../models/shadowMatching.model");
const dotImage_model_1 = require("../models/dotImage.model");
const createQuestion = async (req, res) => {
    try {
        // Extract common fields from body
        const { type, question, answer, options } = req.body;
        let newQuestion;
        switch (type) {
            case 'riddle':
                // For options we assume frontend sends comma-separated string
                newQuestion = await riddle_model_1.Riddle.create({
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
                const file = req.files['image'][0];
                const result = await fileUploader_1.fileUploader.uploadToCloudinary(file);
                newQuestion = await flagIdentify_model_1.FlagIdentify.create({
                    type,
                    question,
                    answer,
                    image: result.secure_url,
                });
                break;
            }
            case 'goodHabit':
                newQuestion = await goodHabit_model_1.GoodHabit.create({
                    type,
                    question,
                    answer,
                    options: JSON.parse(options || '[]'),
                });
                break;
            case 'science':
                newQuestion = await science_model_1.Science.create({
                    type,
                    question,
                    answer,
                    options: JSON.parse(options || '[]'),
                });
                break;
            case 'imageDifference': {
                // Expecting two files: one for image1 and one for image2
                if (!req.files ||
                    !('image' in req.files)) {
                    res.status(400).json({ error: 'An image is required for imageDifference' });
                    return;
                }
                const file = req.files['image'][0];
                const result = await fileUploader_1.fileUploader.uploadToCloudinary(file);
                newQuestion = await imageDifference_model_1.ImageDifference.create({
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
                const file = req.files['image'][0];
                const result = await fileUploader_1.fileUploader.uploadToCloudinary(file);
                newQuestion = await matching_model_1.Matching.create({
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
                const file = req.files['image'][0];
                const result = await fileUploader_1.fileUploader.uploadToCloudinary(file);
                newQuestion = await shadowMatching_model_1.ShadowMatching.create({
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
                const file = req.files['image'][0];
                const result = await fileUploader_1.fileUploader.uploadToCloudinary(file);
                newQuestion = await dotImage_model_1.DotImage.create({
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
    }
    catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
};
exports.createQuestion = createQuestion;
const getQuestionsByType = async (type, page, limit) => {
    const skip = (page - 1) * limit;
    const questions = await baseQuestion_model_1.default.find({ type }).skip(skip).limit(limit);
    const total = await baseQuestion_model_1.default.countDocuments({ type });
    return { questions, total };
};
exports.getQuestionsByType = getQuestionsByType;
const getRiddles = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('riddle', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching riddles:', error);
        res.status(500).json({ error: 'Failed to fetch riddles' });
    }
};
exports.getRiddles = getRiddles;
// Similarly update the other type-specific getters:
const getFlagIdentifies = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('flagIdentify', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching flag identify questions:', error);
        res.status(500).json({ error: 'Failed to fetch flag identify questions' });
    }
};
exports.getFlagIdentifies = getFlagIdentifies;
const getGoodHabits = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('goodHabit', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching good habit questions:', error);
        res.status(500).json({ error: 'Failed to fetch good habit questions' });
    }
};
exports.getGoodHabits = getGoodHabits;
const getScienceQuestions = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('science', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching science questions:', error);
        res.status(500).json({ error: 'Failed to fetch science questions' });
    }
};
exports.getScienceQuestions = getScienceQuestions;
const getImageDifferences = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('imageDifference', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching image difference questions:', error);
        res.status(500).json({ error: 'Failed to fetch image difference questions' });
    }
};
exports.getImageDifferences = getImageDifferences;
// Add type-specific getters:
const getImageMatching = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('matching', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching matching questions:', error);
        res.status(500).json({ error: 'Failed to fetch matching questions' });
    }
};
exports.getImageMatching = getImageMatching;
const getShadowImageMatching = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('shadowMatching', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching shadow matching questions:', error);
        res.status(500).json({ error: 'Failed to fetch shadow matching questions' });
    }
};
exports.getShadowImageMatching = getShadowImageMatching;
const getDotImages = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { questions, total } = await (0, exports.getQuestionsByType)('dotImage', page, limit);
        res.status(200).json({ questions, total, page, limit });
    }
    catch (error) {
        console.error('Error fetching dot image questions:', error);
        res.status(500).json({ error: 'Failed to fetch dot image questions' });
    }
};
exports.getDotImages = getDotImages;
