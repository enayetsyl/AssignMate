'use client';
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { TEXT_COLORS } from '@/constant';

const BENGALI_ALPHABET = 'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়ৎংঃঁ';

// Fixed grid dimensions: 6 rows × 9 columns = 54 cells.
const NUM_ROWS = 6;
const NUM_COLS = 9;

// Utility: Returns a random integer between min and max, inclusive.
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface Cell {
  letter: string;      
  colorClass: string; 
}

type Difficulty = 'easy' | 'medium' | 'hard';

const FillInBengaliLetterTable: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  // Generate a set of random blank indices among the Bengali letter cells (0 to 29).
  const getBlankIndices = (numBlanks: number): Set<number> => {
    const indices = Array.from(Array(BENGALI_ALPHABET.length).keys());
    // Shuffle the indices array.
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return new Set(indices.slice(0, numBlanks));
  };

  // Generate the puzzle grid based on the difficulty.
  const handleGenerate = () => {
    let numBlanks: number;
    if (difficulty === 'easy') {
      numBlanks = randomInt(5, 10);
    } else if (difficulty === 'medium') {
      numBlanks = randomInt(11, 20);
    } else {
      numBlanks = randomInt(20, 35);
    }
    const blankIndices = getBlankIndices(numBlanks);
    const newGrid: Cell[][] = [];

    // For each cell in the grid, fill the first 30 cells with sequential Bengali letters
    // (unless the cell's index is in the blankIndices set, in which case leave it blank).
    for (let r = 0; r < NUM_ROWS; r++) {
      const rowData: Cell[] = [];
      for (let c = 0; c < NUM_COLS; c++) {
        const cellIndex = r * NUM_COLS + c;
        let letter = '';
        // Only fill cell if it falls within our Bengali alphabet (30 cells).
        if (cellIndex < BENGALI_ALPHABET.length) {
          if (!blankIndices.has(cellIndex)) {
            letter = BENGALI_ALPHABET.charAt(cellIndex);
          }
        }
        const colorClass =
          TEXT_COLORS[Math.floor(Math.random() * TEXT_COLORS.length)];
        rowData.push({ letter, colorClass });
      }
      newGrid.push(rowData);
    }
    setGrid(newGrid);
  };

  // Print the puzzle. The CSS forces the printable area to occupy a full A4 page.
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Global print styling for A4 portrait with zero margins */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          /* Hide all content except the printable page. */
          body * {
            visibility: hidden !important;
          }
          #printable-page,
          #printable-page * {
            visibility: visible !important;
          }
          #printable-page {
            position: absolute;
            top: 0;
            left: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>

      {/* Title and options */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Fill in the Missing Bengali Letters
        </h1>
        <div className="flex justify-center items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setDifficulty(e.target.value as Difficulty)
              }
              className="select select-bordered"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <Button onClick={handleGenerate}>Generate Puzzle</Button>
        </div>
      </div>

      {grid.length > 0 && (
        <>
          {/* Printable page container */}
          <div
            id="printable-page"
            className="relative border border-gray-300"
            style={{
              width: '210mm',
              height: '297mm',
              margin: '0 auto',
              backgroundColor: '#fff',
            }}
          >
            {/* Title area at the top (fixed height) */}
            <div
              className="text-center font-bold text-xl"
              style={{
                height: '30mm',
                lineHeight: '30mm',
                borderBottom: '1px solid #000',
              }}
            >
              Fill in the Missing Bengali Letters
            </div>
            {/* Puzzle area fills the remainder of the page */}
            <div
              className="w-full h-full"
              style={{
                height: 'calc(100% - 40mm)',
              }}
            >
              <div
                className="inline-grid w-full h-full"
                style={{
                  gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${NUM_ROWS}, 1fr)`,
                }}
              >
                {grid.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="flex items-center justify-center border border-gray-300 text-4xl font-bold"
                    >
                      {cell.letter ? (
                        <span className={cell.colorClass}>{cell.letter}</span>
                      ) : (
                        <span className="text-gray-400"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Print button */}
          <div className="mt-4 flex justify-center">
            <Button onClick={handlePrint}>Print Puzzle</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FillInBengaliLetterTable;
