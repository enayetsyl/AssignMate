'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/constant';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import GraphemeSplitter from 'grapheme-splitter';

/* --------------------------------------------
   1) Split the word into grapheme clusters and merge vowel signs
-------------------------------------------- */
function splitIntoGraphemes(str: string): string[] {
  const splitter = new GraphemeSplitter();
  const clusters = splitter.splitGraphemes(str);
  const vowelSigns = new Set(['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ']);

  const merged: string[] = [];
  for (let i = 0; i < clusters.length; i++) {
    if (vowelSigns.has(clusters[i]) && merged.length > 0) {
      merged[merged.length - 1] += clusters[i];
    } else {
      merged.push(clusters[i]);
    }
  }
  return merged;
}

/* --------------------------------------------
   2) Create an empty grid
-------------------------------------------- */
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

/* --------------------------------------------
   3) Define possible directions (8 directions)
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
   4) Check if a word can be placed
-------------------------------------------- */
function canPlaceWord(
  grid: string[][],
  graphemes: string[],
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number
): boolean {
  const size = grid.length;
  for (let i = 0; i < graphemes.length; i++) {
    const r = startRow + i * dRow;
    const c = startCol + i * dCol;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== '' && grid[r][c] !== graphemes[i]) return false;
  }
  return true;
}

/* --------------------------------------------
   5) Place the word in the grid
-------------------------------------------- */
function placeWord(
  grid: string[][],
  graphemes: string[],
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number
): [number, number][] {
  const positions: [number, number][] = [];
  for (let i = 0; i < graphemes.length; i++) {
    const r = startRow + i * dRow;
    const c = startCol + i * dCol;
    grid[r][c] = graphemes[i];
    positions.push([r, c]);
  }
  return positions;
}

/* --------------------------------------------
   6) Generate the puzzle
-------------------------------------------- */
function generatePuzzle(
  word: string,
  gridSize = 12,
  minPlacement: number = 8,
  maxPlacement: number = 12,
  allowedDirections: [number, number][] = DIRECTIONS
): { grid: string[][]; placements: [number, number][][] } {
  const grid = createEmptyGrid(gridSize);
  const placements: [number, number][][] = [];
  const graphemes = splitIntoGraphemes(word);
  const times =
    Math.floor(Math.random() * (maxPlacement - minPlacement + 1)) +
    minPlacement;

  for (let count = 0; count < times; count++) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    while (!placed && attempts < maxAttempts) {
      attempts++;
      const [dRow, dCol] =
        allowedDirections[
          Math.floor(Math.random() * allowedDirections.length)
        ];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      if (canPlaceWord(grid, graphemes, startRow, startCol, dRow, dCol)) {
        const pos = placeWord(grid, graphemes, startRow, startCol, dRow, dCol);
        placements.push(pos);
        placed = true;
      }
    }
  }

  // Fill empty cells with random Bangla letters
  const banglaAlphabets =
    'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        const idx = Math.floor(Math.random() * banglaAlphabets.length);
        grid[r][c] = banglaAlphabets[idx];
      }
    }
  }

  return { grid, placements };
}

interface CustomSingleWordPuzzleProps {
  words: string;
  studentName?: string;
  date?: string;
  studentClass?: string;
}

