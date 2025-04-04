'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';

const GRID_SIZE = 16;

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
  gridInfo: {
    row: number;
    col: number;
    wordLength: number;
  };
}

function createEmptyGrid(): string[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
}

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

    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
      return false;
    }

    const existing = grid[r][c];
    const newLetter = word[i];
    if (existing !== '' && existing !== newLetter) {
      return false;
    }
  }
  return true;
}

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

function tryPlaceWithOverlap(
  grid: string[][],
  word: string,
  orientation: 'horizontal' | 'vertical'
): { row: number; col: number } | null {
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
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

const ImageMixedCrossWordPuzzleGenerator: React.FC = () => {
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
    const value = e.target.value.toUpperCase();
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

    const newGrid = createEmptyGrid();
    const placedPuzzles: PuzzleFinal[] = [];

    puzzles.forEach((puzzle, index) => {
      const word = puzzle.word;
      const orientation: 'horizontal' | 'vertical' =
        index % 2 === 0 ? 'horizontal' : 'vertical';

      let placed = false;
      let startRow = 0;
      let startCol = 0;

      if (index === 0) {
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
        const overlapPos = tryPlaceWithOverlap(newGrid, word, orientation);
        if (overlapPos) {
          startRow = overlapPos.row;
          startCol = overlapPos.col;
          placeWordInGrid(newGrid, word, startRow, startCol, orientation);
          placed = true;
        } else {
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
        alert(`Could not place the word "${word}".`);
        return;
      }

      placedPuzzles.push({
        ...puzzle,
        number: index + 1,
        orientation,
        startRow,
        startCol,
        gridInfo: { row: startRow, col: startCol, wordLength: word.length },
      });
    });

    setFinalPuzzles(placedPuzzles);
  };

  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let bgColor = 'bg-gray-300';
        let cellContent = '';

        finalPuzzles.forEach((puzzle) => {
          const { row, col, wordLength } = puzzle.gridInfo;

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
            {cellContent}
          </div>
        );
      }
    }
    return (
      <div
        className="mt-4 gap-0"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(16, auto)' }}
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
        Multi-Cluster Overlapping Puzzle (Up to 10)
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">
              Puzzle #{index + 1}
            </h2>
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
                  placeholder="Enter a word (max 16 chars)"
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

      {finalPuzzles.length > 0 && (
        <div id="printable-area" className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Write the image name in the appropriate box
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
                      alt={`Puzzle ${puzzle.number}`}
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

export default ImageMixedCrossWordPuzzleGenerator;
