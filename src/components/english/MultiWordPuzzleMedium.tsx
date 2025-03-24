'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

// ======== CONSTANTS ========
const MAX_WORDS = 20;
// Number of cells to clear for the image region
const IMAGE_BLOCK_SIZE = 5;

type ImagePosition = 'middle' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

// Color highlight palette for answers
const COLORS = [
  'bg-red-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-orange-200',
  'bg-teal-200',
  'bg-cyan-200',
  'bg-amber-200',
  'bg-lime-200',
  'bg-indigo-200',
  'bg-rose-200',
  'bg-violet-200',
  'bg-fuchsia-200',
  'bg-emerald-200',
  'bg-sky-200',
  'bg-slate-200',
  'bg-gray-200',
  'bg-stone-200',
];

// Directions: horizontal (→), vertical (↓), diagonal down-right, diagonal up-right
export type Direction = number[][];
export const DIRECTIONS: Direction[] = [
  [[0, 1]],   // horizontal
  [[1, 0]],   // vertical
  [[1, 1]],   // diagonal down-right
  [[-1, 1]],  // diagonal up-right
];

// =========== PUZZLE HELPERS ===========

function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

/**
 * Returns the row/col boundaries for the blank region
 * where the image will be placed.
 */
function getBlankRegion(gridSize: number, position: ImagePosition) {
  let rowStart = 0;
  let colStart = 0;

  switch (position) {
    case 'top-left':
      rowStart = 0;
      colStart = 0;
      break;
    case 'top-right':
      rowStart = 0;
      colStart = gridSize - IMAGE_BLOCK_SIZE;
      break;
    case 'bottom-left':
      rowStart = gridSize - IMAGE_BLOCK_SIZE;
      colStart = 0;
      break;
    case 'bottom-right':
      rowStart = gridSize - IMAGE_BLOCK_SIZE;
      colStart = gridSize - IMAGE_BLOCK_SIZE;
      break;
    case 'middle':
      rowStart = Math.floor(gridSize / 2 - IMAGE_BLOCK_SIZE / 2);
      colStart = Math.floor(gridSize / 2 - IMAGE_BLOCK_SIZE / 2);
      break;
  }

  // Clamp to grid boundaries
  if (rowStart < 0) rowStart = 0;
  if (colStart < 0) colStart = 0;
  if (rowStart + IMAGE_BLOCK_SIZE > gridSize) rowStart = gridSize - IMAGE_BLOCK_SIZE;
  if (colStart + IMAGE_BLOCK_SIZE > gridSize) colStart = gridSize - IMAGE_BLOCK_SIZE;

  const rowEnd = rowStart + IMAGE_BLOCK_SIZE - 1;
  const colEnd = colStart + IMAGE_BLOCK_SIZE - 1;

  return { rowStart, colStart, rowEnd, colEnd };
}

/**
 * Checks if placing `word` from (row,col) along `path` would overlap
 * the blank region. If yes, returns false. Also checks grid bounds & conflicts.
 */
function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  path: Direction,
  blankRegion: { rowStart: number; colStart: number; rowEnd: number; colEnd: number }
) {
  let r = row;
  let c = col;
  for (let i = 0; i < word.length; i++) {
    // Out of bounds?
    if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) return false;

    // Check blank region
    if (
      r >= blankRegion.rowStart &&
      r <= blankRegion.rowEnd &&
      c >= blankRegion.colStart &&
      c <= blankRegion.colEnd
    ) {
      // Trying to place a letter in the blank region => fail
      return false;
    }

    // Cell conflict?
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;

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
 * Generate the puzzle with words placed horizontally, vertically, diagonally,
 * excluding the blank region entirely.
 */
function generatePuzzle(
  words: string[],
  imagePosition: ImagePosition
): {
  grid: string[][];
  answers: Record<string, [number, number][]>;
} {
  const maxWordLength = Math.max(...words.map((w) => w.length));
  // Increase puzzle size as needed
  const gridSize = Math.max(15, maxWordLength + 5);
  const grid = createEmptyGrid(gridSize);
  const answers: Record<string, [number, number][]> = {};

  // Compute the blank region once
  const blankRegion = getBlankRegion(gridSize, imagePosition);

  for (const word of words) {
    let placed = false;
    let tries = 0;

    while (!placed && tries++ < 300) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);

      if (canPlace(grid, word, row, col, dir, blankRegion)) {
        answers[word] = placeWord(grid, word, row, col, dir);
        placed = true;
      }
    }
  }

  // Fill in empty cells with random letters (excluding blank region)
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // If in blank region, skip
      if (
        r >= blankRegion.rowStart &&
        r <= blankRegion.rowEnd &&
        c >= blankRegion.colStart &&
        c <= blankRegion.colEnd
      ) {
        grid[r][c] = '';
        continue;
      }

      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, answers };
}

