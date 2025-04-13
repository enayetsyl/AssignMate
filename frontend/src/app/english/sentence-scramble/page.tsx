'use client';
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';

const SentenceScramble: React.FC = () => {
  const [textContent, setTextContent] = useState<string>('');
  const [originalSentences, setOriginalSentences] = useState<string[]>([]);
  const [scrambledSentences, setScrambledSentences] = useState<string[]>([]);

  // Simple scramble function that shuffles words using Fisher–Yates.
  const scrambleSentence = (sentence: string): string => {
    const words = sentence.split(' ');
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words.join(' ');
  };

  // Generate puzzles by splitting all non-empty lines, storing original sentences,
  // and generating scrambled sentences.
  const handleGenerate = () => {
    const lines = textContent.split(/\r?\n/).filter((line) => line.trim() !== '');
    setOriginalSentences(lines);
    const scrambles = lines.map((sentence) => scrambleSentence(sentence));
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
            .card { border: 1px solid #ccc; padding: 8px; margin-bottom: 10px; }
            .font-semibold { font-weight: 600; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Delay printing to allow the content to load properly.
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
      `}</style>

      <h1 className="text-3xl font-bold mb-6">Scrambled Sentence Puzzle Generator</h1>
      
      <div className="flex flex-col space-y-4 mb-6">
        <textarea
          value={textContent}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTextContent(e.target.value)}
          placeholder="Enter sentences, one per line."
          className="textarea textarea-bordered w-full h-40"
        ></textarea>
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
