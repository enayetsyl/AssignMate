'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';

const GRID_SIZE = 16;

// Represents a single puzzle input (word + image).
interface PuzzleInput {
  id: number;
  imageUrl: string | null;
  word: string;
}

// Represents a puzzle after final placement in the grid.
interface PuzzleFinal extends PuzzleInput {
  number: number; // sequential puzzle number (1..N)
  orientation: 'horizontal' | 'vertical';
  startRow: number;
  startCol: number;
}

// Create an empty 16×16 grid.
function createEmptyGrid(): string[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
}

/**
 * Checks if `word` can be placed at (row, col) in `grid` with the given orientation.
 * Overlap is allowed only if the letters match exactly.
 */
function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  orientation: 'horizontal' | 'vertical'
): boolean {
  for (let i = 0; i < word.length; i++) {
    let r = row;
    let c = col;
    if (orientation === 'horizontal') {
      c += i;
    } else {
      r += i;
    }

    // Check bounds
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      return false;
    }

    const existing = grid[r][c];
    const newLetter = word[i];
    // If there's already a letter, it must match for a valid overlap.
    if (existing !== '' && existing !== newLetter) {
      return false;
    }
  }
  return true;
}

/**
 * Write the word’s letters into the grid (assuming canPlaceWord returned true).
 */
function placeWordInGrid(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  orientation: 'horizontal' | 'vertical'
) {
  for (let i = 0; i < word.length; i++) {
    let r = row;
    let c = col;
    if (orientation === 'horizontal') {
      c += i;
    } else {
      r += i;
    }
    grid[r][c] = word[i];
  }
}

/**
 * Attempt forced overlap: for each letter in `word`, if it appears in the grid,
 * try aligning so they overlap. Return {row, col} if a valid alignment is found.
 */
function tryPlaceWithOverlap(
  grid: string[][],
  word: string,
  orientation: 'horizontal' | 'vertical'
): { row: number; col: number } | null {
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    // Search the grid for a matching letter.
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === letter) {
          let startRow = r;
          let startCol = c;
          if (orientation === 'horizontal') {
            startCol = c - i;
          } else {
            startRow = r - i;
          }
          if (canPlaceWord(grid, word, startRow, startCol, orientation)) {
            return { row: startRow, col: startCol };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Attempt a "fresh" (non-overlapping) placement anywhere in the grid.
 * Try up to 100 random positions that can fit the word.
 */
function tryPlaceAsNewCluster(
  grid: string[][],
  word: string,
  orientation: 'horizontal' | 'vertical'
): { row: number; col: number } | null {
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (orientation === 'horizontal') {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * (GRID_SIZE - word.length + 1));
      if (canPlaceWord(grid, word, row, col, orientation)) {
        return { row, col };
      }
    } else {
      const col = Math.floor(Math.random() * GRID_SIZE);
      const row = Math.floor(Math.random() * (GRID_SIZE - word.length + 1));
      if (canPlaceWord(grid, word, row, col, orientation)) {
        return { row, col };
      }
    }
  }
  return null;
}

