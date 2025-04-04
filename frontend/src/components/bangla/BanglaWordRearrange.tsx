'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import GraphemeSplitter from 'grapheme-splitter';

type PuzzleData = {
  word: string;
  images: string[];
  scrambled: string[];
};

// Utility to scramble a Bangla word into an array of grapheme clusters
function scrambleWord(word: string): string[] {
  const splitter = new GraphemeSplitter();
  const letters = splitter.splitGraphemes(word);
  // Fisher-Yates shuffle
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters;
}

const MAX_PUZZLES = 3;

export default function BanglaWordRearrange() {
  // State: array of puzzle objects
  const [puzzles, setPuzzles] = useState<PuzzleData[]>([
    { word: '', images: ['', '', '', ''], scrambled: [] },
  ]);

  // Handle changes to the puzzle word
  const handleWordChange = (puzzleIndex: number, newWord: string) => {
    const updated = [...puzzles];
    updated[puzzleIndex].word = newWord;
    updated[puzzleIndex].scrambled = scrambleWord(newWord);
    setPuzzles(updated);
  };

  // Handle changes to an image (file upload)
  const handleImageChange = (
    puzzleIndex: number,
    imageIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const blobURL = URL.createObjectURL(file);
      const updated = [...puzzles];
      updated[puzzleIndex].images[imageIndex] = blobURL;
      setPuzzles(updated);
    }
  };

  // Add a new puzzle (up to 3)
  const addPuzzle = () => {
    if (puzzles.length >= MAX_PUZZLES) return;
    setPuzzles([
      ...puzzles,
      { word: '', images: ['', '', '', ''], scrambled: [] },
    ]);
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      {/* Global print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 40; /* অথবা 20mm */
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
            transform: scale(0.9);
            transform-origin: top left;
          }

          table,
          tr,
          td {
            page-break-inside: avoid;
          }

          .navbar {
            display: none !important;
          }
        }
      `}</style>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">আপনার পাজল তৈরি করুন</h1>

      {/* Puzzle Creation Forms */}
      {puzzles.map((puzzle, puzzleIndex) => (
        <div key={puzzleIndex} className="mb-12 border-b pb-8">
          {/* Puzzle Heading */}
          <h2 className="text-lg font-semibold mb-2">
            পাজল {puzzleIndex + 1}
          </h2>

          {/* Word Input */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">শব্দ</label>
            <Input
              value={puzzle.word}
              onChange={(e) => handleWordChange(puzzleIndex, e.target.value)}
              placeholder="শব্দ লিখুন"
            />
          </div>

          {/* Image Uploads (4 images per puzzle) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {puzzle.images.map((_, imageIndex) => (
              <div key={imageIndex}>
                <label className="block mb-1 font-medium">{`ছবি ${
                  imageIndex + 1
                }`}</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(puzzleIndex, imageIndex, e)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Print & Add Puzzle Buttons (on-screen only) */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
        {puzzles.length < MAX_PUZZLES && (
          <Button onClick={addPuzzle} variant="default">
            ➕ আরেকটি পাজল যোগ করুন
          </Button>
        )}
        <Button onClick={() => window.print()} variant="outline">
          🖨️ সব প্রিন্ট করুন
        </Button>
      </div>

      {/* Printable Area */}
      <div id="printable-area">
        {puzzles.map((puzzle, puzzleIndex) => {
          if (!puzzle.word.trim()) {
            return null; // Skip empty puzzle
          }

          return (
            <div
              key={puzzleIndex}
              className="border p-6 shadow bg-white mb-8 last:mb-0"
            >
              <h1 className="text-2xl font-bold text-center mb-4">
                বানান মজা
              </h1>
              <p className="text-center mb-6">
                নিচের অক্ষরগুলো ব্যবহার করে শব্দটি বানান করুন, তারপর সঠিক ছবিটি বৃত্তাকার করে চিহ্নিত করুন।
              </p>

              <div className="flex print:flex-row items-start justify-between gap-4">
                {/* Images Left (indexes 0 and 1) */}
                <div className="grid grid-cols-1 gap-2 w-full md:w-1/4">
                  {puzzle.images.slice(0, 2).map((img, i) =>
                    img ? (
                      <Image
                        key={i}
                        src={img}
                        height={80}
                        width={80}
                        className="mx-auto max-h-24"
                        alt={`অপশন ${i + 1}`}
                      />
                    ) : null
                  )}
                </div>

                {/* Scrambled Letters & Blank Boxes */}
                <div className="flex-1 text-center">
                  {/* Scrambled letters */}
                  <div className="flex justify-center mb-4">
                    {puzzle.scrambled.map((letter, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 border flex items-center justify-center text-lg font-semibold mx-1"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  {/* Empty boxes for writing the correct word */}
                  <div className="flex justify-center">
                    {puzzle.word && 
                      splitIntoGraphemes(puzzle.word).map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 border border-dashed border-gray-400 mx-1"
                        />
                      ))
                    }
                  </div>
                </div>

                {/* Images Right (indexes 2 and 3) */}
                <div className="grid grid-cols-1 gap-2 w-full md:w-1/4">
                  {puzzle.images.slice(2, 4).map((img, i) =>
                    img ? (
                      <Image
                        key={i}
                        src={img}
                        height={80}
                        width={80}
                        className="mx-auto max-h-24"
                        alt={`অপশন ${i + 3}`}
                      />
                    ) : null
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to split Bangla word into grapheme clusters
function splitIntoGraphemes(str: string): string[] {
  const splitter = new GraphemeSplitter();
  const clusters = splitter.splitGraphemes(str);
  const vowelSigns = new Set(['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ']);
  const merged: string[] = [];
  for (let i = 0; i < clusters.length; i++) {
    if (vowelSigns.has(clusters[i]) && merged.length > 0) {
      merged[merged.length - 1] += clusters[i];
    } else {
      merged.push(clusters[i]);
    }
  }
  return merged;
}
