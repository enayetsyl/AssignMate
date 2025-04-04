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
  orientation: 'horizontal' | 'vertical';
}

const ImageVerticalAndHorizontalCrossWordPuzzleGenerator: React.FC = () => {
  // Manage the list of puzzle fields (each puzzle includes an image and a word)
  const [puzzles, setPuzzles] = useState<PuzzleInput[]>([
    { id: 1, imageUrl: null, word: '' },
  ]);
  // After submission, final puzzles include computed grid info, sequential numbers, and orientation.
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

  // Add a new puzzle field (limit to 10 puzzles).
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

  // When the form is submitted, validate inputs and generate grid info.
  // We assign orientation based on index: even => horizontal, odd => vertical.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate: each puzzle must have both an image and a word, and word length <= 16.
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

    const computedPuzzles: PuzzleFinal[] = puzzles.map((puzzle, index) => {
      const wordLength = puzzle.word.length;
      const orientation: 'horizontal' | 'vertical' =
        index % 2 === 0 ? 'horizontal' : 'vertical';
      let row = 0;
      let col = 0;

      if (orientation === 'horizontal') {
        // For horizontal: choose any row (0–15) and a col that allows the word to fit.
        row = Math.floor(Math.random() * 16);
        col = Math.floor(Math.random() * (16 - wordLength + 1));
      } else {
        // For vertical: choose any col (0–15) and a row that allows the word to fit.
        row = Math.floor(Math.random() * (16 - wordLength + 1));
        col = Math.floor(Math.random() * 16);
      }

      return {
        ...puzzle,
        gridInfo: { row, col, wordLength },
        number: index + 1,
        orientation,
      };
    });

    setFinalPuzzles(computedPuzzles);
  };

  // Render a combined 16x16 grid.
  // For each cell, check each puzzle’s orientation and highlight accordingly.
  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        let bgColor = 'bg-gray-300';
        let cellContent = '';

        finalPuzzles.forEach((puzzle) => {
          const { row, col, wordLength } = puzzle.gridInfo;

          if (puzzle.orientation === 'horizontal') {
            // Horizontal puzzle covers row = row, columns = [col..col+wordLength)
            if (r === row && c >= col && c < col + wordLength) {
              bgColor = 'bg-white';
              // If it's the starting cell, show the puzzle number
              if (c === col) {
                cellContent = puzzle.number.toString();
              }
            }
          } else {
            // Vertical puzzle covers col = col, rows = [row..row+wordLength)
            if (c === col && r >= row && r < row + wordLength) {
              bgColor = 'bg-white';
              // If it's the starting cell, show the puzzle number
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

  // Print function: prints only the content inside #printable-area
  const handlePrint = () => {
    window.print();
  };

  // Separate final puzzles into horizontal vs. vertical for display.
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
          margin: 5mm;
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
        Mixed Orientation Crossword Puzzle App
      </h1>

      {/* 1) Form to add puzzles and generate */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Puzzle #{index + 1}</h2>
            <div className="flex flex-col md:flex-row items-center justify-start gap-10">
              <div className="mb-2 flex flex-col items-start gap-2">
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
              <div className="mb-2 flex flex-col items-start gap-2">
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

      {/* 2) Puzzle and images area */}
      {finalPuzzles.length > 0 && (
        <div id="printable-area" className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Write the image name in the appropriate box
          </h2>

          {/* 
            Layout:
            - A row at the top for horizontal puzzle images
            - A row below that, with the puzzle on the left and vertical puzzle images on the right 
          */}

          {/* Top row: horizontal puzzle images */}
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

          {/* Middle row: puzzle grid on the left, vertical puzzle images on the right */}
          <div className="flex flex-row w-full gap-4">
            {/* Puzzle grid */}
            <div className="flex-grow">{renderGrid()}</div>

            {/* Vertical puzzle images on the right */}
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

export default ImageVerticalAndHorizontalCrossWordPuzzleGenerator;
