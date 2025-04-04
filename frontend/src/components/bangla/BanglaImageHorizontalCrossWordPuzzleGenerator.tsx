'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import GraphemeSplitter from 'grapheme-splitter';

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

const BanglaImageHorizontalCrossWordPuzzleGenerator: React.FC = () => {
  // প্রতিটি পাজলের জন্য ছবি ও শব্দের ইনপুট ফিল্ড
  const [puzzles, setPuzzles] = useState<PuzzleInput[]>([
    { id: 1, imageUrl: null, word: '' },
  ]);
  // সাবমিশনের পরে, ফাইনাল পাজলগুলোতে গ্রিড তথ্য ও ক্রমানুসারে নম্বর থাকবে
  const [finalPuzzles, setFinalPuzzles] = useState<PuzzleFinal[]>([]);

  // নির্দিষ্ট পাজলের ছবি আপলোড হ্যান্ডলার
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

  // নির্দিষ্ট পাজলের শব্দ ইনপুট হ্যান্ডলার
  const handleWordChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPuzzles((prev) =>
      prev.map((puzzle) =>
        puzzle.id === id ? { ...puzzle, word: value } : puzzle
      )
    );
  };

  // নতুন পাজল ফিল্ড যোগ করুন (সর্বোচ্চ ১০টি)
  const addPuzzle = () => {
    if (puzzles.length < 10) {
      const newId =
        puzzles.length > 0 ? Math.max(...puzzles.map((p) => p.id)) + 1 : 1;
      setPuzzles([...puzzles, { id: newId, imageUrl: null, word: '' }]);
    }
  };

  // পাজল ফিল্ড রিমুভ করুন
  const removePuzzle = (id: number) => {
    setPuzzles(puzzles.filter((puzzle) => puzzle.id !== id));
  };

  // গ্রাফিম স্প্লিটার ব্যবহার করে বাংলা শব্দকে গ্রাফিম ক্লাস্টারে ভাগ করে দেয় (যাতে স্বরবর্ণ সঠিকভাবে যুক্ত থাকে)
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


  // ফর্ম সাবমিশন হ্যান্ডলার: যাচাই করে ও প্রতিটি পাজলের জন্য গ্রিড তথ্য তৈরি করে
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // যাচাই: প্রতিটি পাজলের জন্য ছবি ও শব্দ থাকা আবশ্যক, এবং শব্দ ১৬ অক্ষরের বেশি হতে পারবে না।
    for (const puzzle of puzzles) {
      if (!puzzle.imageUrl || !puzzle.word) {
        alert('প্রত্যেক পাজলের জন্য ছবি ও শব্দ উভয়ই প্রদান করুন।');
        return;
      }
      if (puzzle.word.length > 16) {
        alert('শব্দের দৈর্ঘ্য ১৬ অক্ষরের বেশি হতে পারবেনা।');
        return;
      }
    }

    // প্রতিটি পাজলের জন্য গ্রিড তথ্য তৈরি করুন। 
    // প্রতিটি পাজলের জন্য ১৬x১৬ গ্রিডের মধ্যে, শব্দটি অনুভূমিকভাবে ফিট করতে হবে।
    const computedPuzzles: PuzzleFinal[] = puzzles.map((puzzle, index) => {
      const wordLength = splitIntoGraphemes(puzzle.word).length;
      const row = Math.floor(Math.random() * 16);
      const col = Math.floor(Math.random() * (16 - wordLength + 1));
      return {
        ...puzzle,
        gridInfo: { row, col, wordLength },
        number: index + 1,
      };
    });

    setFinalPuzzles(computedPuzzles);
  };

  // 16x16 গ্রিডে, যদি কোনো সেল কোনো পাজলের অংশ হয় তবে সেটিকে সাদা ব্যাকগ্রাউন্ড দেয়, আর শুরুর সেলে পাজলের নম্বর দেখায়।
  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        let bgColor = 'bg-gray-300';
        let cellContent = '';

        finalPuzzles.forEach((puzzle) => {
          const { row, col, wordLength } = puzzle.gridInfo;
          if (r === row && c >= col && c < col + wordLength) {
            bgColor = 'bg-white';
            if (c === col) {
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

  // Print function: শুধুমাত্র #printable-area এর বিষয়বস্তু প্রিন্ট করবে।
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4">
      {/* প্রিন্ট স্টাইলস */}
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

      <h1 className="text-2xl font-bold mb-4">ক্রসওয়ার্ড পাজল অ্যাপ</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">পাজল #{index + 1}</h2>
            <div className="flex items-center justify-start gap-10">
              <div className="mb-2 flex justify-center items-center gap-5">
                <label className="block text-sm font-medium">
                  ছবি আপলোড করুন:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(puzzle.id, e)}
                  className="mt-1 border"
                />
              </div>
              <div className="mb-2 flex justify-center items-center gap-5">
                <label className="block text-sm font-medium">শব্দ:</label>
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
                সরান
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
            পাজল যোগ করুন
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          পাজল তৈরি করুন
        </button>
      </form>

      {finalPuzzles.length > 0 && (
        <div id="printable-area">
          {/* প্রতিটি পাজলের ছবি, নম্বর ও শব্দ দেখান */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              সঠিক বাক্সে ছবির নাম লিখুন
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
                      alt={`পাজল ${puzzle.number}`}
                      width={80}
                      height={80}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 16x16 গ্রিড রেন্ডার করুন */}
          {renderGrid()}
        </div>
      )}

      {finalPuzzles.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePrint}
            className="bg-indigo-500 text-white py-2 px-4 rounded"
          >
            পাজল প্রিন্ট করুন
          </button>
        </div>
      )}
    </div>
  );
};

export default BanglaImageHorizontalCrossWordPuzzleGenerator;
