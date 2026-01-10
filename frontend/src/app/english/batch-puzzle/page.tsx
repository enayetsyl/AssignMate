'use client';

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { COLORS } from '@/constant';

type PuzzleType =
  | 'single-word'
  | 'multi-word-easy'
  | 'multi-word-medium'
  | 'multi-word-hard'
  | 'multi-word-stone';

type Difficulty = 'easy' | 'medium' | 'hard';
type LetterCase = 'uppercase' | 'lowercase';

// Direction definitions
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

const MULTI_WORD_DIRECTIONS: number[][][] = [
  [[0, 1]], // horizontal (right)
  [[1, 0]], // vertical (down)
  [[1, 1]], // diagonal down-right
  [[-1, 1]], // diagonal up-right
];

// ============= Single Word Puzzle Generator =============
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

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
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
  }
  return true;
}

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

function generateSingleWordPuzzle(
  word: string,
  gridSize = 12,
  isUppercase = true,
  minPlacement: number = 8,
  maxPlacement: number = 12,
  allowedDirections: [number, number][] = DIRECTIONS
): { grid: string[][]; placements: [number, number][][] } {
  const grid = createEmptyGrid(gridSize);
  const placements: [number, number][][] = [];
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
      if (canPlaceWord(grid, word, startRow, startCol, dRow, dCol)) {
        const pos = placeWord(grid, word, startRow, startCol, dRow, dCol);
        placements.push(pos);
        placed = true;
      }
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        const charCode = 65 + Math.floor(Math.random() * 26);
        const letter = String.fromCharCode(charCode);
        grid[r][c] = isUppercase ? letter : letter.toLowerCase();
      }
    }
  }

  return { grid, placements };
}

// ============= Multi Word Puzzle Generator =============
function canPlaceWordMulti(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  path: number[][]
) {
  let r = row,
    c = col;
  for (let i = 0; i < word.length; i++) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) return false;
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    const [dr, dc] = path[i % path.length];
    r += dr;
    c += dc;
  }
  return true;
}

function placeWordMulti(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  path: number[][]
): [number, number][] {
  let r = row,
    c = col;
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

function generateMultiWordPuzzle(
  words: string[],
  isUppercase: boolean = true
): {
  grid: string[][];
  answers: Record<string, [number, number][]>;
} {
  const maxWordLength = Math.max(...words.map((w) => w.length));
  const gridSize = Math.max(20, maxWordLength + 8);
  const grid = createEmptyGrid(gridSize);
  const answers: Record<string, [number, number][]> = {};

  for (const word of words) {
    let placed = false,
      tries = 0;
    while (!placed && tries++ < 200) {
      const dir =
        MULTI_WORD_DIRECTIONS[
          Math.floor(Math.random() * MULTI_WORD_DIRECTIONS.length)
        ];
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (canPlaceWordMulti(grid, word, row, col, dir)) {
        answers[word] = placeWordMulti(grid, word, row, col, dir);
        placed = true;
      }
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!grid[r][c]) {
        const charCode = 65 + Math.floor(Math.random() * 26);
        const letter = String.fromCharCode(charCode);
        grid[r][c] = isUppercase ? letter : letter.toLowerCase();
      }
    }
  }

  return { grid, answers };
}

// ============= Interfaces =============
interface SingleWordPuzzleData {
  grid: string[][];
  placements: [number, number][][];
  word: string;
}

interface MultiWordPuzzleData {
  grid: string[][];
  answers: Record<string, [number, number][]>;
  words: string[];
}

interface StudentPuzzleSet {
  studentName: string;
  singleWordPuzzles?: SingleWordPuzzleData[];
  multiWordPuzzle?: MultiWordPuzzleData;
}

