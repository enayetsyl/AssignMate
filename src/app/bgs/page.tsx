'use client';
import { useState } from 'react';

export default function Dynamic2DGridPage() {
  const [horizontalCount, setHorizontalCount] = useState(2);
  const [verticalCount, setVerticalCount] = useState(2);

  // Generate the 2D pattern using the two counts
  const pattern = generate2DGrid(horizontalCount, verticalCount);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dynamic 2D Grid</h1>

      {/* Controls */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block mb-1">Horizontal Count</label>
          <input
            type="number"
            className="border p-1 w-16"
            min={1}
            value={horizontalCount}
            onChange={(e) => setHorizontalCount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block mb-1">Vertical Count</label>
          <input
            type="number"
            className="border p-1 w-16"
            min={1}
            value={verticalCount}
            onChange={(e) => setVerticalCount(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Render the grid */}
      <Grid pattern={pattern} />
    </div>
  );
}

/**
 * Generates a 2D pattern that repeats a single 5×5 grid
 * horizontally and vertically in one connected layout.
 *
 * - horizontalCount = how many times to repeat side-by-side
 * - verticalCount   = how many times to repeat top-to-bottom
 *
 * The final pattern will have (4 * verticalCount + 1) rows
 * and (4 * horizontalCount + 1) columns, because each
 * additional block shares the border with its neighbor.
 */
function generate2DGrid(horizontalCount, verticalCount) {
  // Our single 5×5 "border" pattern
  const singleGrid = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
  ];

  // Calculate total rows & columns for final pattern
  const totalRows = 4 * verticalCount + 1;
  const totalCols = 4 * horizontalCount + 1;

  // Initialize all cells to 0 (no border)
  const finalPattern = Array.from({ length: totalRows }, () =>
    Array.from({ length: totalCols }, () => 0)
  );

  // For each "block" in the vertical direction (v) and horizontal direction (h),
  // copy the singleGrid into the correct offset in finalPattern.
  for (let v = 0; v < verticalCount; v++) {
    for (let h = 0; h < horizontalCount; h++) {
      const rowOffset = v * 4;
      const colOffset = h * 4;

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (singleGrid[r][c] === 1) {
            finalPattern[rowOffset + r][colOffset + c] = 1;
          }
        }
      }
    }
  }

  return finalPattern;
}

/**
 * Renders the 2D array (pattern) as a grid of divs.
 *  - 1 => draw a border
 *  - 0 => empty
 */
function Grid({ pattern }) {
  return (
    <div>
      {pattern.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={'h-8 w-8 ' + (cell === 1 ? 'border border-black' : '')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
