'use client';
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { dummyEndings } from '@/constant';

// Expanded list of 200 dummy endings (for hard difficulty mode).


const generateEasyEndings = (endingsArray: string[]): string[] => {
  const arr = [...endingsArray];
  if (arr.length > 1) {
    const i = Math.floor(Math.random() * arr.length);
    let j = Math.floor(Math.random() * arr.length);
    while (j === i) {
      j = Math.floor(Math.random() * arr.length);
    }
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const generateHardEndings = (endingsArray: string[]): string[] => {
  const shuffled = shuffleArray(endingsArray);
  // Add one dummy for every 3 endings (at least one dummy).
  const numDummy = Math.max(1, Math.floor(endingsArray.length / 3));
  for (let i = 0; i < numDummy; i++) {
    const dummy = dummyEndings[Math.floor(Math.random() * dummyEndings.length)];
    shuffled.push(dummy);
  }
  return shuffleArray(shuffled);
};

const shuffleArray = (array: string[]): string[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const MatchSentenceHalves: React.FC = () => {
  const [beginningsText, setBeginningsText] = useState<string>('');
  const [endingsText, setEndingsText] = useState<string>('');
  const [beginnings, setBeginnings] = useState<string[]>([]);
  const [endings, setEndings] = useState<string[]>([]);
  const [shuffledEndings, setShuffledEndings] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('medium');

  const handleGenerate = () => {
    const linesBeginnings = beginningsText.split(/\r?\n/).filter((line) => line.trim() !== '');
    const linesEndings = endingsText.split(/\r?\n/).filter((line) => line.trim() !== '');

    if (linesBeginnings.length === 0 || linesEndings.length === 0) {
      alert('Please provide at least one line for both sentence beginnings and endings.');
      return;
    }

    setBeginnings(linesBeginnings);
    setEndings(linesEndings);

    if (difficulty === 'easy') {
      setShuffledEndings(generateEasyEndings(linesEndings));
    } else if (difficulty === 'hard') {
      setShuffledEndings(generateHardEndings(linesEndings));
    } else {
      setShuffledEndings(shuffleArray(linesEndings));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintAnswer = () => {
    const printContents = document.getElementById('printable-answers')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        alert('Popup blocked. Please allow popups for this website.');
        return;
      }
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Answers</title>
            <style>
              @page { size: A4 portrait; margin: 20mm; }
              body { font-family: sans-serif; }
              .answer-card {
                border: 1px solid #ccc;
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                page-break-inside: avoid;
                break-inside: avoid;
              }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {/* Global print styling for A4 portrait view */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .card,
          .ending-dotted,
          .answer-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        .card {
          border: 1px solid #ccc;
          padding: 8px;
          margin: 4px 0;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .ending-dotted {
          border: 2px dotted #333;
          padding: 8px;
          margin: 4px 0;
          border-radius: 4px;
        }
      `}</style>

      <h1 className="text-3xl font-bold mb-2">Match the Sentence Halves</h1>
      <p className="mb-6 font-medium text-lg">
        Cut the ending sentence ending and glue with appropriate sentence beginning
      </p>

      <div className="flex flex-col space-y-4 mb-6">
        <div>
          <label className="font-semibold block mb-1">
            Sentence Beginnings (one per line):
          </label>
          <textarea
            value={beginningsText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBeginningsText(e.target.value)}
            placeholder="Enter sentence beginnings, one per line."
            className="textarea textarea-bordered w-full h-40"
          ></textarea>
        </div>
        <div>
          <label className="font-semibold block mb-1">
            Sentence Endings (one per line):
          </label>
          <textarea
            value={endingsText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEndingsText(e.target.value)}
            placeholder="Enter sentence endings, one per line."
            className="textarea textarea-bordered w-full h-40"
          ></textarea>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="difficulty" className="font-semibold">
            Difficulty:
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="select select-bordered"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <Button onClick={handleGenerate}>Generate Puzzle</Button>
      </div>

      {(beginnings.length > 0 || endings.length > 0) && (
        <div id="printable-area">
          <div className="mb-8">
            <p className="mb-6 font-medium text-lg">
              Cut the ending sentence ending and glue with appropriate sentence beginning
            </p>
            <h2 className="text-2xl font-bold mb-4">Sentence Beginnings</h2>
            {beginnings.map((beginning, index) => (
              <div key={index} className="card bg-white">
                <p>{beginning}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Sentence Endings</h2>
            {shuffledEndings.map((ending, index) => (
              <div key={index} className="ending-dotted bg-white">
                <span>{ending}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(beginnings.length > 0 || endings.length > 0) && (
        <div className="mt-4 flex gap-4 justify-center">
          <Button onClick={handlePrint}>Print Puzzle</Button>
          <Button onClick={handlePrintAnswer}>Print Answer</Button>
        </div>
      )}

      {(beginnings.length > 0 || endings.length > 0) && (
        <div id="printable-answers" className="hidden">
          <h2 className="text-2xl font-bold mb-4">Answer Key</h2>
          {beginnings.map((beginning, index) => {
            const ending = endings[index] || '';
            return (
              <div key={index} className="answer-card bg-white">
                <p>
                  <strong>{beginning}</strong> {ending}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchSentenceHalves;
