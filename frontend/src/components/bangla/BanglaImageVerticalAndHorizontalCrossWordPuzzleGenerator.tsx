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
  orientation: 'horizontal' | 'vertical';
}

// grapheme-splitter ব্যবহার করে বাংলা শব্দকে গ্রাফিম ক্লাস্টারে ভাগ করে,
// যাতে স্বরবর্ণগুলো সংশ্লিষ্ট ব্যঞ্জনবর্ণের সাথে একসাথে থাকে।
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

const ImageVerticalAndHorizontalCrossWordPuzzleGenerator: React.FC = () => {
  // প্রতিটি পাজলের জন্য ছবি ও শব্দ ইনপুট ফিল্ড
  const [puzzles, setPuzzles] = useState<PuzzleInput[]>([
    { id: 1, imageUrl: null, word: '' },
  ]);
  // সাবমিশনের পরে, ফাইনাল পাজলগুলিতে গ্রিড তথ্য, ক্রমানুসারিক নম্বর, ও অরিয়েন্টেশন থাকবে
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

  // নির্দিষ্ট পাজল ফিল্ড মুছে ফেলুন
  const removePuzzle = (id: number) => {
    setPuzzles(puzzles.filter((puzzle) => puzzle.id !== id));
  };

  // ফর্ম সাবমিশন হ্যান্ডলার:
  // যাচাই করে প্রতিটি পাজলের জন্য ছবি ও শব্দ আছে কিনা এবং শব্দের দৈর্ঘ্য ১৬ অক্ষরের বেশি না।
  // এখানে আমরা splitIntoGraphemes ব্যবহার করে শব্দের দৈর্ঘ্য নির্ধারণ করছি, যাতে স্বরবর্ণগুলো সঠিকভাবে একসাথে থাকে।
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    const computedPuzzles: PuzzleFinal[] = puzzles.map((puzzle, index) => {
      const graphemes = splitIntoGraphemes(puzzle.word);
      const wordLength = graphemes.length;
      // অরিয়েন্টেশন: সূচক অনুযায়ী, জোড় হলে horizontal, বিজোড় হলে vertical
      const orientation: 'horizontal' | 'vertical' = index % 2 === 0 ? 'horizontal' : 'vertical';
      let row = 0;
      let col = 0;

      if (orientation === 'horizontal') {
        // অনুভূমিক: এমন সারি (০-১৫) ও এমন কলাম নির্বাচন করুন যাতে শব্দটি ফিট হয়।
        row = Math.floor(Math.random() * 16);
        col = Math.floor(Math.random() * (16 - wordLength + 1));
      } else {
        // উল্লম্ব: এমন কলাম (০-১৫) ও এমন সারি নির্বাচন করুন যাতে শব্দটি ফিট হয়।
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

  // ১৬x১৬ গ্রিড রেন্ডার করুন।
  // অনুভূমিক পাজলের জন্য: যদি r === row এবং c [col, col+wordLength) এর মধ্যে থাকে, ব্যাকগ্রাউন্ড সাদা।
  // উল্লম্ব পাজলের জন্য: যদি c === col এবং r [row, row+wordLength) এর মধ্যে থাকে, ব্যাকগ্রাউন্ড সাদা;
  // শুরুর সেলে (প্রথম সেল) পাজলের নম্বর দেখান।
  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
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

  // শুধুমাত্র #printable-area এর বিষয়বস্তু প্রিন্ট হবে
  const handlePrint = () => {
    window.print();
  };

  // অনুভূমিক ও উল্লম্ব পাজল আলাদা করে বের করা (প্রদর্শনের জন্য)
  const horizontalPuzzles = finalPuzzles.filter((p) => p.orientation === 'horizontal');
  const verticalPuzzles = finalPuzzles.filter((p) => p.orientation === 'vertical');

  return (
    <div className="container mx-auto p-4">
      {/* প্রিন্ট স্টাইলস */}
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
        মিশ্র ওরিয়েন্টেশন ক্রসওয়ার্ড পাজল অ্যাপ
      </h1>

      {/* ১) পাজল ইনপুট ফর্ম */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">পাজল #{index + 1}</h2>
            <div className="flex flex-col md:flex-row items-center justify-start gap-10">
              <div className="mb-2 flex flex-col items-start gap-2">
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
              <div className="mb-2 flex flex-col items-start gap-2">
                <label className="block text-sm font-medium">
                  শব্দ:
                </label>
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

      {/* ২) পাজল ও ছবির প্রদর্শনী */}
      {finalPuzzles.length > 0 && (
        <div id="printable-area" className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            সঠিক বাক্সে ছবির নাম লিখুন
          </h2>

          {/* বিন্যাস:
              - উপরের সারিতে অনুভূমিক পাজলের ছবি
              - নিচের সারিতে, বাম পাশে গ্রিড ও ডান পাশে উল্লম্ব পাজলের ছবি
          */}
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
                      alt={`পাজল ${puzzle.number}`}
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
                        alt={`পাজল ${puzzle.number}`}
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

      {/* ৩) প্রিন্ট বোতাম */}
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

export default ImageVerticalAndHorizontalCrossWordPuzzleGenerator;
