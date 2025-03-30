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
import GraphemeSplitter from 'grapheme-splitter';

/* --------------------------------------------
   1) Split the word into grapheme clusters and merge vowel signs
      so that vowels are attached to the preceding consonant.
-------------------------------------------- */
function splitIntoGraphemes(str: string): string[] {
  const splitter = new GraphemeSplitter();
  // Initial split into grapheme clusters
  const clusters = splitter.splitGraphemes(str);
  // Define the Bangla vowel signs that should merge with the previous cluster
  const vowelSigns = new Set(['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ']);

  const merged: string[] = [];
  for (let i = 0; i < clusters.length; i++) {
    // If the current cluster is a vowel sign and there's a previous cluster, merge it.
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
const DIRECTIONS = [
  [-1, 0],  // Up
  [1, 0],   // Down
  [0, -1],  // Left
  [0, 1],   // Right
  [-1, -1], // Up-Left
  [-1, 1],  // Up-Right
  [1, -1],  // Down-Left
  [1, 1],   // Down-Right
];

/* --------------------------------------------
   4) Check if a word can be placed in the grid using grapheme clusters
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
    // Check bounds
    if (r < 0 || r >= size || c < 0 || c >= size) {
      return false;
    }
    // If a cell is not empty and does not match, placement fails
    if (grid[r][c] !== '' && grid[r][c] !== graphemes[i]) {
      return false;
    }
  }
  return true;
}

/* --------------------------------------------
   5) Place the word in the grid (using grapheme clusters)
-------------------------------------------- */
function placeWord(
  grid: string[][],
  graphemes: string[],
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number
) {
  for (let i = 0; i < graphemes.length; i++) {
    const r = startRow + i * dRow;
    const c = startCol + i * dCol;
    grid[r][c] = graphemes[i];
  }
}

/* --------------------------------------------
   6) Generate the puzzle:
       - Split the Bangla word into desired grapheme clusters
       - Place the word 3–10 times in random directions/positions
       - Fill remaining cells with random Bangla letters
-------------------------------------------- */
function generatePuzzle(
  word: string,
  gridSize = 12
): string[][] {
  const grid = createEmptyGrid(gridSize);

  // Split the word into proper grapheme clusters (e.g., "বিড়াল" -> ["বি", "ড়া", "ল"])
  const graphemes = splitIntoGraphemes(word);

  // Decide how many times to place the word (3-10 times)
  const times = Math.floor(Math.random() * 8) + 3;

  for (let count = 0; count < times; count++) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    while (!placed && attempts < maxAttempts) {
      attempts++;
      // Pick a random direction and starting point
      const [dRow, dCol] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      if (canPlaceWord(grid, graphemes, startRow, startCol, dRow, dCol)) {
        placeWord(grid, graphemes, startRow, startCol, dRow, dCol);
        placed = true;
      }
    }
  }

  // Fill empty cells with random Bangla letters
  const banglaAlphabets = 'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        const idx = Math.floor(Math.random() * banglaAlphabets.length);
        grid[r][c] = banglaAlphabets[idx];
      }
    }
  }

  return grid;
}

/* --------------------------------------------
   7) The main component: WordPuzzleGenerator
-------------------------------------------- */
const WordPuzzleGenerator: React.FC = () => {
  const [word, setWord] = useState('');
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [puzzle, setPuzzle] = useState<string[][]>([]);
 

  // Handle image file input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate the puzzle when user clicks the button
  const handleGenerate = () => {
    if (!word) return;
    // For Bangla text, toUpperCase() or toLowerCase() have no effect,
    // but the conversion remains for consistency.
    const newPuzzle = generatePuzzle(word, 12);
    setPuzzle(newPuzzle);
  };

  // Handle print action (prints only the puzzle area)
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Global print styles: only the area with id "printable-area" is visible */}
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
          <CardTitle>Word Puzzle Generator (Bangla)</CardTitle>
          <CardDescription>
            Enter a Bangla word, add an image, and generate a puzzle. The word&apos;s vowels will stay attached to their corresponding consonants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Word Input */}
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              placeholder="Enter a Bangla word (e.g. বিড়াল)"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>

        
          {/* Image Input */}
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-2">
            <Button onClick={handleGenerate}>Generate Puzzle</Button>
            <Button variant="secondary" onClick={handlePrint}>
              Print Puzzle
            </Button>
          </div>

          {/* Puzzle and Image Display Area */}
          <div id="printable-area">
            {puzzle.length > 0 && (
              <div className="overflow-x-auto">
                <CardTitle className="text-center text-2xl text-amber-400 pt-10">
                  দেখি তুমি কতবার &quot;{word}&quot; খুজে বের করতে পার।
                </CardTitle>
                <div>
                {imageURL && (
              <div className="mt-4 text-center flex  justify-center items-center gap-10">
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
              </div>
            )}
                </div>
               <div className='flex justify-center items-center gap-3'>
                <div>
                {imageURL && (
              <div className="mt-4 text-center flex flex-col justify-center items-center gap-10">
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
              </div>
            )}
                </div>
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
                <div>
                {imageURL && (
              <div className="mt-4 text-center flex flex-col justify-center items-center gap-5">
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
              </div>
            )}
                </div>
               </div>
              </div>
            )}

            {imageURL && (
              <div className="mt-4 text-center flex justify-center items-center gap-10">
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
                />
                <Image
                  src={imageURL}
                  alt="Puzzle Illustration"
                  className="inline-block max-h-20"
                  height={60}
                  width={60}
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
