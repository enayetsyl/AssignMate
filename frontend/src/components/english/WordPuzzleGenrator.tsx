'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import Image from 'next/image';
import { COLORS } from '@/constant';

/* --------------------------------------------
   1) Create an empty grid of given size.
-------------------------------------------- */
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

/* --------------------------------------------
   2) All possible directions for word placement.
-------------------------------------------- */
const DIRECTIONS: [number, number][] = [
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1],  // Right
  [-1, -1],// Up-Left
  [-1, 1], // Up-Right
  [1, -1], // Down-Left
  [1, 1],  // Down-Right
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
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
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
  const times = Math.floor(Math.random() * (maxPlacement - minPlacement + 1)) + minPlacement;

  for (let count = 0; count < times; count++) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    while (!placed && attempts < maxAttempts) {
      attempts++;
      // Pick a random direction.
      const [dRow, dCol] =
  allowedDirections[Math.floor(Math.random() * allowedDirections.length)];
      // For easy mode (if only horizontal & vertical are allowed), you might override allowed directions externally.
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
      if (grid[r][c] === '') {
        const charCode = 65 + Math.floor(Math.random() * 26); // A-Z
        const letter = String.fromCharCode(charCode);
        grid[r][c] = isUppercase ? letter : letter.toLowerCase();
      }
    }
  }

  return { grid, placements };
}


/* --------------------------------------------
   7) Component: WordPuzzleGenerator
-------------------------------------------- */
const WordPuzzleGenerator: React.FC = () => {
  // State for the single word.
  const [word, setWord] = useState('');
  // Optional image URL.
  const [imageURL, setImageURL] = useState<string | null>(null);
  // The generated puzzle grid.
  const [puzzle, setPuzzle] = useState<string[][]>([]);
  // Store the answer key: an array of placements.
  const [placements, setPlacements] = useState<[number, number][][]>([]);
  // Letter case: uppercase or lowercase.
  const [letterCase, setLetterCase] = useState<'uppercase' | 'lowercase'>('uppercase');
  // Difficulty (which affects the number of placements and allowed directions).
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  // Printing state.
  const [printMode, setPrintMode] = useState<'question' | 'answer'>('question');
  const [showAnswers, setShowAnswers] = useState(false);

  // Handle image file changes.
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageURL(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Generate the puzzle with placement counts based on difficulty.
  const handleGenerate = () => {
    if (!word) return;
    const finalWord = letterCase === 'uppercase' ? word.toUpperCase() : word.toLowerCase();

    let minPlacement = 8;
    let maxPlacement = 12;
    // For "hard", allow more placements.
    if (difficulty === 'hard') {
      minPlacement = 14;
      maxPlacement = 20;
    }
    // For "easy" and "medium", we want 8-12 placements.
    // Also, if "easy", we allow only horizontal and vertical directions.
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

    // We'll use the same gridSize (e.g., 12) for all difficulties.
    const { grid, placements } = generatePuzzle(
      finalWord,
      12,
      letterCase === 'uppercase',
      minPlacement,
      maxPlacement,
      allowedDirs  // <--- pass it here
    );
    setPuzzle(grid);
    setPlacements(placements);
    setShowAnswers(false);
  };

  // Print mode: question (normal) vs. answer (colored).
  const handlePrint = (mode: 'question' | 'answer') => {
    setPrintMode(mode);
    setShowAnswers(mode === 'answer');
    setTimeout(() => window.print(), 100);
  };

  // When printing answers, highlight cells that belong to a placement.
  // Each placement gets a color from COLORS.
  const getCellColor = (row: number, col: number) => {
    if (!showAnswers || printMode !== 'answer') return '';
    for (let i = 0; i < placements.length; i++) {
      const coords = placements[i];
      if (coords.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return '';
  };

  // Print the puzzle area.
  const handlePrintPuzzle = () => handlePrint('question');
  // Print the answer key (with colors).
  const handlePrintAnswer = () => handlePrint('answer');

  return (
    <>
      {/* Print Styles: only #printable-area is visible in print */}
      <style jsx global>{`
        @media print {
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
        }
      `}</style>

      <Card className="max-w-3xl mx-auto my-8 p-4">
        <CardHeader>
          <CardTitle>Word Puzzle Generator</CardTitle>
          <CardDescription>
            Enter a word, choose uppercase or lowercase, optionally add an image, and generate a puzzle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Word Input */}
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              placeholder="Enter a word (e.g. 'ant')"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>

          {/* Letter Case Options */}
          <div className="space-y-2">
            <Label htmlFor="letterCase">Letter Case</Label>
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Controls & Difficulty */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-2 rounded">
              Generate Puzzle
            </Button>
            <Button onClick={handlePrintPuzzle} className="bg-green-600 text-white px-4 py-2 rounded">
              Print Puzzle
            </Button>
            <Button onClick={handlePrintAnswer} className="bg-orange-500 text-white px-4 py-2 rounded">
              Print Answer
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="difficultySelect">Difficulty:</Label>
              <select
                id="difficultySelect"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="border rounded p-1"
              >
                <option value="easy">Easy (8–12 placements, horizontal & vertical)</option>
                <option value="medium">Medium (8–12 placements, horizontal, vertical & diagonal)</option>
                <option value="hard">Hard (14–20 placements, horizontal, vertical & diagonal)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable Area */}
      <div id="printable-area" className="mt-4">
        {puzzle.length > 0 && (
          <div className="overflow-x-auto">
            <CardTitle className="text-center text-2xl text-amber-400">
              See how many times you can find word &quot;{word}&quot;.
            </CardTitle>
            <table className="mx-auto my-4 border-collapse">
              <tbody>
                {puzzle.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border p-2 text-center font-bold ${getCellColor(rowIndex, colIndex)}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Display Uploaded Image(s) */}
        {imageURL && (
          <div className="mt-4 flex justify-center items-center gap-5">
            <Image src={imageURL} alt="Puzzle Illustration" className="inline-block max-h-20" height={40} width={40} />
            <Image src={imageURL} alt="Puzzle Illustration" className="inline-block max-h-20" height={40} width={40} />
            <Image src={imageURL} alt="Puzzle Illustration" className="inline-block max-h-20" height={40} width={40} />
            <Image src={imageURL} alt="Puzzle Illustration" className="inline-block max-h-20" height={40} width={40} />
          </div>
        )}
      </div>
    </>
  );
};

export default WordPuzzleGenerator;
