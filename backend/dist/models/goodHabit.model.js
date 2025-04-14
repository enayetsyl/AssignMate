"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodHabit = void 0;
// src/models/goodHabit.model.ts
const mongoose_1 = require("mongoose");
const baseQuestion_model_1 = __importDefault(require("./baseQuestion.model"));
const GoodHabitSchema = new mongoose_1.Schema({
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length >= 3 && arr.length <= 4;
            },
            message: 'Good habit question must have between 3 and 4 options.',
        },
    },
});
exports.GoodHabit = baseQuestion_model_1.default.discriminator('goodHabit', GoodHabitSchema);
