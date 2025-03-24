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

/* --------------------------------------------
   1) Define a function to create and fill the grid
-------------------------------------------- */
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

/* --------------------------------------------
   2) Possible directions for placement
      Each direction is (dRow, dCol)
-------------------------------------------- */
const DIRECTIONS = [
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
   3) Check if a word can be placed in grid
      starting at (row, col) in the given direction.
      We allow overlapping if letters match.
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
    // Out of bounds?
    if (r < 0 || r >= size || c < 0 || c >= size) {
      return false;
    }
    // Collision check: either empty or matching letter
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
      return false;
    }
  }
  return true;
}

/* --------------------------------------------
   4) Place the word in the grid
      (Assumes canPlaceWord has returned true)
-------------------------------------------- */
function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number
) {
  for (let i = 0; i < word.length; i++) {
    const r = startRow + i * dRow;
    const c = startCol + i * dCol;
    grid[r][c] = word[i];
  }
}

/* --------------------------------------------
   5) Generate puzzle with multiple placements
      - Randomly place the same word 3–10 times
      - Directions: horizontal, vertical, diagonal (all 8)
      - Collision checks
      - Fill empty cells with random letters (upper or lower)
-------------------------------------------- */
function generatePuzzle(
  word: string,
  gridSize = 12,
  isUppercase = true
): string[][] {
  const grid = createEmptyGrid(gridSize);

  // Decide how many times to place the word (3-10)
  const times = Math.floor(Math.random() * 8) + 3; // random in [3..10]

  for (let count = 0; count < times; count++) {
    // Attempt placement up to X tries
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      // Pick a random direction
      const [dRow, dCol] = DIRECTIONS[
        Math.floor(Math.random() * DIRECTIONS.length)
      ];
      // Pick a random start
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      if (canPlaceWord(grid, word, startRow, startCol, dRow, dCol)) {
        placeWord(grid, word, startRow, startCol, dRow, dCol);
        placed = true;
      }
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        // A-Z or a-z
        const charCode = 65 + Math.floor(Math.random() * 26); // 'A'
        const letter = String.fromCharCode(charCode);
        grid[r][c] = isUppercase ? letter : letter.toLowerCase();
      }
    }
  }

  return grid;
}

const WordPuzzleGenerator: React.FC = () => {
  const [word, setWord] = useState('');
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [puzzle, setPuzzle] = useState<string[][]>([]);
  const [letterCase, setLetterCase] = useState<'uppercase' | 'lowercase'>(
    'uppercase'
  );

  // Handle image file input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to data URL
    const reader = new FileReader();
    reader.onload = () => {
      setImageURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate the puzzle
  const handleGenerate = () => {
    if (!word) return;

    // Convert the user's word to uppercase or lowercase
    const finalWord =
      letterCase === 'uppercase' ? word.toUpperCase() : word.toLowerCase();

    const newPuzzle = generatePuzzle(
      finalWord,
      12,
      letterCase === 'uppercase'
    );
    setPuzzle(newPuzzle);
  };

  // Print only the puzzle area
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print styles: only #printable-area is visible in print */}
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
            Enter a word, choose uppercase or lowercase, add an image, and
            generate a puzzle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Inputs */}
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              placeholder="Enter a word (e.g. 'ant')"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleGenerate}>Generate Puzzle</Button>
            <Button variant="secondary" onClick={handlePrint}>
              Print Puzzle
            </Button>
          </div>

          {/* The Printable Area */}
          <div id="printable-area">
          
            {/* Display the Puzzle */}
            {puzzle.length > 0 && (
              <div className="overflow-x-auto">
                <CardTitle className='text-center text-2xl text-amber-400'>See how many times you can find word "{word}''.</CardTitle>
                <table className="mx-auto my-4 border-collapse">
                  <tbody>
                    {puzzle.map((row, rowIndex) => (
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
            )}

            {/* Display the Uploaded Image (if any) */}
            {imageURL && (
              <div className="mt-4 text-center">
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={20}
                  width={20}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default WordPuzzleGenerator;
