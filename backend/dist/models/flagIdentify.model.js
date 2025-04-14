"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagIdentify = void 0;
// src/models/flagIdentify.model.ts
const mongoose_1 = require("mongoose");
const baseQuestion_model_1 = __importDefault(require("./baseQuestion.model"));
const FlagIdentifySchema = new mongoose_1.Schema({
    image: { type: String, required: true },
});
exports.FlagIdentify = baseQuestion_model_1.default.discriminator('flagIdentify', FlagIdentifySchema);
