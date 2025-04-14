'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

type Operation = 'add' | 'multiply';
type Difficulty = 'easy' | 'medium' | 'hard';

interface PuzzleData {
  pyramid: number[][];
  firstRowColors: string[];
}

// Utility: Generate a random hex color.
function randomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Generates pyramid puzzle data:
 * - The first row is generated with random numbers based on difficulty:
 *    - Easy: 1–9
 *    - Medium: 10–99
 *    - Hard: 100–999
 * - Each subsequent row is computed by either adding or multiplying adjacent cells.
 * - Also returns an array of random colors (one per cell in the first row).
 *
 * @param op The chosen operation ("add" or "multiply")
 * @param difficulty The chosen difficulty ("easy", "medium", or "hard")
 * @param rowCount The number of cells in the first row (and total rows)
 * @returns An object containing the pyramid (a 2D number array) and an array of random colors.
 */
function generatePuzzleData(
  op: Operation,
  difficulty: Difficulty,
  rowCount: number
): PuzzleData {
  let min: number, max: number;
  if (difficulty === 'easy') {
    min = 1;
    max = 9;
  } else if (difficulty === 'medium') {
    min = 10;
    max = 99;
  } else {
    min = 100;
    max = 999;
  }

  const pyramid: number[][] = [];
  // Generate the first row with random numbers.
  const firstRow: number[] = Array.from(
    { length: rowCount },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
  pyramid.push(firstRow);

  // Generate random colors for each cell in the first row.
  const firstRowColors: string[] = Array.from(
    { length: rowCount },
    () => randomColor()
  );

  // Compute subsequent rows; each row has one less cell than the previous row.
  for (let r = 1; r < rowCount; r++) {
    const prevRow = pyramid[r - 1];
    const newRow: number[] = [];
    for (let i = 0; i < prevRow.length - 1; i++) {
      if (op === 'add') {
        newRow.push(prevRow[i] + prevRow[i + 1]);
      } else if (op === 'multiply') {
        newRow.push(prevRow[i] * prevRow[i + 1]);
      }
    }
    pyramid.push(newRow);
  }
  return { pyramid, firstRowColors };
}

const MathTrianglePuzzle: React.FC = () => {
  const [operation, setOperation] = useState<Operation>('add');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [rowCount, setRowCount] = useState<number>(5);
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  // New state for toggling final answer view
  const [showFinalAnswer, setShowFinalAnswer] = useState<boolean>(false);

  // Generate a new puzzle based on the selected operation, difficulty, and row count.
  const handleGenerate = () => {
    const newPuzzleData = generatePuzzleData(operation, difficulty, rowCount);
    setPuzzleData(newPuzzleData);
  };

  // Helper: Open a print window with the given content and A4 portrait settings.
  const openPrintWindow = (title: string, printContents: string) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups for this website.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: sans-serif; }
            .cell {
              width: 40px;
              height: 40px;
              border: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 2px;
              font-size: 16px;
            }
            .row { 
              display: flex;
              justify-content: center;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Print Puzzle View: Only the first row is filled (each with its random color)
  // and the final row is shown only if the user opts in.
  const handlePrintPuzzle = () => {
    let content = '<div>';
    if (puzzleData) {
      puzzleData.pyramid.forEach((row, rowIndex) => {
        content += '<div class="row">';
        row.forEach((cell, cellIndex) => {
          if (rowIndex === 0) {
            const color = puzzleData.firstRowColors[cellIndex] || '#000';
            content += `<div class="cell" style="color: ${color};">${cell}</div>`;
          } else if (
            rowIndex === puzzleData.pyramid.length - 1 &&
            showFinalAnswer
          ) {
            content += `<div class="cell">${cell}</div>`;
          } else {
            content += '<div class="cell"></div>';
          }
        });
        content += '</div>';
      });
    }
    content += '</div>';
    openPrintWindow('Print Puzzle', content);
  };

  // Print Answer View: Render the full pyramid.
  const handlePrintAnswer = () => {
    let content = '<div>';
    if (puzzleData) {
      puzzleData.pyramid.forEach((row, rowIndex) => {
        content += '<div class="row">';
        row.forEach((cell, cellIndex) => {
          if (rowIndex === 0) {
            const color = puzzleData.firstRowColors[cellIndex] || '#000';
            content += `<div class="cell" style="color: ${color};">${cell}</div>`;
          } else {
            content += `<div class="cell">${cell}</div>`;
          }
        });
        content += '</div>';
      });
    }
    content += '</div>';
    openPrintWindow('Print Answer', content);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Global A4 print styling */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
      `}</style>

      <h1 className="text-2xl font-bold mb-4 text-center">
        Math Triangle Puzzle
      </h1>

      {/* Controls */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        {/* Operation Selection */}
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="operation"
              value="add"
              checked={operation === 'add'}
              onChange={() => setOperation('add')}
              className="form-radio"
            />
            <span>Addition</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="operation"
              value="multiply"
              checked={operation === 'multiply'}
              onChange={() => setOperation('multiply')}
              className="form-radio"
            />
            <span>Multiplication</span>
          </label>
        </div>

        {/* Difficulty Selection */}
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="difficulty"
              value="easy"
              checked={difficulty === 'easy'}
              onChange={() => setDifficulty('easy')}
              className="form-radio"
            />
            <span>Easy</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="difficulty"
              value="medium"
              checked={difficulty === 'medium'}
              onChange={() => setDifficulty('medium')}
              className="form-radio"
            />
            <span>Medium</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="difficulty"
              value="hard"
              checked={difficulty === 'hard'}
              onChange={() => setDifficulty('hard')}
              className="form-radio"
            />
            <span>Hard</span>
          </label>
        </div>

        {/* First Row Cell Count */}
        <div className="flex items-center space-x-2">
          <span>Number of cells in first row:</span>
          <select
            value={rowCount}
            onChange={(e) => setRowCount(parseInt(e.target.value))}
            className="border p-1"
          >
            {[5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Show Final Answer Toggle */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showFinalAnswer}
            onChange={() => setShowFinalAnswer(!showFinalAnswer)}
            className="form-checkbox"
          />
          <span>Show Final Answer</span>
        </label>

        {/* Generate and Print Buttons */}
        <Button onClick={handleGenerate}>Generate Puzzle</Button>
        {puzzleData && (
          <div className="flex space-x-4">
            <Button onClick={handlePrintPuzzle}>Print Puzzle</Button>
            <Button onClick={handlePrintAnswer}>Print Answer</Button>
          </div>
        )}
      </div>

      {/* Display Puzzle (Puzzle View):
          - Always show the first row with its numbers (in random colors)
          - Only show final answer (last row) if "Show Final Answer" is checked */}
      {puzzleData && (
        <div className="flex flex-col items-center space-y-2">
          {puzzleData.pyramid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-2">
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className="w-10 h-10 border border-gray-400 flex items-center justify-center"
                >
                  {rowIndex === 0 ? (
                    <span
                      style={{
                        color: puzzleData.firstRowColors[cellIndex],
                      }}
                    >
                      {cell}
                    </span>
                  ) : rowIndex === puzzleData.pyramid.length - 1 &&
                    showFinalAnswer ? (
                    <span>{cell}</span>
                  ) : (
                    ''
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MathTrianglePuzzle;