const CustomSingleWordPuzzle: React.FC<CustomSingleWordPuzzleProps> = ({
  words,
  studentName = '',
  date = '',
  studentClass = '',
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
    'question' | 'answer' | 'two-page'
  >('question');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium'
  );

  const handleGenerate = () => {
    const wordList = words
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);

    if (wordList.length === 0) {
      alert('Please enter at least one word');
      return;
    }

    const generatedPuzzles = wordList.map((word) => {
      let minPlacement = 8;
      let maxPlacement = 12;
      if (difficulty === 'hard') {
        minPlacement = 14;
        maxPlacement = 20;
      }

      let allowedDirs: [number, number][];
      if (difficulty === 'easy') {
        allowedDirs = [
          [0, 1], // horizontal
          [1, 0], // vertical
        ];
      } else if (difficulty === 'medium') {
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
        word,
        12,
        minPlacement,
        maxPlacement,
        allowedDirs
      );

      return { grid, placements, word };
    });

    setPuzzles(generatedPuzzles);
    setShowAnswers(false);
  };

  // Group puzzles into pages (2 per page)
  const groupPuzzlesIntoPages = (puzzleList: typeof puzzles) => {
    const pages: Array<typeof puzzles> = [];
    for (let i = 0; i < puzzleList.length; i += 2) {
      pages.push(puzzleList.slice(i, i + 2));
    }
    return pages;
  };

  const handlePrint = (mode: 'question' | 'answer') => {
    setPrintMode(mode);
    setShowAnswers(mode === 'answer');
    setTimeout(() => window.print(), 100);
  };

  const handlePrintWithStudentInfo = () => {
    // Validate student name, date, and class
    if (!studentName || !studentName.trim()) {
      alert('Please enter a student name');
      return;
    }
    if (!date || !date.trim()) {
      alert('Please enter a date');
      return;
    }
    if (!studentClass || !studentClass.trim()) {
      alert('Please select a class');
      return;
    }
    if (puzzles.length === 0) {
      alert('Please generate puzzle(s) first');
      return;
    }

    // Set print mode for two-page layout
    setPrintMode('two-page');
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
    if (printMode === 'two-page' && !isAnswerPage) {
      return '';
    }
    if (printMode !== 'answer' && printMode !== 'two-page') {
      if (!showAnswers) return '';
    }
    const placements = puzzles[puzzleIndex]?.placements || [];
    for (let i = 0; i < placements.length; i++) {
      const coords = placements[i];
      if (coords.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return '';
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
          <CardTitle>Word Puzzle Generator (Bangla)</CardTitle>
          <CardDescription>
            Generate puzzles for any number of words (2 words per page)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls & Difficulty */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Generate Puzzles
            </Button>
            <Button
              onClick={() => handlePrint('question')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Print Puzzles
            </Button>
            <Button
              onClick={() => handlePrint('answer')}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Print Answers
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
                  setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')
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
        {puzzles.length > 0 && printMode === 'two-page' ? (
          <>
            {/* Puzzle Pages - 2 puzzles per page */}
            {groupPuzzlesIntoPages(puzzles).map((pagePuzzles, pageIndex) => (
              <div key={`puzzle-page-${pageIndex}`} className="print-page">
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
                    pagePuzzles.length === 2 ? 'grid grid-cols-2 gap-8' : ''
                  }`}
                >
                  {pagePuzzles.map((puzzle, puzzleIndex) => {
                    const globalIndex = pageIndex * 2 + puzzleIndex;
                    return (
                      <div key={puzzleIndex} className="mb-8">
                        <CardTitle className="text-center text-2xl text-amber-400 mb-4">
                          See how many times you can find word &quot;
                          {puzzle.word}&quot;.
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
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Answer Pages - 2 puzzles per page */}
            {groupPuzzlesIntoPages(puzzles).map((pagePuzzles, pageIndex) => (
              <div key={`answer-page-${pageIndex}`} className="print-page">
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
                    pagePuzzles.length === 2 ? 'grid grid-cols-2 gap-8' : ''
                  }`}
                >
                  {pagePuzzles.map((puzzle, puzzleIndex) => {
                    const globalIndex = pageIndex * 2 + puzzleIndex;
                    return (
                      <div key={puzzleIndex} className="mb-8">
                        <CardTitle className="text-center text-2xl text-amber-400 mb-4">
                          See how many times you can find word &quot;
                          {puzzle.word}&quot;.
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
                                      globalIndex,
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
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : printMode === 'question' ? (
          // Question pages for regular print
          <>
            {groupPuzzlesIntoPages(puzzles).map((pagePuzzles, pageIndex) => (
              <div key={`question-page-${pageIndex}`} className="print-page">
                <div
                  className={`overflow-x-auto ${
                    pagePuzzles.length === 2 ? 'grid grid-cols-2 gap-8' : ''
                  }`}
                >
                  {pagePuzzles.map((puzzle, puzzleIndex) => {
                    const globalIndex = pageIndex * 2 + puzzleIndex;
                    return (
                      <div key={puzzleIndex} className="mb-8">
                        <CardTitle className="text-center text-2xl text-amber-400 mb-4">
                          See how many times you can find word &quot;
                          {puzzle.word}&quot;.
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
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : printMode === 'answer' ? (
          // Answer pages for regular print
          <>
            {groupPuzzlesIntoPages(puzzles).map((pagePuzzles, pageIndex) => (
              <div key={`answer-page-${pageIndex}`} className="print-page">
                <div
                  className={`overflow-x-auto ${
                    pagePuzzles.length === 2 ? 'grid grid-cols-2 gap-8' : ''
                  }`}
                >
                  {pagePuzzles.map((puzzle, puzzleIndex) => {
                    const globalIndex = pageIndex * 2 + puzzleIndex;
                    return (
                      <div key={puzzleIndex} className="mb-8">
                        <CardTitle className="text-center text-2xl text-amber-400 mb-4">
                          See how many times you can find word &quot;
                          {puzzle.word}&quot;.
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
                                      globalIndex,
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
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          // Screen view - show all puzzles
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </div>
        )}
      </div>
    </>
  );
};

export default CustomSingleWordPuzzle;

