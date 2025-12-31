"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/constant";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

/* --------------------------------------------
   1) Create an empty grid of given size.
-------------------------------------------- */
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

/* --------------------------------------------
   2) All possible directions for word placement.
-------------------------------------------- */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // Up
  [1, 0], // Down
  [0, -1], // Left
  [0, 1], // Right
  [-1, -1], // Up-Left
  [-1, 1], // Up-Right
  [1, -1], // Down-Left
  [1, 1], // Down-Right
];

/* --------------------------------------------
   3) Check if a word can be placed in the grid
      starting at (startRow, startCol) in direction (dRow, dCol).
      Overlapping is allowed if letters match.
-------------------------------------------- */
function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number
): boolean {
  const size = grid.length;
  for (let i = 0; i < word.length; i++) {
    const r = startRow + i * dRow;
    const c = startCol + i * dCol;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== "" && grid[r][c] !== word[i]) return false;
  }
  return true;
}

/* --------------------------------------------
   4) Place the word in the grid.
      (Assumes that canPlaceWord has returned true.)
      Returns an array of positions for the letters.
-------------------------------------------- */
function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number
): [number, number][] {
  const positions: [number, number][] = [];
  for (let i = 0; i < word.length; i++) {
    const r = startRow + i * dRow;
    const c = startCol + i * dCol;
    grid[r][c] = word[i];
    positions.push([r, c]);
  }
  return positions;
}

/* --------------------------------------------
   5) Generate the puzzle.
      - Place the same word multiple times.
      - The number of placements is random between minPlacement and maxPlacement.
      - Then fill empty cells with random letters.
      - Returns both the grid and the placements (answer key).
-------------------------------------------- */
function generatePuzzle(
  word: string,
  gridSize = 12,
  isUppercase = true,
  minPlacement: number = 8,
  maxPlacement: number = 12,
  allowedDirections: [number, number][] = DIRECTIONS
): { grid: string[][]; placements: [number, number][][] } {
  const grid = createEmptyGrid(gridSize);
  const placements: [number, number][][] = [];
  // Choose a random count between minPlacement and maxPlacement.
  const times =
    Math.floor(Math.random() * (maxPlacement - minPlacement + 1)) +
    minPlacement;

  for (let count = 0; count < times; count++) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    while (!placed && attempts < maxAttempts) {
      attempts++;
      // Pick a random direction.
      const [dRow, dCol] =
        allowedDirections[
          Math.floor(Math.random() * allowedDirections.length)
        ];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      if (canPlaceWord(grid, word, startRow, startCol, dRow, dCol)) {
        const pos = placeWord(grid, word, startRow, startCol, dRow, dCol);
        placements.push(pos);
        placed = true;
      }
    }
  }

  // Fill empty cells with random letters.
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === "") {
        const charCode = 65 + Math.floor(Math.random() * 26); // A-Z
        const letter = String.fromCharCode(charCode);
        grid[r][c] = isUppercase ? letter : letter.toLowerCase();
      }
    }
  }

  return { grid, placements };
}

interface CustomSingleWordPuzzleProps {
  words: string;
  numberOfPuzzles: number;
  studentName?: string;
  date?: string;
  studentClass?: string;
}

