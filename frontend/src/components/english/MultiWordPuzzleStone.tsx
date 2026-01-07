"use client";

import { COLORS } from "@/constant";
import React, { useEffect, useState } from "react";

// ======= CONSTANTS & TYPES =======
const MAX_WORDS = 20;

interface MultiWordPuzzleGeneratorStoneProps {
  words?: string;
  studentName?: string;
  date?: string;
  studentClass?: string;
}

export type Direction = number[][];

export const DIRECTIONS: Direction[] = [
  [[0, 1]], // horizontal
  [[1, 0]], // vertical
  [[1, 1]], // diagonal down-right
  [[-1, 1]], // diagonal up-right
];

// ======= PUZZLE HELPER FUNCTIONS =======

function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  path: Direction
) {
  let r = row;
  let c = col;
  for (let i = 0; i < word.length; i++) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) return false;
    if (grid[r][c] !== "" && grid[r][c] !== word[i]) return false;
    const [dr, dc] = path[i % path.length];
    r += dr;
    c += dc;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  path: Direction
): [number, number][] {
  let r = row;
  let c = col;
  const positions: [number, number][] = [];
  for (let i = 0; i < word.length; i++) {
    grid[r][c] = word[i];
    positions.push([r, c]);
    const [dr, dc] = path[i % path.length];
    r += dr;
    c += dc;
  }
  return positions;
}

/**
 * Generate a puzzle placing each word in the grid (horizontal, vertical, or diagonal).
 * Fills empty cells with random letters.
 */
function generatePuzzle(words: string[]): {
  grid: string[][];
  answers: Record<string, [number, number][]>;
} {
  const maxWordLength = Math.max(...words.map((w) => w.length));
  const gridSize = Math.max(20, maxWordLength + 8);
  const grid = createEmptyGrid(gridSize);
  const answers: Record<string, [number, number][]> = {};

  for (const word of words) {
    let placed = false;
    let tries = 0;
    while (!placed && tries++ < 300) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (canPlace(grid, word, row, col, dir)) {
        answers[word] = placeWord(grid, word, row, col, dir);
        placed = true;
      }
    }
  }

  // Fill empty cells with random letters.
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, answers };
}

// ======= SUPER HARD PUZZLE COMPONENT =======

const MultiWordPuzzleGeneratorStone: React.FC<
  MultiWordPuzzleGeneratorStoneProps
> = ({
  words: wordsProp = "",
  studentName = "",
  date = "",
  studentClass = "",
}) => {
  const [isClient, setIsClient] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<Record<string, [number, number][]>>(
    {}
  );
  const [printMode, setPrintMode] = useState<
    "question" | "answer" | "two-page"
  >("question");
  const [showAnswers, setShowAnswers] = useState(false);

  // Ensure the component renders client-side only.
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync words prop to internal state
  useEffect(() => {
    if (wordsProp) {
      const list = wordsProp
        .split("\n")
        .map((w) => w.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, MAX_WORDS);
      setWords(list);
    }
  }, [wordsProp]);

  if (!isClient) return null;

  const handleWordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const list = e.target.value
      .split("\n")
      .map((w) => w.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, MAX_WORDS);
    setWords(list);
  };

  const handleGenerate = () => {
    const { grid, answers } = generatePuzzle(words);
    setGrid(grid);
    setAnswers(answers);
    setShowAnswers(false);
  };

  const handlePrint = (mode: "question" | "answer") => {
    setPrintMode(mode);
    setShowAnswers(mode === "answer");
    setTimeout(() => window.print(), 100);
  };

  const handlePrintWithStudentInfo = () => {
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
    if (grid.length === 0) {
      alert("Please generate puzzle first");
      return;
    }
    setPrintMode("two-page");
    setShowAnswers(false);
    setTimeout(() => window.print(), 100);
  };

  const getCellColor = (
    row: number,
    col: number,
    isAnswerPage: boolean = false
  ) => {
    if (printMode === "two-page" && !isAnswerPage) return "";
    if (
      (!showAnswers && printMode !== "two-page") ||
      (printMode !== "answer" && printMode !== "two-page")
    )
      return "";
    if (!showAnswers || printMode !== "answer") return "";
    const entries = Object.entries(answers);
    for (let i = 0; i < entries.length; i++) {
      const [, positions] = entries[i];
      if (positions.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return "";
  };

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <textarea
          placeholder="Enter up to 20 words, one per line"
          className="border p-2 w-full h-40"
          onChange={handleWordChange}
        />
        <p className="text-sm text-gray-500">
          Words added: {words.length} / {MAX_WORDS}
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate Puzzle
          </button>
          <button
            onClick={() => handlePrint("question")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Print Question
          </button>
          <button
            onClick={() => handlePrint("answer")}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Print Answer
          </button>
          <button
            onClick={handlePrintWithStudentInfo}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Print with Student Info
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div id="printable-area" className="mt-4">
        {printMode === "two-page" ? (
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
              <h2 className="font-bold text-2xl text-center mb-4">
                Find the words in the puzzle!
              </h2>
              <div className="flex justify-center">
                <table className="border border-black border-collapse">
                  <tbody>
                    {grid.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="border border-black w-8 h-8 text-center font-bold"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <h2 className="font-bold text-2xl text-center mb-4">
                Find the words in the puzzle!
              </h2>
              <div className="flex justify-center">
                <table className="border border-black border-collapse">
                  <tbody>
                    {grid.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`border border-black w-8 h-8 text-center font-bold ${getCellColor(
                              rIdx,
                              cIdx,
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
            </div>
          </>
        ) : (
          <>
            <h2 className="font-bold text-2xl text-center mb-4">
              Find the words in the puzzle!
            </h2>
            <div className="flex justify-center">
              <table className="border border-black border-collapse">
                <tbody>
                  {grid.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`border border-black w-8 h-8 text-center font-bold ${getCellColor(
                            rIdx,
                            cIdx
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
          </>
        )}
      </div>

      {/* Global Print Styling */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            inset: 0;
            width: 100vw;
            height: 100vh;
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

          table,
          tr,
          td {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default MultiWordPuzzleGeneratorStone;