const MultiClusterPuzzle: React.FC = () => {
  // 1) Manage puzzle inputs
  const [puzzles, setPuzzles] = useState<PuzzleInput[]>([
    { id: 1, imageUrl: null, word: '' },
  ]);

  // 2) Final placed puzzles
  const [finalPuzzles, setFinalPuzzles] = useState<PuzzleFinal[]>([]);
  // 3) The letter grid
  const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
  // 4) For labeling puzzle start cells: key = "row-col", value = puzzle number
  const [startCells, setStartCells] = useState<{ [key: string]: number }>({});

  // Handle image uploads
  const handleImageUpload = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPuzzles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, imageUrl: url } : p))
      );
    }
  };

  // Handle word input (for Bangla words, we don't convert the input)
  const handleWordChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Do not call toUpperCase() for Bangla words
    setPuzzles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, word: value } : p))
    );
  };

  // Add a new puzzle (limit 10)
  const addPuzzle = () => {
    if (puzzles.length < 10) {
      const newId = Math.max(...puzzles.map((p) => p.id)) + 1;
      setPuzzles([...puzzles, { id: newId, imageUrl: null, word: '' }]);
    }
  };

  // Remove a puzzle
  const removePuzzle = (id: number) => {
    setPuzzles(puzzles.filter((p) => p.id !== id));
  };

  // Generate the puzzle: place each word in the shared grid.
  // If forced overlap fails, place as a new cluster.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    for (const puzzle of puzzles) {
      if (!puzzle.imageUrl || !puzzle.word) {
        alert('Please provide both an image and a word for each puzzle.');
        return;
      }
      if (puzzle.word.length > GRID_SIZE) {
        alert(`Word length cannot exceed ${GRID_SIZE} characters.`);
        return;
      }
    }

    // Clear old puzzle
    const newGrid = createEmptyGrid();
    const newStartCells: { [key: string]: number } = {};
    const placedPuzzles: PuzzleFinal[] = [];

    // Place each puzzle in order
    puzzles.forEach((puzzle, index) => {
      const word = puzzle.word;
      // Orientation: even => horizontal, odd => vertical.
      const orientation: 'horizontal' | 'vertical' =
        index % 2 === 0 ? 'horizontal' : 'vertical';

      let placed = false;
      let startRow = 0;
      let startCol = 0;

      if (index === 0) {
        // For the first puzzle, place near the center.
        if (orientation === 'horizontal') {
          startRow = Math.floor(GRID_SIZE / 2);
          startCol = Math.max(0, Math.floor((GRID_SIZE - word.length) / 2));
        } else {
          startCol = Math.floor(GRID_SIZE / 2);
          startRow = Math.max(0, Math.floor((GRID_SIZE - word.length) / 2));
        }

        if (!canPlaceWord(newGrid, word, startRow, startCol, orientation)) {
          const freshPos = tryPlaceAsNewCluster(newGrid, word, orientation);
          if (!freshPos) {
            alert(`Cannot place the first word "${word}". Try shorter words.`);
            return;
          }
          startRow = freshPos.row;
          startCol = freshPos.col;
        }
        placeWordInGrid(newGrid, word, startRow, startCol, orientation);
        placed = true;
      } else {
        // For subsequent puzzles, try forced overlap first.
        const overlapPos = tryPlaceWithOverlap(newGrid, word, orientation);
        if (overlapPos) {
          startRow = overlapPos.row;
          startCol = overlapPos.col;
          placeWordInGrid(newGrid, word, startRow, startCol, orientation);
          placed = true;
        } else {
          // If forced overlap fails, try fresh placement.
          const freshPos = tryPlaceAsNewCluster(newGrid, word, orientation);
          if (freshPos) {
            startRow = freshPos.row;
            startCol = freshPos.col;
            placeWordInGrid(newGrid, word, startRow, startCol, orientation);
            placed = true;
          }
        }
      }

      if (!placed) {
        alert(
          `Could not place the word "${word}" either by forced overlap or a new cluster.`
        );
        return;
      }

      console.log(
        `Puzzle #${index + 1} ("${word}") placed at row=${startRow}, col=${startCol} ` +
        `orientation=${orientation}, length=${word.length}`
      );

      // Mark the start cell for labeling
      newStartCells[`${startRow}-${startCol}`] = index + 1;

      placedPuzzles.push({
        ...puzzle,
        number: index + 1,
        orientation,
        startRow,
        startCol,
      });
    });


    // console.log(
    //   `Puzzle #${index + 1} ("${word}") placed at row=${startRow}, col=${startCol} ` +
    //   `orientation=${orientation}, length=${word.length}`
    // );
    

    setGrid(newGrid);
    setStartCells(newStartCells);
    setFinalPuzzles(placedPuzzles);
  };

  // Render the 16×16 grid.
  // - Default cells: gray (bg-gray-300)
  // - Puzzle cells: white (bg-white)
  // - Only the first cell of each puzzle shows the puzzle number.
  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let bgColor = 'bg-gray-300';
        let cellContent = '';
  
        finalPuzzles.forEach((puzzle) => {
          const row = puzzle.startRow;
          const col = puzzle.startCol;
          const wordLength = puzzle.word.length;
  
          if (puzzle.orientation === 'horizontal') {
            if (r === row && c >= col && c < col + wordLength) {
              bgColor = 'bg-white';
              if (c === col) {
                cellContent = puzzle.number.toString();
              }
            }
          } else {
            if (c === col && r >= row && r < row + wordLength) {
              bgColor = 'bg-white';
              if (r === row) {
                cellContent = puzzle.number.toString();
              }
            }
          }
        });
  
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`w-10 h-10 border border-gray-700 flex items-center justify-center text-lg ${bgColor} text-center`}
          >
            {cellContent && (
              <span className="absolute top-0 left-0 text-[0.6rem] text-gray-800">
                {cellContent}
              </span>
            )}
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
  
  

  // Print function: prints only the content inside #printable-area.
  const handlePrint = () => {
    window.print();
  };

  // Separate final puzzles by orientation for image layout.
  const horizontalPuzzles = finalPuzzles.filter(
    (p) => p.orientation === 'horizontal'
  );
  const verticalPuzzles = finalPuzzles.filter(
    (p) => p.orientation === 'vertical'
  );

  return (
    <div className="container mx-auto p-4">
      {/* Print Styles */}
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
        Mixed Orientation Crossword Puzzle App (Bangla Words Supported)
      </h1>

      {/* 1) Form to add puzzles and generate */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Puzzle #{index + 1}</h2>
            <div className="flex flex-col md:flex-row items-center justify-start gap-6">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">
                  Upload Image:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(puzzle.id, e)}
                  className="border p-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Word:</label>
                <input
                  type="text"
                  value={puzzle.word}
                  onChange={(e) => handleWordChange(puzzle.id, e)}
                  className="border p-1"
                  placeholder="Enter Bangla word (max 16 chars)"
                />
              </div>
            </div>
            {puzzles.length > 1 && (
              <button
                type="button"
                onClick={() => removePuzzle(puzzle.id)}
                className="text-red-500 text-sm mt-2"
              >
                Remove
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
            Add Puzzle
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Create Puzzle
        </button>
      </form>

      {/* 2) Display puzzle images + grid in printable area */}
      {finalPuzzles.length > 0 && (
        <div id="printable-area" className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Write the image name in the appropriate box
          </h2>

          {/* Horizontal puzzle images above the grid */}
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
                      alt={`Puzzle ${puzzle.number}`}
                      width={80}
                      height={80}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Grid + vertical puzzle images on the right */}
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
                        alt={`Puzzle ${puzzle.number}`}
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

      {/* 3) Print Button */}
      {finalPuzzles.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePrint}
            className="bg-indigo-500 text-white py-2 px-4 rounded"
          >
            Print Puzzle
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiClusterPuzzle;
