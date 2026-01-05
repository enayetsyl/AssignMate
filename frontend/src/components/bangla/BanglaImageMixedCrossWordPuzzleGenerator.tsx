'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { splitIntoGraphemes } from '@/lib/bangla-utils';

const GRID_SIZE = 16;

// Basic puzzle models
interface PuzzleInput {
  id: number;
  imageUrl: string | null;
  word: string; 
}

interface PuzzleFinal extends PuzzleInput {
  number: number;
  orientation: 'horizontal' | 'vertical';
  startRow: number;
  startCol: number;
  graphemes: string[];
}

// Create an empty 16x16 grid for letters
function createEmptyGrid(): string[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
}

// Create a parallel grid that tracks puzzle numbers for each cell
function createEmptyPuzzleNumbersGrid(): number[][][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => [])
  );
}

// Create a grid to track coverage: true if any puzzle occupies that cell
function createEmptyCoverageGrid(): boolean[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );
}

function canPlaceWord(
  grid: string[][],
  graphemes: string[],
  row: number,
  col: number,
  orientation: 'horizontal' | 'vertical'
): boolean {
  for (let i = 0; i < graphemes.length; i++) {
    let r = row, c = col;
    if (orientation === 'horizontal') c += i;
    else r += i;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    if (grid[r][c] !== '' && grid[r][c] !== graphemes[i]) return false;
  }
  return true;
}

/**
 * Place the word in the grid.
 * - For every cluster, mark the coverageGrid to color the cell white.
 * - Only push the puzzle number into puzzleNumbersGrid for the first cluster (i === 0).
 */
function placeWordInGrid(
  grid: string[][],
  puzzleNumbersGrid: number[][][],
  coverageGrid: boolean[][],
  graphemes: string[],
  puzzleNumber: number,
  row: number,
  col: number,
  orientation: 'horizontal' | 'vertical'
) {
  for (let i = 0; i < graphemes.length; i++) {
    let r = row, c = col;
    if (orientation === 'horizontal') c += i;
    else r += i;
    grid[r][c] = graphemes[i];
    // Mark every cell as covered
    coverageGrid[r][c] = true;
    // Only label the first cell with the puzzle number
    if (i === 0) {
      puzzleNumbersGrid[r][c].push(puzzleNumber);
    }
  }
}

/** 
  Attempt to place via overlap with an existing cluster.
*/
function tryPlaceWithOverlap(
  grid: string[][],
  graphemes: string[],
  orientation: 'horizontal' | 'vertical'
): { row: number; col: number } | null {
  for (let i = 0; i < graphemes.length; i++) {
    const cluster = graphemes[i];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === cluster) {
          let startRow = r, startCol = c;
          if (orientation === 'horizontal') startCol = c - i;
          else startRow = r - i;
          if (canPlaceWord(grid, graphemes, startRow, startCol, orientation)) {
            return { row: startRow, col: startCol };
          }
        }
      }
    }
  }
  return null;
}

/** 
  Attempt to place the word in a random new spot.
*/
function tryPlaceAsNewCluster(
  grid: string[][],
  graphemes: string[],
  orientation: 'horizontal' | 'vertical'
): { row: number; col: number } | null {
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (orientation === 'horizontal') {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * (GRID_SIZE - graphemes.length + 1));
      if (canPlaceWord(grid, graphemes, row, col, orientation)) {
        return { row, col };
      }
    } else {
      const col = Math.floor(Math.random() * GRID_SIZE);
      const row = Math.floor(Math.random() * (GRID_SIZE - graphemes.length + 1));
      if (canPlaceWord(grid, graphemes, row, col, orientation)) {
        return { row, col };
      }
    }
  }
  return null;
}

