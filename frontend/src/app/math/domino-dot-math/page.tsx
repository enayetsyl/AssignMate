'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DominoPuzzle {
  total: number;
  leftCount: number; 
}

/**
 * Generates an array of puzzle objects (dominos).
 * Each puzzle has:
 * - A random total from 1..15
 * - A random leftCount from 0..total
 * - rightCount = total - leftCount
 */
function generateDominoPuzzles(count: number): DominoPuzzle[] {
  const puzzles: DominoPuzzle[] = [];

  for (let i = 0; i < count; i++) {
    const total = Math.floor(Math.random() * 20) + 1; 
    const leftCount = Math.floor(Math.random() * total) + 1; 
    puzzles.push({ total, leftCount });
  }

  return puzzles;
}

const DominoDotsPuzzle: React.FC = () => {
  const [puzzles, setPuzzles] = useState<DominoPuzzle[]>([]);
  // Set the default domino color to a brown shade.
  const [dominoColor, setDominoColor] = useState<string>('#A1662F');

  // Generate 20 puzzle items (change as needed)
  const handleGenerate = () => {
    setPuzzles(generateDominoPuzzles(20));
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Global print styling */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0; /* Remove default browser print margins */
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
            top: 0;
            left: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Controls */}
      <h1 className="text-2xl font-bold mb-4 text-center">
        Draw the Missing Dots on Each Domino
      </h1>
      <div className="flex justify-center gap-4 mb-6">
        <select
          value={dominoColor}
          onChange={(e) => setDominoColor(e.target.value)}
          className="border p-1"
        >
          <option value="#A1662F">Brown</option>
          <option value="#1E90FF">Blue</option>
          <option value="#32CD32">Green</option>
          <option value="#FF6347">Red</option>
          <option value="#800080">Purple</option>
        </select>
        <Button onClick={handleGenerate}>Generate Puzzle</Button>
        {puzzles.length > 0 && (
          <Button onClick={handlePrint}>Print Puzzle</Button>
        )}
      </div>

      {/* Puzzle display (A4 page) */}
      {puzzles.length > 0 && (
        <div
          id="printable-area"
          className="border border-gray-300 mx-auto bg-white page-break-inside-avoid"
          style={{
            width: '210mm',
            height: '297mm',
            overflow: 'hidden',
            position: 'relative',
            padding: '10px',
          }}
        >
          <h2 className="text-xl font-bold text-center mb-4">
            Draw the Missing Dots on Each Domino
          </h2>

          {/* Grid layout for puzzles */}
          <div className="grid grid-cols-4 gap-4 page-break-inside-avoid">
            {puzzles.map((puzzle, index) => {
              // Create an array for filled left dots
              const leftDots = Array.from({ length: puzzle.leftCount }, (_, i) => i);
            

              return (
                <div
                  key={index}
                  className="flex flex-col items-center page-break-inside-avoid"
                >
                  {/* Top box showing total */}
                  <div
                    className="flex items-center justify-center w-24 h-20 text-2xl font-bold mb-1"
                    style={{ backgroundColor: dominoColor }}
                  >
                    {puzzle.total}
                  </div>

                  {/* Domino shape */}
                  <div
                    className="flex w-44 h-28 relative justify-between"
                    style={{ backgroundColor: dominoColor }}
                  >
                    {/* Left side: Filled dots */}
                    <div className="flex-1 flex flex-wrap items-center justify-center border-r border-black p-0.5">
                      {leftDots.map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full bg-black m-1"
                        ></div>
                      ))}
                    </div>

                    {/* Right side: Placeholder dots */}
                    <div className="flex-1 flex flex-wrap items-center justify-center p-1">
                     
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DominoDotsPuzzle;
