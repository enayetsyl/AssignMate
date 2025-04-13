'use client';
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { dummyWords } from '@/constant';

const SentenceScramble: React.FC = () => {
  const [textContent, setTextContent] = useState<string>('');
  const [originalSentences, setOriginalSentences] = useState<string[]>([]);
  const [scrambledSentences, setScrambledSentences] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('medium');

  // Medium difficulty: fully scramble all words using Fisher–Yates.
  const scrambleSentence = (sentence: string): string => {
    const words = sentence.split(' ');
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words.join(' ');
  };

  // Easy difficulty: keep the first and last words fixed and shuffle only the middle words.
  const scrambleSentenceEasy = (sentence: string): string => {
    const words = sentence.split(' ');
    if (words.length <= 3) {
      // If it's very short, just do the normal scramble
      return scrambleSentence(sentence);
    }
    const middleWords = words.slice(1, words.length - 1);
    for (let i = middleWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middleWords[i], middleWords[j]] = [middleWords[j], middleWords[i]];
    }
    return [words[0], ...middleWords, words[words.length - 1]].join(' ');
  };

  // Hard difficulty: scramble fully and insert random dummy words.
  const scrambleSentenceHard = (sentence: string): string => {
    const scrambled = scrambleSentence(sentence);
    const words = scrambled.split(' ');
    // Insert one or two dummy words depending on sentence length
    const numDummy = words.length >= 6 ? 2 : 1;
    for (let i = 0; i < numDummy; i++) {
      const dummy = dummyWords[Math.floor(Math.random() * dummyWords.length)];
      const randomIndex = Math.floor(Math.random() * (words.length + 1));
      words.splice(randomIndex, 0, dummy);
    }
    return words.join(' ');
  };

  // Decide which scramble method to use based on the selected difficulty.
  const getScrambledSentence = (sentence: string): string => {
    if (difficulty === 'easy') {
      return scrambleSentenceEasy(sentence);
    } else if (difficulty === 'hard') {
      return scrambleSentenceHard(sentence);
    }
    return scrambleSentence(sentence);
  };

  // Generate puzzles: split the input into lines, store the originals, and produce scrambled versions.
  const handleGenerate = () => {
    const lines = textContent.split(/\r?\n/).filter((line) => line.trim() !== '');
    setOriginalSentences(lines);
    const scrambles = lines.map((sentence) => getScrambledSentence(sentence));
    setScrambledSentences(scrambles);
  };

  // Helper function to create a printable window and delay the print.
  const openPrintWindow = (title: string, printContents: string) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups for this website.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: sans-serif; }

            /* Prevent splitting a card across pages. */
            .card {
              border: 1px solid #ccc;
              padding: 8px;
              margin-bottom: 10px;
              page-break-inside: avoid;  /* older spec */
              break-inside: avoid;       /* modern spec */
            }

            .font-semibold { font-weight: 600; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Delay printing to allow content to load properly.
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Print only the questions.
  const handlePrintQuestions = () => {
    const printContents = document.getElementById('printable-questions')?.innerHTML;
    if (printContents) {
      openPrintWindow('Print Questions', printContents);
    }
  };

  // Print only the answers.
  const handlePrintAnswers = () => {
    const printContents = document.getElementById('printable-answers')?.innerHTML;
    if (printContents) {
      openPrintWindow('Print Answers', printContents);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {/* Global print styling for A4 portrait */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
        @media print {
          .card {
            page-break-inside: avoid; 
            break-inside: avoid;
          }
        }
      `}</style>

      <h1 className="text-3xl font-bold mb-6">Scrambled Sentence Puzzle Generator</h1>
      
      <div className="flex flex-col space-y-4 mb-6">
        <textarea
          value={textContent}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTextContent(e.target.value)}
          placeholder="Enter sentences, one per line."
          className="textarea textarea-bordered w-full h-40"
        ></textarea>
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

      {scrambledSentences.length > 0 && (
        <div>
          {/* Printable Questions Section */}
          <div id="printable-questions">
            {scrambledSentences.map((scrambled, index) => (
              <div key={index} className="card border rounded bg-white shadow p-4 mb-4">
                <p className="mb-2">
                  <span className="font-semibold">Scrambled:</span> {scrambled}
                </p>
                <p>
                  <span className="font-semibold">Write Your Answer:</span>{' '}
                  ............................................................
                </p>
              </div>
            ))}
          </div>

          {/* Printable Answers Section - kept hidden on the main UI */}
          <div id="printable-answers" className="hidden">
            {originalSentences.map((sentence, index) => (
              <div key={index} className="card border rounded bg-white shadow p-4 mb-4">
                <p>
                  <span className="font-semibold">Answer {index + 1}:</span> {sentence}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-4">
            <Button onClick={handlePrintQuestions}>Print Questions</Button>
            <Button onClick={handlePrintAnswers}>Print Answers</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentenceScramble;
