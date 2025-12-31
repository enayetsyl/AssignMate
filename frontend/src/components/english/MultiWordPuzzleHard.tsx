'use client';

import { COLORS } from '@/constant';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const MAX_WORDS = 20;

interface MultiWordPuzzleGeneratorHardProps {
  studentName?: string;
  date?: string;
  studentClass?: string;
}

const MultiWordPuzzleGeneratorHard: React.FC<MultiWordPuzzleGeneratorHardProps> = ({
  studentName = '',
  date = '',
  studentClass = '',
}) => {
  const [words, setWords] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<Record<string, [number, number][]>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [printMode, setPrintMode] = useState<'puzzle' | 'answer' | 'two-page'>('puzzle');

  useEffect(() => setIsClient(true), []);

  const handleWordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const list = e.target.value
      .split('\n')
      .map((w) => w.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, MAX_WORDS);
    setWords(list);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_WORDS);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages(urls);
  };

  const handleGenerate = () => {
    const { grid, answers } = generatePuzzle(words);
    setGrid(grid);
    setAnswers(answers);
    setShowAnswers(false);
  };

  const handlePrint = (mode: 'puzzle' | 'answer') => {
    setPrintMode(mode);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintWithStudentInfo = () => {
    if (!studentName || !studentName.trim()) {
      alert('Please enter a student name');
      return;
    }
    if (!date || !date.trim()) {
      alert('Please enter a date');
      return;
    }
    if (!studentClass || !studentClass.trim()) {
      alert('Please select a class');
      return;
    }
    if (grid.length === 0) {
      alert('Please generate puzzle first');
      return;
    }
    setPrintMode('two-page');
    setShowAnswers(false);
    setTimeout(() => window.print(), 100);
  };

  const getCellColor = (row: number, col: number, isAnswerPage: boolean = false) => {
    if (printMode === 'two-page' && !isAnswerPage) return '';
    if ((!showAnswers && printMode !== 'two-page') || (printMode !== 'answer' && printMode !== 'two-page')) return '';
    const entries = Object.entries(answers);
    for (let i = 0; i < entries.length; i++) {
      const [, positions] = entries[i];
      if (positions.some(([r, c]) => r === row && c === col)) {
        return COLORS[i % COLORS.length];
      }
    }
    return '';
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            inset: 0;
            width: 100vw;
            height: 100vh;
          }
          
          /* Two-page layout styles */
          .print-page {
            page-break-after: always;
            display: flex;
            flex-direction: column;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .print-page:first-child {
            page-break-before: auto;
          }
          .student-info-header {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
          }
        }
      `}</style>

      <div className="p-4">
        {/* Input Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <textarea
              placeholder="Enter up to 20 words, one per line"
              className="border p-2 w-full h-40"
              onChange={handleWordChange}
            />
            <p className="text-sm text-gray-500">
              Words added: {words.length} / {MAX_WORDS}
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="border p-2 w-full"
            />
            <p className="text-sm text-gray-500">
              Images uploaded: {images.length} / {MAX_WORDS} (optional)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="my-4 flex flex-wrap gap-4">
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate Puzzle
          </button>
          <button
            onClick={() => {
              setShowAnswers(true);
              handlePrint('answer');
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Print Answers
          </button>
          <button
            onClick={() => {
              setShowAnswers(false);
              handlePrint('puzzle');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Print Puzzle
          </button>
          <button
            onClick={handlePrintWithStudentInfo}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Print with Student Info
          </button>
        </div>

        {/* Printable Area */}
        {isClient && (
          <div id="printable-area" className="w-full px-4">
            {printMode === 'two-page' ? (
              <>
                {/* First Page - Puzzle */}
                <div className="print-page">
                  {(studentName || date || studentClass) && (
                    <div className="student-info-header">
                      {studentName && (
                        <p>
                          Name: {studentName}
                          {studentClass && ` | Class: ${studentClass}`}
                        </p>
                      )}
                      {date && <p>Date: {new Date(date).toLocaleDateString()}</p>}
                    </div>
                  )}
                  <h2 className="font-bold text-2xl underline text-center mb-4 font-kids">
                    Find the words in the puzzle!
                  </h2>
                  <div className="flex flex-row gap-4 justify-between items-start">
                    {/* Word List */}
                    <div className="w-1/4 space-y-1">
                      <ul>
                        {words.map((word) => (
                          <li key={word} className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="font-kids text-lg">{word}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Puzzle Grid */}
                    <div className="w-2/4 overflow-auto">
                      <table className="border border-black border-collapse mx-auto font-kids text-lg">
                        <tbody>
                          {grid.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="border border-black w-6 h-6 text-center font-bold"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Images */}
                    <div className="w-1/4 grid grid-cols-2 gap-2">
                      {images.map((src, i) => (
                        <Image
                          key={i}
                          src={src}
                          alt={`img-${i}`}
                          className="h-14 w-auto object-contain"
                          height={14}
                          width={14}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Second Page - Answers */}
                <div className="print-page">
                  {(studentName || date || studentClass) && (
                    <div className="student-info-header">
                      {studentName && (
                        <p>
                          Name: {studentName}
                          {studentClass && ` | Class: ${studentClass}`}
                        </p>
                      )}
                      {date && <p>Date: {new Date(date).toLocaleDateString()}</p>}
                      <p className="mt-2">Answer Key</p>
                    </div>
                  )}
                  <h2 className="font-bold text-2xl underline text-center mb-4 font-kids">
                    Find the words in the puzzle!
                  </h2>
                  <div className="flex flex-row gap-4 justify-between items-start">
                    {/* Puzzle Grid with Answers */}
                    <div className="w-full overflow-auto">
                      <table className="border border-black border-collapse mx-auto font-kids text-lg">
                        <tbody>
                          {grid.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`border border-black w-6 h-6 text-center font-bold ${getCellColor(rIdx, cIdx, true)}`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-bold text-2xl underline text-center mb-4 font-kids">
                  Find the words in the puzzle!
                </h2>
                <div className="flex flex-row gap-4 justify-between items-start">
                  {/* Word List */}
                  {printMode === 'puzzle' && (
                    <div className="w-1/4 space-y-1">
                      <ul>
                        {words.map((word) => (
                          <li key={word} className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="font-kids text-lg">{word}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Puzzle Grid */}
                  <div className="w-2/4 overflow-auto">
                    <table className="border border-black border-collapse mx-auto font-kids text-lg">
                      <tbody>
                        {grid.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`border border-black w-6 h-6 text-center font-bold ${getCellColor(rIdx, cIdx)}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Images */}
                  {printMode === 'puzzle' && (
                    <div className="w-1/4 grid grid-cols-2 gap-2">
                      {images.map((src, i) => (
                        <Image
                          key={i}
                          src={src}
                          alt={`img-${i}`}
                          className="h-14 w-auto object-contain"
                          height={14}
                          width={14}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MultiWordPuzzleGeneratorHard;

// Path definitions
export type Direction = number[][];

export const DIRECTIONS: Direction[] = [
  [[0, 1]], // right
  [[1, 0]], // down
  [[1, 1]], // diagonal
  [[-1, 1]], // up-right
  [[0, 1], [1, 0]], // L shape
  [[1, 0], [0, 1]], // reverse L
];

// Grid helpers
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

function canPlace(grid: string[][], word: string, row: number, col: number, path: Direction) {
  let r = row, c = col;
  for (let i = 0; i < word.length; i++) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) return false;
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    const [dr, dc] = path[i % path.length];
    r += dr;
    c += dc;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  path: Direction
): [number, number][] {
  let r = row, c = col;
  const positions: [number, number][] = [];
  for (let i = 0; i < word.length; i++) {
    grid[r][c] = word[i];
    positions.push([r, c]);
    const [dr, dc] = path[i % path.length];
    r += dr;
    c += dc;
  }
  return positions;
}

export function generatePuzzle(words: string[]): {
  grid: string[][];
  answers: Record<string, [number, number][]>;
} {
  const maxWordLength = Math.max(...words.map((w) => w.length));
  const gridSize = Math.max(20, maxWordLength + 8);
  const grid = createEmptyGrid(gridSize);
  const answers: Record<string, [number, number][]> = {};

  for (const word of words) {
    let placed = false, tries = 0;
    while (!placed && tries++ < 200) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (canPlace(grid, word, row, col, dir)) {
        answers[word] = placeWord(grid, word, row, col, dir);
        placed = true;
      }
    }
  }

  // Fill empty cells
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
  }

  return { grid, answers };
}
