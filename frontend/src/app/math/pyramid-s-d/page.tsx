'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// --- Type Definitions ---
type Operation = 'subtraction' | 'division';
type Difficulty = 'easy' | 'medium' | 'hard';

interface PuzzleData {
  pyramid: number[][];
  firstRowColors: string[];
}

// --- Utility Functions ---
// Generate a random hex color.
function randomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// --- Puzzle Generation for Subtraction ---
// For subtraction, we generate the first row from the allowed range (based on difficulty),
// then sort the row in descending order so that differences are non-negative.
function generatePuzzleDataSubtraction(
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
  // Generate first row and sort in descending order.
  const firstRow: number[] = Array.from({ length: rowCount }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  ).sort((a, b) => b - a);
  const pyramid: number[][] = [firstRow];
  for (let r = 1; r < rowCount; r++) {
    const prevRow = pyramid[r - 1];
    const newRow: number[] = [];
    for (let i = 0; i < prevRow.length - 1; i++) {
      newRow.push(prevRow[i] - prevRow[i + 1]);
    }
    pyramid.push(newRow);
  }
  const firstRowColors: string[] = Array.from({ length: rowCount }, () =>
    randomColor()
  );
  return { pyramid, firstRowColors };
}

// --- Puzzle Generation for Division ---
// We want no decimal value in any computed cell. We try to generate a first row
// (from the allowed range based on difficulty) such that for every adjacent pair in each row
// the division yields an integer. We attempt repeatedly (up to a limit).
function generatePuzzleDataDivision(
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
  let pyramid: number[][] = [];
  let firstRow: number[] = [];
  let attempt = 0;
  const maxAttempts = 1000;
  let valid = false;
  while (!valid && attempt < maxAttempts) {
    attempt++;
    firstRow = Array.from({ length: rowCount }, () =>
      Math.floor(Math.random() * (max - min + 1)) + min
    );
    pyramid = [firstRow];
    valid = true;
    for (let r = 1; r < rowCount; r++) {
      const prevRow = pyramid[r - 1];
      const newRow: number[] = [];
      for (let i = 0; i < prevRow.length - 1; i++) {
        const divisor = prevRow[i + 1];
        // Avoid division by zero and ensure divisibility.
        if (divisor === 0 || prevRow[i] % divisor !== 0) {
          valid = false;
          break;
        }
        newRow.push(prevRow[i] / divisor);
      }
      if (!valid) break;
      pyramid.push(newRow);
    }
  }
  // Fallback: if no valid row is found, use a trivial puzzle of ones.
  if (!valid) {
    firstRow = Array(rowCount).fill(1);
    pyramid = [firstRow];
    for (let r = 1; r < rowCount; r++) {
      const prevRow = pyramid[r - 1];
      const newRow = Array(prevRow.length - 1).fill(1);
      pyramid.push(newRow);
    }
  }
  const firstRowColors: string[] = Array.from({ length: rowCount }, () =>
    randomColor()
  );
  return { pyramid, firstRowColors };
}

// --- Unified Puzzle Data Generation ---
// Based on the chosen operation, call the appropriate generator.
function generatePuzzleData(
  op: Operation,
  difficulty: Difficulty,
  rowCount: number
): PuzzleData {
  if (op === 'subtraction') {
    return generatePuzzleDataSubtraction(difficulty, rowCount);
  } else {
    return generatePuzzleDataDivision(difficulty, rowCount);
  }
}

// --- Main Component ---
const MathTriangleSubDivPuzzle: React.FC = () => {
  const [operation, setOperation] = useState<Operation>('subtraction');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [rowCount, setRowCount] = useState<number>(5);
  const [showFinalAnswer, setShowFinalAnswer] = useState<boolean>(false);
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);

  // Generate puzzle when the user clicks the button.
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

  // Build print view content for the "Puzzle" (only first row and, if checked, last row).
  const handlePrintPuzzle = () => {
    let content = '<div>';
    if (puzzleData) {
      puzzleData.pyramid.forEach((row, rowIndex) => {
        content += '<div class="row">';
        row.forEach((cell, cellIndex) => {
          if (rowIndex === 0) {
            // First row always shows value (with its random text color).
            const color = puzzleData.firstRowColors[cellIndex] || '#000';
            content += `<div class="cell" style="color: ${color};">${cell}</div>`;
          } else if (showFinalAnswer && rowIndex === puzzleData.pyramid.length - 1) {
            // If checkbox is checked, reveal the last row.
            content += `<div class="cell">${cell}</div>`;
          } else {
            // Intermediate (or last row if not showing answer): blank cell.
            content += '<div class="cell"></div>';
          }
        });
        content += '</div>';
      });
    }
    content += '</div>';
    openPrintWindow('Print Puzzle', content);
  };

  // Build print view content for the full answer (complete pyramid).
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
        Math Triangle Puzzle (Subtraction / Division)
      </h1>

      {/* Controls */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        {/* Operation Selection */}
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="operation"
              value="subtraction"
              checked={operation === 'subtraction'}
              onChange={() => setOperation('subtraction')}
              className="form-radio"
            />
            <span>Subtraction</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="operation"
              value="division"
              checked={operation === 'division'}
              onChange={() => setOperation('division')}
              className="form-radio"
            />
            <span>Division</span>
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

        {/* Show Final Answer Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showFinalAnswer}
            onChange={(e) => setShowFinalAnswer(e.target.checked)}
            className="form-checkbox"
          />
          <span>Show Final Answer in Last Row</span>
        </div>

        {/* Generate and Print Buttons */}
        <Button onClick={handleGenerate}>Generate Puzzle</Button>
        {puzzleData && (
          <div className="flex space-x-4">
            <Button onClick={handlePrintPuzzle}>Print Puzzle</Button>
            <Button onClick={handlePrintAnswer}>Print Answer</Button>
          </div>
        )}
      </div>

      {/* On-Screen Puzzle View */}
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
                    <span style={{ color: puzzleData.firstRowColors[cellIndex] }}>
                      {cell}
                    </span>
                  ) : rowIndex === puzzleData.pyramid.length - 1 && showFinalAnswer ? (
                    cell
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

export default MathTriangleSubDivPuzzle;