const BanglaImageMixedCrossWordPuzzleGenerator: React.FC = () => {
  const [puzzles, setPuzzles] = useState<PuzzleInput[]>([
    { id: 1, imageUrl: null, word: '' },
  ]);
  const [finalPuzzles, setFinalPuzzles] = useState<PuzzleFinal[]>([]);

  const handleImageUpload = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPuzzles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, imageUrl: url } : p))
      );
    }
  };

  const handleWordChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // No .toUpperCase() for Bangla
    setPuzzles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, word: value } : p))
    );
  };

  const addPuzzle = () => {
    if (puzzles.length < 10) {
      const newId = Math.max(...puzzles.map((p) => p.id)) + 1;
      setPuzzles([...puzzles, { id: newId, imageUrl: null, word: '' }]);
    }
  };

  const removePuzzle = (id: number) => {
    setPuzzles(puzzles.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validations
    for (const puzzle of puzzles) {
      if (!puzzle.imageUrl || !puzzle.word) {
        alert('প্রত্যেক পাজলের জন্য ছবি ও শব্দ উভয়ই প্রয়োজন।');
        return;
      }
      if (puzzle.word.length > GRID_SIZE) {
        alert(`শব্দের দৈর্ঘ্য ${GRID_SIZE} অক্ষরের বেশি হতে পারবেনা।`);
        return;
      }
    }

    const newGrid = createEmptyGrid();
    const puzzleNumbersGrid = createEmptyPuzzleNumbersGrid();
    const coverageGrid = createEmptyCoverageGrid();
    const placedPuzzles: PuzzleFinal[] = [];

    puzzles.forEach((puzzle, index) => {
      const graphemes = splitIntoGraphemes(puzzle.word);
      const orientation: 'horizontal' | 'vertical' =
        index % 2 === 0 ? 'horizontal' : 'vertical';
      let placed = false;
      let startRow = 0, startCol = 0;

      if (index === 0) {
        // Attempt center for first puzzle
        if (orientation === 'horizontal') {
          startRow = Math.floor(GRID_SIZE / 2);
          startCol = Math.max(0, Math.floor((GRID_SIZE - graphemes.length) / 2));
        } else {
          startCol = Math.floor(GRID_SIZE / 2);
          startRow = Math.max(0, Math.floor((GRID_SIZE - graphemes.length) / 2));
        }

        if (!canPlaceWord(newGrid, graphemes, startRow, startCol, orientation)) {
          const freshPos = tryPlaceAsNewCluster(newGrid, graphemes, orientation);
          if (!freshPos) {
            alert(`"${puzzle.word}" শব্দটি স্থাপন করা যাচ্ছে না।`);
            return;
          }
          startRow = freshPos.row;
          startCol = freshPos.col;
        }
        placeWordInGrid(newGrid, puzzleNumbersGrid, coverageGrid, graphemes, index + 1, startRow, startCol, orientation);
        placed = true;
      } else {
        const overlapPos = tryPlaceWithOverlap(newGrid, graphemes, orientation);
        if (overlapPos) {
          startRow = overlapPos.row;
          startCol = overlapPos.col;
          placeWordInGrid(newGrid, puzzleNumbersGrid, coverageGrid, graphemes, index + 1, startRow, startCol, orientation);
          placed = true;
        } else {
          const freshPos = tryPlaceAsNewCluster(newGrid, graphemes, orientation);
          if (freshPos) {
            startRow = freshPos.row;
            startCol = freshPos.col;
            placeWordInGrid(newGrid, puzzleNumbersGrid, coverageGrid, graphemes, index + 1, startRow, startCol, orientation);
            placed = true;
          }
        }
      }

      if (!placed) {
        alert(`"${puzzle.word}" শব্দটি স্থাপন করা যাচ্ছে না।`);
        return;
      }

      placedPuzzles.push({
        ...puzzle,
        number: index + 1,
        orientation,
        startRow,
        startCol,
        graphemes,
      });
    });

    setFinalPuzzles(placedPuzzles);
  };

  // Render the final grid with proper coloring and labels
  const renderGrid = () => {
    const finalGrid = createEmptyGrid();
    const puzzleNumbersGrid = createEmptyPuzzleNumbersGrid();
    const coverageGrid = createEmptyCoverageGrid();

    // Re-place each puzzle in finalGrid, puzzleNumbersGrid and mark coverage
    finalPuzzles.forEach((puzzle) => {
      puzzle.graphemes.forEach((cluster, i) => {
        let r = puzzle.startRow;
        let c = puzzle.startCol;
        if (puzzle.orientation === 'horizontal') c += i;
        else r += i;
        finalGrid[r][c] = cluster;
        coverageGrid[r][c] = true;
        // Only label the leading cell
        if (i === 0) {
          puzzleNumbersGrid[r][c].push(puzzle.number);
        }
      });
    });

    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let bgColor = 'bg-gray-300';
        if (coverageGrid[r][c]) {
          bgColor = 'bg-white';
        }
        const cellNumbers = puzzleNumbersGrid[r][c];
        const cellContent = cellNumbers.length > 0 ? cellNumbers.join(',') : '';

        cells.push(
          <div
            key={`${r}-${c}`}
            className={`w-10 h-10 border border-gray-700 flex items-center justify-center text-lg ${bgColor} text-center`}
          >
            {cellContent}
          </div>
        );
      }
    }

    return (
      <div
        className="mt-4 gap-0"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, auto)` }}
      >
        {cells}
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const horizontalPuzzles = finalPuzzles.filter(
    (p) => p.orientation === 'horizontal'
  );
  const verticalPuzzles = finalPuzzles.filter(
    (p) => p.orientation === 'vertical'
  );

  return (
    <div className="container mx-auto p-4">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
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

      <h1 className="text-2xl font-bold mb-4">
        মিশ্র ওরিয়েন্টেশন পাজল (মাল্টিপল নম্বর সহ)
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">
              পাজল #{index + 1}
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-start gap-6">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">
                  ছবি আপলোড করুন:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(puzzle.id, e)}
                  className="border p-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">
                  শব্দ (বাংলায়):
                </label>
                <input
                  type="text"
                  value={puzzle.word}
                  onChange={(e) => handleWordChange(puzzle.id, e)}
                  className="border p-1"
                  placeholder="যেমন: কুকুর"
                />
              </div>
            </div>
            {puzzles.length > 1 && (
              <button
                type="button"
                onClick={() => removePuzzle(puzzle.id)}
                className="text-red-500 text-sm mt-2"
              >
                সরান
              </button>
            )}
          </div>
        ))}

        {puzzles.length < 10 && (
          <button
            type="button"
            onClick={addPuzzle}
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            পাজল যোগ করুন
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          পাজল তৈরি করুন
        </button>
      </form>

      {finalPuzzles.length > 0 && (
        <div id="printable-area" className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            সঠিক বাক্সে ছবির নাম লিখুন
          </h2>

          {horizontalPuzzles.length > 0 && (
            <div className="flex flex-row flex-wrap justify-center gap-4 mb-4">
              {horizontalPuzzles.map((puzzle) => (
                <div
                  key={puzzle.id}
                  className="border rounded flex flex-row items-center gap-2 p-2"
                >
                  <h3 className="bold border-2 rounded-full border-black px-2">
                    {puzzle.number}
                  </h3>
                  {puzzle.imageUrl && (
                    <Image
                      src={puzzle.imageUrl}
                      alt={`পাজল ${puzzle.number}`}
                      width={80}
                      height={80}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-row w-full gap-4">
            <div className="flex-grow">{renderGrid()}</div>
            {verticalPuzzles.length > 0 && (
              <div className="flex flex-col gap-4 items-center justify-start">
                {verticalPuzzles.map((puzzle) => (
                  <div
                    key={puzzle.id}
                    className="border rounded flex flex-col items-center gap-2 p-2"
                  >
                    <h3 className="bold border-2 rounded-full border-black px-2">
                      {puzzle.number}
                    </h3>
                    {puzzle.imageUrl && (
                      <Image
                        src={puzzle.imageUrl}
                        alt={`পাজল ${puzzle.number}`}
                        width={80}
                        height={80}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {finalPuzzles.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePrint}
            className="bg-indigo-500 text-white py-2 px-4 rounded"
          >
            পাজল প্রিন্ট করুন
          </button>
        </div>
      )}
    </div>
  );
};

export default BanglaImageMixedCrossWordPuzzleGenerator;