const BatchPuzzlePage = () => {
  const [studentNames, setStudentNames] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('single-word');
  const [words, setWords] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [letterCase, setLetterCase] = useState<LetterCase>('uppercase');
  const [generatedPuzzles, setGeneratedPuzzles] = useState<StudentPuzzleSet[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handlePuzzleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPuzzleType(e.target.value as PuzzleType);
  };

  const handleWordsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setWords(e.target.value);
  };

  const handleStudentNamesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setStudentNames(e.target.value);
  };

  const getStudentNameList = () => {
    return studentNames
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean);
  };

  const getWordList = () => {
    return words
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);
  };

  const handleGenerate = async () => {
    const nameList = getStudentNameList();
    const wordList = getWordList();

    if (nameList.length === 0) {
      alert('Please enter at least one student name');
      return;
    }

    if (nameList.length < 5 || nameList.length > 30) {
      alert('Please enter between 5 and 30 student names');
      return;
    }

    if (wordList.length === 0) {
      alert('Please enter at least one word');
      return;
    }

    if (!studentClass) {
      alert('Please select a class');
      return;
    }

    if (!date) {
      alert('Please select a date');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const puzzles: StudentPuzzleSet[] = [];
    const isUppercase = letterCase === 'uppercase';

    // Generate puzzles for each student
    for (let i = 0; i < nameList.length; i++) {
      const studentName = nameList[i];

      if (puzzleType === 'single-word') {
        // Generate unique puzzles for each word for this student
        let minPlacement = 8;
        let maxPlacement = 12;
        if (difficulty === 'hard') {
          minPlacement = 14;
          maxPlacement = 20;
        }

        let allowedDirs: [number, number][];
        if (difficulty === 'easy') {
          allowedDirs = [
            [0, 1],
            [1, 0],
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

        const singleWordPuzzles: SingleWordPuzzleData[] = wordList.map(
          (word) => {
            const finalWord = isUppercase
              ? word.toUpperCase()
              : word.toLowerCase();
            const { grid, placements } = generateSingleWordPuzzle(
              finalWord,
              12,
              isUppercase,
              minPlacement,
              maxPlacement,
              allowedDirs
            );
            return { grid, placements, word: finalWord };
          }
        );

        puzzles.push({
          studentName,
          singleWordPuzzles,
        });
      } else {
        // Multi-word puzzle - generate unique puzzle for each student
        const processedWords = wordList
          .slice(0, 20)
          .map((w) => (isUppercase ? w.toUpperCase() : w.toLowerCase()));
        const { grid, answers } = generateMultiWordPuzzle(
          processedWords,
          isUppercase
        );
        puzzles.push({
          studentName,
          multiWordPuzzle: {
            grid,
            answers,
            words: processedWords,
          },
        });
      }

      setProgress(Math.round(((i + 1) / nameList.length) * 100));
      // Allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setGeneratedPuzzles(puzzles);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    if (generatedPuzzles.length === 0) {
      alert('Please generate puzzles first');
      return;
    }
    window.print();
  };

  const getSingleWordCellColor = (
    row: number,
    col: number,
    placements: [number, number][][],
    isAnswer: boolean
  ): string => {
    if (!isAnswer) return '';
    for (let i = 0; i < placements.length; i++) {
      const coords = placements[i];
      if (coords.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return '';
  };

  const getMultiWordCellColor = (
    row: number,
    col: number,
    answers: Record<string, [number, number][]>,
    isAnswer: boolean
  ): string => {
    if (!isAnswer) return '';
    const entries = Object.entries(answers);
    for (let i = 0; i < entries.length; i++) {
      const [, positions] = entries[i];
      if (positions.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return '';
  };

  // Calculate page counts
  const nameList = getStudentNameList();
  const wordList = getWordList();
  const numStudents = nameList.length;
  const numWords = wordList.length;

  let pagesPerStudent = 0;
  if (puzzleType === 'single-word') {
    // 4 words per page for single word puzzles
    pagesPerStudent = Math.ceil(numWords / 4);
  } else {
    // 1 page for multi-word puzzles
    pagesPerStudent = 1;
  }

  const totalPuzzlePages = numStudents * pagesPerStudent;
  const totalAnswerPages = totalPuzzlePages;
  const totalPages = totalPuzzlePages + totalAnswerPages;

  // Group single word puzzles into pages (4 per page)
  const groupPuzzlesIntoPages = (puzzleList: SingleWordPuzzleData[]) => {
    const pages: SingleWordPuzzleData[][] = [];
    for (let i = 0; i < puzzleList.length; i += 4) {
      pages.push(puzzleList.slice(i, i + 4));
    }
    return pages;
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

          .print-page {
            page-break-after: always;
            height: 100vh;
            padding: 10px;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .student-info-header {
            text-align: center;
            margin-bottom: 5px;
            font-size: 14px;
            font-weight: bold;
          }
          .no-print {
            display: none !important;
          }
          .puzzle-grid-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 1fr 1fr !important;
            gap: 10px !important;
            width: 100% !important;
            height: calc(100vh - 60px) !important;
          }
          .puzzle-grid-container.single-puzzle {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr !important;
            justify-items: center !important;
          }
          .puzzle-grid-container.two-puzzles {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 1fr !important;
          }
          .puzzle-grid-container.three-puzzles {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 1fr 1fr !important;
          }
          .puzzle-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .puzzle-table {
            border-collapse: collapse !important;
          }
          .puzzle-table td {
            width: 18px !important;
            height: 18px !important;
            font-size: 10px !important;
            border: 1px solid black !important;
            text-align: center !important;
            padding: 0 !important;
          }
          .puzzle-title {
            font-size: 12px !important;
            margin-bottom: 2px !important;
          }
        }
      `}</style>

      <div className="min-h-screen p-8 bg-gray-50">
        <Card className="max-w-4xl mx-auto my-8 no-print">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Batch Puzzle Generator (English)
            </CardTitle>
            <CardDescription>
              Generate unique puzzles for multiple students with their names,
              class, and date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Names Input */}
            <div className="space-y-2">
              <Label htmlFor="studentNames">
                Student Names (5-30 students, one per line)
              </Label>
              <textarea
                id="studentNames"
                placeholder="Enter student names, one per line"
                value={studentNames}
                onChange={handleStudentNamesChange}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows={6}
              />
              <p className="text-sm text-gray-500">
                Students entered: {nameList.length} (min: 5, max: 30)
              </p>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Class Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="studentClass">Class</Label>
              <select
                id="studentClass"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Class</option>
                <option value="Nursery">Nursery</option>
                <option value="KG">KG</option>
                <option value="One">Class One</option>
                <option value="Two">Class Two</option>
                <option value="Three">Class Three</option>
                <option value="Four">Class Four</option>
                <option value="Five">Class Five</option>
              </select>
            </div>

            {/* Puzzle Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="puzzleType">Puzzle Type</Label>
              <select
                id="puzzleType"
                value={puzzleType}
                onChange={handlePuzzleTypeChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="single-word">Single Word Puzzle</option>
                <option value="multi-word-easy">Multi Word Puzzle Easy</option>
                <option value="multi-word-medium">
                  Multi Word Puzzle Medium
                </option>
                <option value="multi-word-hard">Multi Word Puzzle Hard</option>
                <option value="multi-word-stone">Multi Word Puzzle Stone</option>
              </select>
            </div>

            {/* Letter Case (for English) */}
            <div className="space-y-2">
              <Label>Letter Case</Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="letterCase"
                    value="uppercase"
                    checked={letterCase === 'uppercase'}
                    onChange={() => setLetterCase('uppercase')}
                  />
                  <span>Uppercase</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="letterCase"
                    value="lowercase"
                    checked={letterCase === 'lowercase'}
                    onChange={() => setLetterCase('lowercase')}
                  />
                  <span>Lowercase</span>
                </label>
              </div>
            </div>

            {/* Difficulty (for single word only) */}
            {puzzleType === 'single-word' && (
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="easy">
                    Easy (8-12 placements, horizontal & vertical)
                  </option>
                  <option value="medium">
                    Medium (8-12 placements, + diagonal)
                  </option>
                  <option value="hard">
                    Hard (14-20 placements, all directions)
                  </option>
                </select>
              </div>
            )}

            {/* Words Input Field */}
            <div className="space-y-2">
              <Label htmlFor="words">Words</Label>
              <textarea
                id="words"
                placeholder={
                  puzzleType === 'single-word'
                    ? 'Enter words, one per line (any number of words)'
                    : 'Enter words, one per line (up to 20 words)'
                }
                value={words}
                onChange={handleWordsChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows={5}
              />
              <p className="text-sm text-gray-500">
                Words entered: {numWords}
                {puzzleType !== 'single-word' && ' / 20'}
              </p>
            </div>

            {/* Page Count Preview */}
            {numStudents > 0 && numWords > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Page Calculation:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>Students: {numStudents}</li>
                  <li>
                    Pages per student: {pagesPerStudent} puzzle +{' '}
                    {pagesPerStudent} answer = {pagesPerStudent * 2}
                  </li>
                  <li>Total puzzle pages: {totalPuzzlePages}</li>
                  <li>Total answer pages: {totalAnswerPages}</li>
                  <li className="font-bold">Total pages: {totalPages}</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isGenerating ? `Generating... ${progress}%` : 'Generate Puzzles'}
              </Button>
              <Button
                onClick={handlePrint}
                disabled={generatedPuzzles.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Print All (Puzzles + Answers)
              </Button>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Printable Area */}
        <div id="printable-area" ref={printRef}>
          {generatedPuzzles.length > 0 && (
            <>
              {/* ALL PUZZLE PAGES FIRST */}
              {generatedPuzzles.map((studentData, studentIndex) => (
                <React.Fragment key={`puzzle-${studentIndex}`}>
                  {puzzleType === 'single-word' &&
                    studentData.singleWordPuzzles && (
                      <>
                        {groupPuzzlesIntoPages(
                          studentData.singleWordPuzzles
                        ).map((pagePuzzles, pageIndex) => (
                          <div
                            key={`puzzle-page-${studentIndex}-${pageIndex}`}
                            className="print-page"
                          >
                            <div className="student-info-header">
                              <p>
                                Name: {studentData.studentName} | Class:{' '}
                                {studentClass}
                              </p>
                              <p>Date: {new Date(date).toLocaleDateString()}</p>
                            </div>
                            <div
                              className={`puzzle-grid-container ${
                                pagePuzzles.length === 1
                                  ? 'single-puzzle'
                                  : pagePuzzles.length === 2
                                  ? 'two-puzzles'
                                  : pagePuzzles.length === 3
                                  ? 'three-puzzles'
                                  : ''
                              }`}
                            >
                              {pagePuzzles.map((puzzle, puzzleIndex) => (
                                <div key={puzzleIndex} className="puzzle-item">
                                  <p className="puzzle-title text-center text-sm text-amber-600 mb-1 font-bold">
                                    Find word &quot;{puzzle.word}&quot;
                                  </p>
                                  <table className="puzzle-table mx-auto border-collapse">
                                    <tbody>
                                      {puzzle.grid.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                          {row.map((cell, colIndex) => (
                                            <td
                                              key={colIndex}
                                              className="border border-black text-center font-bold"
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
                        ))}
                      </>
                    )}

                  {puzzleType !== 'single-word' &&
                    studentData.multiWordPuzzle && (
                      <div
                        key={`puzzle-page-${studentIndex}`}
                        className="print-page"
                      >
                        <div className="student-info-header">
                          <p>
                            Name: {studentData.studentName} | Class:{' '}
                            {studentClass}
                          </p>
                          <p>Date: {new Date(date).toLocaleDateString()}</p>
                        </div>
                        <h2 className="font-bold text-2xl underline text-center mb-4">
                          Find the words in the puzzle!
                        </h2>
                        <div className="flex flex-row gap-4 justify-between items-start">
                          <div className="w-1/4 space-y-1">
                            <ul>
                              {studentData.multiWordPuzzle.words.map((word) => (
                                <li
                                  key={word}
                                  className="flex items-center gap-2"
                                >
                                  <input type="checkbox" />
                                  <span className="text-lg">{word}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="w-3/4 overflow-auto">
                            <table className="border border-black border-collapse mx-auto text-lg">
                              <tbody>
                                {studentData.multiWordPuzzle.grid.map(
                                  (row, rIdx) => (
                                    <tr key={rIdx}>
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="border border-black w-5 h-5 text-center font-bold text-xs"
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                </React.Fragment>
              ))}

              {/* ALL ANSWER PAGES AFTER */}
              {generatedPuzzles.map((studentData, studentIndex) => (
                <React.Fragment key={`answer-${studentIndex}`}>
                  {puzzleType === 'single-word' &&
                    studentData.singleWordPuzzles && (
                      <>
                        {groupPuzzlesIntoPages(
                          studentData.singleWordPuzzles
                        ).map((pagePuzzles, pageIndex) => (
                          <div
                            key={`answer-page-${studentIndex}-${pageIndex}`}
                            className="print-page"
                          >
                            <div className="student-info-header">
                              <p>
                                Name: {studentData.studentName} | Class:{' '}
                                {studentClass}
                              </p>
                              <p>Date: {new Date(date).toLocaleDateString()}</p>
                              <p className="text-red-600 mt-1">Answer Key</p>
                            </div>
                            <div
                              className={`puzzle-grid-container ${
                                pagePuzzles.length === 1
                                  ? 'single-puzzle'
                                  : pagePuzzles.length === 2
                                  ? 'two-puzzles'
                                  : pagePuzzles.length === 3
                                  ? 'three-puzzles'
                                  : ''
                              }`}
                            >
                              {pagePuzzles.map((puzzle, puzzleIndex) => (
                                <div key={puzzleIndex} className="puzzle-item">
                                  <p className="puzzle-title text-center text-sm text-amber-600 mb-1 font-bold">
                                    Find word &quot;{puzzle.word}&quot;
                                  </p>
                                  <table className="puzzle-table mx-auto border-collapse">
                                    <tbody>
                                      {puzzle.grid.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                          {row.map((cell, colIndex) => (
                                            <td
                                              key={colIndex}
                                              className={`border border-black text-center font-bold ${getSingleWordCellColor(
                                                rowIndex,
                                                colIndex,
                                                puzzle.placements,
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
                        ))}
                      </>
                    )}

                  {puzzleType !== 'single-word' &&
                    studentData.multiWordPuzzle && (
                      <div
                        key={`answer-page-${studentIndex}`}
                        className="print-page"
                      >
                        <div className="student-info-header">
                          <p>
                            Name: {studentData.studentName} | Class:{' '}
                            {studentClass}
                          </p>
                          <p>Date: {new Date(date).toLocaleDateString()}</p>
                          <p className="text-red-600 mt-1">Answer Key</p>
                        </div>
                        <h2 className="font-bold text-2xl underline text-center mb-4">
                          Find the words in the puzzle!
                        </h2>
                        <div className="flex justify-center">
                          <div className="overflow-auto">
                            <table className="border border-black border-collapse mx-auto text-lg">
                              <tbody>
                                {studentData.multiWordPuzzle.grid.map(
                                  (row, rIdx) => (
                                    <tr key={rIdx}>
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className={`border border-black w-5 h-5 text-center font-bold text-xs ${getMultiWordCellColor(
                                            rIdx,
                                            cIdx,
                                            studentData.multiWordPuzzle!.answers,
                                            true
                                          )}`}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        {/* Screen Preview */}
        {generatedPuzzles.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 no-print">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Generated {generatedPuzzles.length} student puzzle sets. Click
                  &quot;Print All&quot; to print.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  The PDF will contain all puzzle pages first, followed by all
                  answer pages. Each page will have the student name, class, and
                  date.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default BatchPuzzlePage;