const CustomSingleWordPuzzle: React.FC<CustomSingleWordPuzzleProps> = ({
  words,
  numberOfPuzzles,
  studentName = "",
  date = "",
  studentClass = "",
}) => {
  const [puzzles, setPuzzles] = useState<
    Array<{
      grid: string[][];
      placements: [number, number][][];
      word: string;
    }>
  >([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [printMode, setPrintMode] = useState<
    "question" | "answer" | "two-page"
  >("question");
  const [letterCase, setLetterCase] = useState<"uppercase" | "lowercase">(
    "uppercase"
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

  const handleGenerate = () => {
    const wordList = words
      .split("\n")
      .map((w) => w.trim())
      .filter(Boolean)
      .slice(0, numberOfPuzzles);

    if (wordList.length !== numberOfPuzzles) {
      alert(
        `Please enter exactly ${numberOfPuzzles} word${numberOfPuzzles > 1 ? "s" : ""}`
      );
      return;
    }

    const generatedPuzzles = wordList.map((word) => {
      const finalWord =
        letterCase === "uppercase" ? word.toUpperCase() : word.toLowerCase();

      let minPlacement = 8;
      let maxPlacement = 12;
      if (difficulty === "hard") {
        minPlacement = 14;
        maxPlacement = 20;
      }

      let allowedDirs: [number, number][];
      if (difficulty === "easy") {
        allowedDirs = [
          [0, 1], // horizontal
          [1, 0], // vertical
        ];
      } else if (difficulty === "medium") {
        allowedDirs = [
          [0, 1],
          [1, 0],
          [1, 1],
          [-1, 1],
        ];
      } else {
        allowedDirs = DIRECTIONS;
      }

      const { grid, placements } = generatePuzzle(
        finalWord,
        12,
        letterCase === "uppercase",
        minPlacement,
        maxPlacement,
        allowedDirs
      );

      return { grid, placements, word: finalWord };
    });

    setPuzzles(generatedPuzzles);
    setShowAnswers(false);
  };

  const handlePrint = (mode: "question" | "answer") => {
    setPrintMode(mode);
    setShowAnswers(mode === "answer");
    setTimeout(() => window.print(), 100);
  };

  const handlePrintWithStudentInfo = () => {
    // Validate student name, date, and class
    if (!studentName || !studentName.trim()) {
      alert("Please enter a student name");
      return;
    }
    if (!date || !date.trim()) {
      alert("Please enter a date");
      return;
    }
    if (!studentClass || !studentClass.trim()) {
      alert("Please select a class");
      return;
    }
    if (puzzles.length === 0) {
      alert("Please generate puzzle(s) first");
      return;
    }

    // Set print mode for two-page layout
    setPrintMode("two-page");
    setShowAnswers(false);
    setTimeout(() => window.print(), 100);
  };

  const getCellColor = (
    row: number,
    col: number,
    puzzleIndex: number,
    isAnswerPage: boolean = false
  ): string => {
    // Show colors only on answer page or when printMode is answer
    if (printMode === "two-page" && !isAnswerPage) {
      return "";
    }
    if (printMode !== "answer" && printMode !== "two-page") {
      if (!showAnswers) return "";
    }
    const placements = puzzles[puzzleIndex]?.placements || [];
    for (let i = 0; i < placements.length; i++) {
      const coords = placements[i];
      if (coords.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return "";
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-area,
          #printable-area * {
            visibility: visible !important;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          /* Two-page layout styles */
          .print-page {
            page-break-after: always;
            display: flex;
            flex-direction: column;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .print-page:first-child {
            page-break-before: auto;
          }
          .student-info-header {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
          }
        }
      `}</style>

      <Card className="max-w-3xl mx-auto my-8 p-4">
        <CardHeader>
          <CardTitle>Word Puzzle Generator</CardTitle>
          <CardDescription>
            Generate {numberOfPuzzles} puzzle{numberOfPuzzles > 1 ? "s" : ""} for{" "}
            {numberOfPuzzles} word{numberOfPuzzles > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Letter Case Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Letter Case</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  name="letterCase"
                  value="uppercase"
                  checked={letterCase === "uppercase"}
                  onChange={() => setLetterCase("uppercase")}
                />
                <span>Uppercase</span>
              </label>
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  name="letterCase"
                  value="lowercase"
                  checked={letterCase === "lowercase"}
                  onChange={() => setLetterCase("lowercase")}
                />
                <span>Lowercase</span>
              </label>
            </div>
          </div>

          {/* Controls & Difficulty */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Generate Puzzle{numberOfPuzzles > 1 ? "s" : ""}
            </Button>
            <Button
              onClick={() => handlePrint("question")}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Print Puzzle{numberOfPuzzles > 1 ? "s" : ""}
            </Button>
            <Button
              onClick={() => handlePrint("answer")}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Print Answer{numberOfPuzzles > 1 ? "s" : ""}
            </Button>
            <Button
              onClick={handlePrintWithStudentInfo}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Print with Student Info
            </Button>
            <div className="flex items-center gap-2">
              <label htmlFor="difficultySelect" className="text-sm font-medium">
                Difficulty:
              </label>
              <select
                id="difficultySelect"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "easy" | "medium" | "hard")
                }
                className="border rounded p-1"
              >
                <option value="easy">
                  Easy (8–12 placements, horizontal & vertical)
                </option>
                <option value="medium">
                  Medium (8–12 placements, horizontal, vertical & diagonal)
                </option>
                <option value="hard">
                  Hard (14–20 placements, horizontal, vertical & diagonal)
                </option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable Area */}
      <div id="printable-area" className="mt-4">
        {puzzles.length > 0 && printMode === "two-page" ? (
          <>
            {/* First Page - Puzzle */}
            <div className="print-page">
              {(studentName || date || studentClass) && (
                <div className="student-info-header">
                  {studentName && (
                    <p>
                      Name: {studentName}
                      {studentClass && ` | Class: ${studentClass}`}
                    </p>
                  )}
                  {date && <p>Date: {new Date(date).toLocaleDateString()}</p>}
                </div>
              )}
              <div
                className={`overflow-x-auto ${
                  numberOfPuzzles === 2 ? "grid grid-cols-2 gap-8" : ""
                }`}
              >
                {puzzles.map((puzzle, puzzleIndex) => (
                  <div key={puzzleIndex} className="mb-8">
                    <CardTitle className="text-center text-2xl text-amber-400 mb-4">
                      See how many times you can find word &quot;{puzzle.word}
                      &quot;.
                    </CardTitle>
                    <table className="mx-auto my-4 border-collapse">
                      <tbody>
                        {puzzle.grid.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                              <td
                                key={colIndex}
                                className="border p-2 text-center font-bold"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

            {/* Second Page - Answers */}
            <div className="print-page">
              {(studentName || date || studentClass) && (
                <div className="student-info-header">
                  {studentName && (
                    <p>
                      Name: {studentName}
                      {studentClass && ` | Class: ${studentClass}`}
                    </p>
                  )}
                  {date && <p>Date: {new Date(date).toLocaleDateString()}</p>}
                  <p className="mt-2">Answer Key</p>
                </div>
              )}
              <div
                className={`overflow-x-auto ${
                  numberOfPuzzles === 2 ? "grid grid-cols-2 gap-8" : ""
                }`}
              >
                {puzzles.map((puzzle, puzzleIndex) => (
                  <div key={puzzleIndex} className="mb-8">
                    <CardTitle className="text-center text-2xl text-amber-400 mb-4">
                      See how many times you can find word &quot;{puzzle.word}
                      &quot;.
                    </CardTitle>
                    <table className="mx-auto my-4 border-collapse">
                      <tbody>
                        {puzzle.grid.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                              <td
                                key={colIndex}
                                className={`border p-2 text-center font-bold ${getCellColor(
                                  rowIndex,
                                  colIndex,
                                  puzzleIndex,
                                  true
                                )}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div
            className={`overflow-x-auto ${
              numberOfPuzzles === 2 ? "grid grid-cols-2 gap-8" : ""
            }`}
          >
            {puzzles.map((puzzle, puzzleIndex) => (
              <div key={puzzleIndex} className="mb-8">
                <CardTitle className="text-center text-2xl text-amber-400 mb-4">
                  See how many times you can find word &quot;{puzzle.word}
                  &quot;.
                </CardTitle>
                <table className="mx-auto my-4 border-collapse">
                  <tbody>
                    {puzzle.grid.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className={`border p-2 text-center font-bold ${getCellColor(
                              rowIndex,
                              colIndex,
                              puzzleIndex
                            )}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CustomSingleWordPuzzle;

