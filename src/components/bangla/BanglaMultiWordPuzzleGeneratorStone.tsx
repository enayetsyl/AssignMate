'use client';

import React, { useEffect, useState } from 'react';
import GraphemeSplitter from 'grapheme-splitter';

// ======= CONSTANTS & TYPES =======
const MAX_WORDS = 20;

// Directions: horizontal, vertical, diagonal down-right, diagonal up-right
export type Direction = number[][];
export const DIRECTIONS: Direction[] = [
  [[0, 1]],   // অনুভূমিক (ডানে)
  [[1, 0]],   // উল্লম্ব (নিচে)
  [[1, 1]],   // তির্যক (নিচে-ডানে)
  [[-1, 1]],  // তির্যক (উপরে-ডানে)
];

const COLORS = [
  'bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-pink-200',
  'bg-purple-200', 'bg-orange-200', 'bg-teal-200', 'bg-cyan-200', 'bg-amber-200',
];

// ======= PUZZLE HELPER FUNCTIONS =======

// Create an empty grid of size x size
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

// Split a Bangla word into grapheme clusters, merging vowel signs with preceding consonants
function splitIntoGraphemes(str: string): string[] {
  const splitter = new GraphemeSplitter();
  const clusters = splitter.splitGraphemes(str);

  // Merge vowel signs (e.g. "া", "ি") with the preceding cluster
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

/**
 * Check if a word (as grapheme clusters) can be placed at (row, col) along a path
 */
function canPlaceGraphemes(
  grid: string[][],
  graphemes: string[],
  row: number,
  col: number,
  path: Direction
): boolean {
  let r = row, c = col;
  for (let i = 0; i < graphemes.length; i++) {
    // Out of bounds?
    if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) return false;

    // Conflict?
    if (grid[r][c] !== '' && grid[r][c] !== graphemes[i]) return false;

    // Move to next cell along the path
    const [dr, dc] = path[i % path.length];
    r += dr;
    c += dc;
  }
  return true;
}

/**
 * Place the grapheme array in the grid and record the positions
 */
function placeGraphemes(
  grid: string[][],
  graphemes: string[],
  row: number,
  col: number,
  path: Direction
): [number, number][] {
  let r = row, c = col;
  const positions: [number, number][] = [];

  for (let i = 0; i < graphemes.length; i++) {
    grid[r][c] = graphemes[i];
    positions.push([r, c]);

    // Move to next cell along the path
    const [dr, dc] = path[i % path.length];
    r += dr;
    c += dc;
  }
  return positions;
}

/**
 * Generate a puzzle: place each Bangla word (as grapheme clusters)
 * horizontally, vertically, or diagonally. Fill empty cells with random Bangla letters.
 */
function generatePuzzle(words: string[]): {
  grid: string[][]; 
  answers: Record<string, [number, number][]>;
} {
  // Calculate maximum length in grapheme clusters
  const maxLength = Math.max(...words.map((w) => splitIntoGraphemes(w).length));
  // Minimum size 15, plus 5 extra
  const gridSize = Math.max(15, maxLength + 5);
  const grid = createEmptyGrid(gridSize);
  const answers: Record<string, [number, number][]> = {};

  for (const word of words) {
    const graphemes = splitIntoGraphemes(word);
    let placed = false;
    let tries = 0;

    while (!placed && tries++ < 300) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);

      if (canPlaceGraphemes(grid, graphemes, row, col, dir)) {
        answers[word] = placeGraphemes(grid, graphemes, row, col, dir);
        placed = true;
      }
    }
  }

  // Fill empty cells with random Bangla letters
  const banglaAlphabets = 'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!grid[r][c]) {
        const idx = Math.floor(Math.random() * banglaAlphabets.length);
        grid[r][c] = banglaAlphabets[idx];
      }
    }
  }

  return { grid, answers };
}

// ======= সুপার হার্ড পাজল কম্পোনেন্ট =======
const BanglaMultiWordPuzzleGeneratorStone: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<Record<string, [number, number][]>>({});
  const [printMode, setPrintMode] = useState<'question' | 'answer'>('question');
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;

  // Collect Bangla words from user input (no uppercase conversion)
  const handleWordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const list = e.target.value
      .split('\n')
      .map((w) => w.trim()) // Keep them as-is (Bangla)
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

  const handlePrint = (mode: 'question' | 'answer') => {
    setPrintMode(mode);
    setShowAnswers(mode === 'answer');
    setTimeout(() => window.print(), 100);
  };

  // Highlight the cells for answers in 'answer' mode
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
    <div className="p-4 max-w-[1400px] mx-auto">
      {/* কন্ট্রোলস */}
      <div className="flex flex-col gap-4">
        <textarea
          placeholder="প্রতি লাইনে ২০ টা পর্যন্ত বাংলা শব্দ লিখুন"
          className="border p-2 w-full h-40"
          onChange={handleWordChange}
        />
        <p className="text-sm text-gray-500">
          যোগ করা শব্দ: {words.length} / {MAX_WORDS}
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            পাজল তৈরি করুন
          </button>
          <button
            onClick={() => handlePrint('question')}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            প্রশ্ন প্রিন্ট করুন
          </button>
          <button
            onClick={() => handlePrint('answer')}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            উত্তর প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* প্রিন্টের জন্য এলাকা */}
      <div id="printable-area" className="mt-4">
        <h2 className="font-bold text-2xl text-center mb-4">
          পাজলে শব্দগুলো খুঁজে বের করুন!
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
      </div>

      {/* গ্লোবাল প্রিন্ট স্টাইলিং */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0; /* অথবা 0.2cm */
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
            transform: scale(0.9);
            transform-origin: top left;
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

export default BanglaMultiWordPuzzleGeneratorStone;
