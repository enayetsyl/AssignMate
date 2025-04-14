"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matching = void 0;
// src/models/matching.model.ts
const mongoose_1 = require("mongoose");
const baseQuestion_model_1 = __importDefault(require("./baseQuestion.model"));
const MatchingSchema = new mongoose_1.Schema({
    image: { type: String, required: true },
});
exports.Matching = baseQuestion_model_1.default.discriminator('matching', MatchingSchema);
