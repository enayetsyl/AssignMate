'use client';
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {  TEXT_COLORS } from '@/constant';

// Fixed grid dimensions: 5 rows x 6 columns = 30 cells.
const NUM_ROWS = 5;
const NUM_COLS = 6;

// Helper: Returns letter from A–Z in sequence (0 = A, 25 = Z).
const getSequentialLetter = (index: number): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabet.charAt(index % alphabet.length);
};

// Utility: Returns a random integer between min and max, inclusive.
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface Cell {
  letter: string;     // Either a letter or blank (empty string).
  colorClass: string; // Random color class.
}

type Difficulty = 'easy' | 'medium' | 'hard';

const FillInLetterTableSequential: React.FC = () => {
  // Puzzle grid state.
  const [grid, setGrid] = useState<Cell[][]>([]);
  // Letter case: "capital" or "small".
  const [letterCase, setLetterCase] = useState<'capital' | 'small'>('capital');
  // Difficulty level for blank count.
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  // Generate a set of random blank indices among the first 26 letter cells.
  const getBlankIndices = (numBlanks: number): Set<number> => {
    const indices = Array.from(Array(26).keys()); // [0,1,...,25]
    // Shuffle indices array.
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const blanks = indices.slice(0, numBlanks);
    return new Set(blanks);
  };

  // Generate the puzzle grid.
  const handleGenerate = () => {
    // Determine how many blanks to create based on difficulty.
    let numBlanks: number;
    if (difficulty === 'easy') {
      numBlanks = randomInt(5, 8);
    } else if (difficulty === 'medium') {
      numBlanks = randomInt(8, 12);
    } else {
      // hard mode.
      numBlanks = randomInt(12, 16);
    }
    const blankIndices = getBlankIndices(numBlanks);

    const newGrid: Cell[][] = [];
 
    for (let r = 0; r < NUM_ROWS; r++) {
      const rowData: Cell[] = [];
      for (let c = 0; c < NUM_COLS; c++) {
        const cellIndex = r * NUM_COLS + c;
        let letter = '';
        if (cellIndex < 26) {
          // For the first 26 cells, assign sequential letters unless chosen to blank.
          if (!blankIndices.has(cellIndex)) {
            const seqLetter = getSequentialLetter(cellIndex);
            letter = letterCase === 'small' ? seqLetter.toLowerCase() : seqLetter;
          }
        }
        // For cells >= 26, leave blank.
        const colorClass =
          TEXT_COLORS[Math.floor(Math.random() * TEXT_COLORS.length)];
        rowData.push({ letter, colorClass });
      }
      newGrid.push(rowData);
    }
    setGrid(newGrid);
  };

  // Print the puzzle. The CSS forces everything to be printed on one A4 page.
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
          /* Hide everything except #printable-page */
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
          Fill in the Missing Letters
        </h1>
        <div className="flex justify-center items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Letter Case:</span>
            <select
              value={letterCase}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setLetterCase(e.target.value as 'capital' | 'small')
              }
              className="select select-bordered"
            >
              <option value="capital">Capital</option>
              <option value="small">Small</option>
            </select>
          </div>
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
              // On screen, display a scaled preview (adjust as needed)
              width: '720px', // preview width (approx. half-scale)
              height: '1024px', // preview height (adjust to maintain ratio)
              margin: '0 auto',
              backgroundColor: '#fff',
            }}
          >
            {/* Title at the top */}
            <div
              className="text-center font-bold text-xl"
              style={{
                height: '40mm',
                lineHeight: '40mm',
                borderBottom: '1px solid #000',
              }}
            >
              Fill in the Missing Letters
            </div>
            {/* Puzzle area fills the rest of the page */}
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
                      className="flex items-center justify-center border border-gray-300 text-5xl font-bold"
                      
                    >
                      {cell.letter ? (
                        <span className={cell.colorClass}>{cell.letter}</span>
                      ) : (
                        <span ></span>
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

export default FillInLetterTableSequential;