// =========== POSITIONING HELPER ===========
function getPositionClasses(pos: ImagePosition) {
  switch (pos) {
    case 'middle':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'bottom-left':
      return 'bottom-0 left-0';
    case 'bottom-right':
      return 'bottom-0 right-0';
    case 'top-left':
      return 'top-0 left-0';
    case 'top-right':
      return 'top-0 right-0';
  }
}

// =========== MAIN COMPONENT ===========
 const MultiWordPuzzleGeneratorMedium = () => {
  const [isClient, setIsClient] = useState(false);

  // Puzzle data
  const [words, setWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<Record<string, [number, number][]>>({});

  // Image data
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>('bottom-right');

  // Display
  const [showAnswers, setShowAnswers] = useState(false);
  const [printMode, setPrintMode] = useState<'puzzle' | 'answer'>('puzzle');

  // On mount (client only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Avoid hydration mismatch
  if (!isClient) return null;

  // Word list input
  const handleWordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const list = e.target.value
      .split('\n')
      .map((w) => w.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, MAX_WORDS);
    setWords(list);
  };

  // Single image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
    } else {
      setImageSrc(null);
    }
  };

  // Generate puzzle
  const handleGenerate = () => {
    const { grid, answers } = generatePuzzle(words, imagePosition);
    setGrid(grid);
    setAnswers(answers);
    setShowAnswers(false);
  };

  // Print puzzle or answers
  const handlePrint = (mode: 'puzzle' | 'answer') => {
    setPrintMode(mode);
    // If printing answers, showAnswers is true
    setShowAnswers(mode === 'answer');
    // Wait briefly before triggering print
    setTimeout(() => window.print(), 100);
  };

  // Color the answer cells
  const getCellColor = (row: number, col: number) => {
    if (!showAnswers || printMode !== 'answer') return '';
    const entries = Object.entries(answers);
    for (let i = 0; i < entries.length; i++) {
      const [, positions] = entries[i];
      if (positions.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return '';
  };

  return (
    <>
      {/* Print styling for A4 landscape */}
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
        }
      `}</style>

      <div className="p-4 w-full max-w-[1400px] mx-auto">
        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Word input */}
          <div className="md:w-1/2">
            <textarea
              placeholder="Enter up to 20 words, one per line"
              className="border p-2 w-full h-40"
              onChange={handleWordChange}
            />
            <p className="text-sm text-gray-500">
              Words added: {words.length} / {MAX_WORDS}
            </p>
          </div>

          {/* Image upload and position */}
          <div className="md:w-1/2 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border p-2 w-full"
            />
            <label className="block text-sm font-medium">Image Position:</label>
            <select
              value={imagePosition}
              onChange={(e) => setImagePosition(e.target.value as ImagePosition)}
              className="border p-2"
            >
              <option value="middle">Middle</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="my-4 flex flex-wrap gap-4">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate Puzzle
          </button>
          <button
            onClick={() => handlePrint('answer')}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Print Answers
          </button>
          <button
            onClick={() => handlePrint('puzzle')}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Print Puzzle
          </button>
        </div>

        {/* Printable area */}
        <div id="printable-area" className="w-full font-kids">
          <h2 className="font-bold text-2xl underline text-center mb-4">
            Find the words in the puzzle!
          </h2>

          <div className="relative w-full flex justify-center">
            {/* Puzzle + Image */}
            <div className="relative">
              {/* The puzzle table */}
              <table className="border border-black border-collapse mx-auto">
                <tbody>
                  {grid.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          // Example cell size. Adjust as needed.
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

              {/* Position the image if it exists */}
              {imageSrc && (
  <div
    className={`absolute ${getPositionClasses(
      imagePosition
    )} w-[150px] h-[180px] flex items-center justify-center`}
  >
    {/* You can pick any width/height for the image to 
        leave space around it or fill the container. */}
    <Image
      src={imageSrc}
      alt="Puzzle Image"
      width={360}
      height={160}
      className="object-contain"
    />
  </div>
)}

            </div>
          </div>

          {/* Word list checkboxes (only in puzzle mode) */}
          {printMode === 'puzzle' && words.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center font-kids">
              {words.map((word) => (
                <label key={word} className="flex items-center gap-1">
                  <input type="checkbox" />
                  <span className="font-semibold">{word}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MultiWordPuzzleGeneratorMedium;