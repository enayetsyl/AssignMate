"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Science = void 0;
// src/models/science.model.ts
const mongoose_1 = require("mongoose");
const baseQuestion_model_1 = __importDefault(require("./baseQuestion.model"));
const ScienceSchema = new mongoose_1.Schema({
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length >= 3 && arr.length <= 4;
            },
            message: 'Science question must have between 3 and 4 options.',
        },
    },
});
exports.Science = baseQuestion_model_1.default.discriminator('science', ScienceSchema);
