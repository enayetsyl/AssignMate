"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/baseQuestion.model.ts
const mongoose_1 = require("mongoose");
const BaseQuestionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ['riddle', 'flagIdentify', 'goodHabit', 'science', 'imageDifference'],
    },
    question: { type: String, required: true },
    answer: { type: mongoose_1.Schema.Types.Mixed, required: true },
}, { discriminatorKey: 'type', timestamps: true });
// Create an index on the type field for faster queries
BaseQuestionSchema.index({ type: 1 });
const BaseQuestion = (0, mongoose_1.model)('Question', BaseQuestionSchema);
exports.default = BaseQuestion;
