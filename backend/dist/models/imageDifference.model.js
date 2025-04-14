"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageDifference = void 0;
// src/models/imageDifference.model.ts
const mongoose_1 = require("mongoose");
const baseQuestion_model_1 = __importDefault(require("./baseQuestion.model"));
const ImageDifferenceSchema = new mongoose_1.Schema({
    image: { type: String, required: true }
});
exports.ImageDifference = baseQuestion_model_1.default.discriminator('imageDifference', ImageDifferenceSchema);
