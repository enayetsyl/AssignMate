'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';

interface PuzzleInput {
  id: number;
  imageUrl: string | null;
  word: string;
}

interface PuzzleFinal extends PuzzleInput {
  gridInfo: {
    row: number;
    col: number;
    wordLength: number;
  };
  number: number;
}

const ImageVerticalCrossWordPuzzleGenerator: React.FC = () => {
  // Manage the list of puzzle fields (each puzzle includes an image and a word)
  const [puzzles, setPuzzles] = useState<PuzzleInput[]>([
    { id: 1, imageUrl: null, word: '' },
  ]);
  // After submission, final puzzles include computed grid info and sequential numbers
  const [finalPuzzles, setFinalPuzzles] = useState<PuzzleFinal[]>([]);

  // Update image for a specific puzzle input field.
  const handleImageUpload = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPuzzles((prev) =>
        prev.map((puzzle) =>
          puzzle.id === id ? { ...puzzle, imageUrl: url } : puzzle
        )
      );
    }
  };

  // Update word input for a specific puzzle.
  const handleWordChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPuzzles((prev) =>
      prev.map((puzzle) =>
        puzzle.id === id ? { ...puzzle, word: value } : puzzle
      )
    );
  };

  // Add a new puzzle field (limit to 10 puzzles)
  const addPuzzle = () => {
    if (puzzles.length < 10) {
      const newId =
        puzzles.length > 0 ? Math.max(...puzzles.map((p) => p.id)) + 1 : 1;
      setPuzzles([...puzzles, { id: newId, imageUrl: null, word: '' }]);
    }
  };

  // Remove a puzzle field by id.
  const removePuzzle = (id: number) => {
    setPuzzles(puzzles.filter((puzzle) => puzzle.id !== id));
  };

  // When the form is submitted, validate the inputs and generate grid info for each puzzle.
  // For vertical placement: row must allow the entire word to fit in a 16-cell column.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate: each puzzle must have both an image and a word, and the word must not exceed 16 characters.
    for (const puzzle of puzzles) {
      if (!puzzle.imageUrl || !puzzle.word) {
        alert('Please provide both an image and a word for each puzzle.');
        return;
      }
      if (puzzle.word.length > 16) {
        alert('Word length cannot exceed 16 characters.');
        return;
      }
    }

    // Generate final puzzles with grid info.
    // Each puzzle gets a sequential number starting from 1.
    const computedPuzzles: PuzzleFinal[] = puzzles.map((puzzle, index) => {
      const wordLength = puzzle.word.length;
      // For vertical placement, choose a row so the word fits vertically.
      const row = Math.floor(Math.random() * (16 - wordLength + 1));
      // Column can be any number from 0 to 15.
      const col = Math.floor(Math.random() * 16);
      return {
        ...puzzle,
        gridInfo: { row, col, wordLength },
        number: index + 1,
      };
    });

    setFinalPuzzles(computedPuzzles);
  };

  // Render a 16x16 grid.
  // For vertical placement: if a cell is in the same column as the puzzle and within the vertical range, mark it white.
  // The starting cell (topmost cell) displays the sequential puzzle number.
  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        let bgColor = 'bg-gray-300';
        let cellContent = '';

        // Check if this cell is part of any puzzle’s vertical placement.
        finalPuzzles.forEach((puzzle) => {
          const { row, col, wordLength } = puzzle.gridInfo;
          if (c === col && r >= row && r < row + wordLength) {
            bgColor = 'bg-white';
            // If it's the starting cell (top cell of the vertical word), display the puzzle number.
            if (r === row) {
              cellContent = puzzle.number.toString();
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

  // Print function: print only the content inside #printable-area
  const handlePrint = () => {
    window.print();
  };

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

      <h1 className="text-2xl font-bold mb-4">Vertical Crossword Puzzle App</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Puzzle #{index + 1}</h2>
            <div className="flex items-center justify-start gap-10">
              <div className="mb-2 flex justify-center items-center gap-5">
                <label className="block text-sm font-medium">
                  Upload Image:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(puzzle.id, e)}
                  className="mt-1 border"
                />
              </div>
              <div className="mb-2 flex justify-center items-center gap-5">
                <label className="block text-sm font-medium">Word:</label>
                <input
                  type="text"
                  value={puzzle.word}
                  onChange={(e) => handleWordChange(puzzle.id, e)}
                  className="mt-1 border border-gray-300 rounded p-1"
                />
              </div>
            </div>
            {puzzles.length > 1 && (
              <button
                type="button"
                onClick={() => removePuzzle(puzzle.id)}
                className="text-red-500 text-sm"
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
          Create Puzzles
        </button>
      </form>

      {finalPuzzles.length > 0 && (
        <div id="printable-area">
          {/* Display each puzzle's image, number, and word */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Write the image name in the appropriate box
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {finalPuzzles.map((puzzle) => (
                <div
                  key={puzzle.id}
                  className="border rounded flex justify-center items-center gap-2"
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
          </div>

          {/* Render the combined 16x16 grid with all puzzles overlaid */}
          {renderGrid()}
        </div>
      )}

      {/* Print Button */}
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

export default ImageVerticalCrossWordPuzzleGenerator;
