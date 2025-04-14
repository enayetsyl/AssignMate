'use client';

import React, { useState, ChangeEvent } from 'react';
import GraphemeSplitter from 'grapheme-splitter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { BRIGHT_COLORS } from '@/constant';

// Define possible operations and languages
type Operation = 'add' | 'subtract' | 'multiply' | 'division';
type Language = 'english' | 'bangla';

interface MathProblem {
  letter: string;       // Single character (cluster) from the riddle answer
  operation: Operation;
  x: number;            // Operand 1
  y: number;            // Operand 2
  result: number;       // Computed numeric result
  color: string;        // Random color for the letter label
  originalIndex: number; // Where this letter appeared in the riddle answer
}

/* -----------------------------------------------------
   Utility Functions
----------------------------------------------------- */

// Return a random integer in [min, max]
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random hex color
function randomColor(): string {
  return BRIGHT_COLORS[getRandomInt(0, BRIGHT_COLORS.length - 1)];
}

// Convert digits to Bangla if language is "bangla"; otherwise return as string
function convertNumber(num: number, lang: Language): string {
  if (lang === 'english') return String(num);
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num)
    .split('')
    .map((ch) => (/\d/.test(ch) ? bnDigits[parseInt(ch, 10)] : ch))
    .join('');
}

/**
 * Create a math problem in the specified difficulty range with these constraints:
 * - Subtraction => no negative result
 * - Division => integer result
 * - Add/Multiply => no special constraint besides the range
 */
function generateMathProblem(
  op: Operation,
  level: number
): { x: number; y: number; result: number } {
  const min = Math.pow(10, level - 1);
  const max = Math.pow(10, level) - 1;
  const maxAttempts = 1000;

  if (op === 'add') {
    // Just pick any x,y in [min..max]
    for (let i = 0; i < maxAttempts; i++) {
      const x = getRandomInt(min, max);
      const y = getRandomInt(min, max);
      return { x, y, result: x + y };
    }
  } else if (op === 'subtract') {
    // Ensure x >= y, both in [min..max]
    for (let i = 0; i < maxAttempts; i++) {
      const x = getRandomInt(min, max);
      const y = getRandomInt(min, max);
      if (y <= x) {
        return { x, y, result: x - y };
      }
    }
  } else if (op === 'multiply') {
    // x,y in [min..max]
    for (let i = 0; i < maxAttempts; i++) {
      const x = getRandomInt(min, max);
      const y = getRandomInt(min, max);
      return { x, y, result: x * y };
    }
  } else {
    // Division: x,y in [min..max], x%y=0 => integer result
    for (let i = 0; i < maxAttempts; i++) {
      const x = getRandomInt(min, max);
      // Find divisors of x that are also in [min..max]
      const possibleDivisors: number[] = [];
      for (let d = min; d <= max; d++) {
        if (x % d === 0) {
          possibleDivisors.push(d);
        }
      }
      if (possibleDivisors.length > 0) {
        const y = possibleDivisors[getRandomInt(0, possibleDivisors.length - 1)];
        return { x, y, result: x / y };
      }
    }
  }

  // Fallback if no suitable pair found
  return { x: min, y: min, result: 0 };
}

// Shuffle array in place
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Merges any Bangla vowel sign with the preceding consonant cluster.
 * E.g., "প" + "ি" => "পি"
 */
function splitBanglaClusters(str: string): string[] {
  const splitter = new GraphemeSplitter();
  const rawClusters = splitter.splitGraphemes(str);
  // Known Bangla vowel signs
  const vowelSigns = new Set(['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ']);

  const merged: string[] = [];
  for (let i = 0; i < rawClusters.length; i++) {
    const cluster = rawClusters[i];
    if (vowelSigns.has(cluster) && merged.length > 0) {
      // Append the vowel sign to the previous cluster
      merged[merged.length - 1] += cluster;
    } else {
      merged.push(cluster);
    }
  }
  return merged;
}

/**
 * Split the riddle answer into letters/clusters:
 * - For English, remove spaces and do .split("")
 * - For Bangla, also remove spaces, but use the custom function that merges vowel signs
 */
function splitIntoLetters(str: string, lang: Language): string[] {
  const cleaned = str.replace(/\s+/g, '');
  if (lang === 'english') {
    return cleaned.split('');
  } else {
    // Bangla approach: ensure vowel signs attach to preceding cluster
    return splitBanglaClusters(cleaned);
  }
}

// Map operation => symbol
function getOpSymbol(op: Operation): string {
  switch (op) {
    case 'add':
      return '+';
    case 'subtract':
      return '-';
    case 'multiply':
      return '×';
    case 'division':
      return '÷';
  }
}

const AdvancedDynamicMathPuzzle: React.FC = () => {
  const [riddle, setRiddle] = useState('');
  const [answer, setAnswer] = useState('');

  const [language, setLanguage] = useState<Language>('english');

  const [operations, setOperations] = useState<Operation[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);

  // The final generated math problems
  const [problems, setProblems] = useState<MathProblem[]>([]);

  // Handle multiple operations via <select multiple>
  const handleOperationsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value as Operation
    );
    setOperations(selected);
  };

  // Build puzzle
  const handleGenerate = () => {
    if (!riddle.trim() || !answer.trim()) {
      alert('Please provide both a riddle and its answer.');
      return;
    }
    if (operations.length === 0) {
      alert('Please select at least one operation.');
      return;
    }
    // Split answer into letters (merging vowels if Bangla)
    const letters = splitIntoLetters(answer, language);
    if (letters.length === 0) {
      alert('Your riddle answer has no valid letters.');
      return;
    }
    // For each letter, generate a math problem. Shuffle the final array.
    const newProblems: MathProblem[] = letters.map((letter, index) => {
      const op = operations[getRandomInt(0, operations.length - 1)];
      const { x, y, result } = generateMathProblem(op, difficultyLevel);
      return {
        letter: letter.toUpperCase(), // or keep as-is if you prefer
        operation: op,
        x,
        y,
        result,
        color: randomColor(),
        originalIndex: index,
      };
    });
    setProblems(shuffleArray(newProblems));
  };

  // Print helper
  const openPrintWindow = (title: string, content: string) => {
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
            body { font-family: sans-serif; margin: 0; padding: 0; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 16px; }
            .problem-row { display: flex; align-items: center; margin-bottom: 10px; font-size: 16px; }
            .letter { width: 30px; font-weight: bold; margin-right: 8px; }
            .expression { width: 150px; }
            .answer-line {
              display: inline-block;
              border-bottom: 1px solid #000;
              width: 80px;
              margin-left: 8px;
            }
            .bottom-row {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
              gap: 12px;
              margin-top: 24px;
              font-weight: bold;
            }
            .result-slot {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 8px;
            }
            .letter-line {
              border-bottom: 1px solid #000;
              width: 20px;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Print puzzle with blank lines (top: shuffled), bottom row in correct order
  const handlePrintPuzzle = () => {
    if (problems.length === 0) {
      alert('No puzzle generated yet.');
      return;
    }
    let content = `
      <div class="header">
        <h2>${riddle}</h2>
        <p>(Solve each math problem and match its result with the correct letter to reveal the answer!)</p>
      </div>
    `;
    // Shuffled top
    problems.forEach((p) => {
      const xVal = convertNumber(p.x, language);
      const yVal = convertNumber(p.y, language);
      const symbol = getOpSymbol(p.operation);
      content += `
        <div class="problem-row">
          <div class="letter" style="color: ${p.color}">${p.letter}</div>
          <div class="expression">${xVal} ${symbol} ${yVal} =</div>
          <div class="answer-line"></div>
        </div>
      `;
    });
    // Bottom row: sorted by originalIndex
    const sortedByOriginal = [...problems].sort((a, b) => a.originalIndex - b.originalIndex);
    content += '<div class="bottom-row">';
    sortedByOriginal.forEach((p) => {
      const rVal = convertNumber(p.result, language);
      content += `
        <div class="result-slot">
          <div class="letter-line"></div>
          <div>${rVal}</div>
        </div>
      `;
    });
    content += '</div>';
    openPrintWindow('Print Puzzle', content);
  };

  // Print answer (top: shuffled with results, bottom: correct order)
  const handlePrintAnswer = () => {
    if (problems.length === 0) {
      alert('No puzzle generated yet.');
      return;
    }
    let content = `
      <div class="header">
        <h2>${riddle}</h2>
        <p>Answer Key</p>
      </div>
    `;
    problems.forEach((p) => {
      const xVal = convertNumber(p.x, language);
      const yVal = convertNumber(p.y, language);
      const symbol = getOpSymbol(p.operation);
      const rVal = convertNumber(p.result, language);
      content += `
        <div class="problem-row">
          <div class="letter" style="color: ${p.color}">${p.letter}</div>
          <div class="expression">${xVal} ${symbol} ${yVal} =</div>
          <div class="answer-line">${rVal}</div>
        </div>
      `;
    });
    // Bottom row
    const sortedByOriginal = [...problems].sort((a, b) => a.originalIndex - b.originalIndex);
    content += '<div class="bottom-row">';
    sortedByOriginal.forEach((p) => {
      const val = convertNumber(p.result, language);
      content += `
        <div class="result-slot">
          <div class="letter-line"></div>
          <div>${val}</div>
        </div>
      `;
    });
    content += '</div>';
    openPrintWindow('Print Answer', content);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-6">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
      `}</style>

      <h1 className="text-2xl font-bold text-center">
        Dynamic Math Riddle Puzzle
      </h1>

      {/* Puzzle Setup Controls */}
      <div className="max-w-xl mx-auto space-y-4">
        <div>
          <Label htmlFor="riddle" className="font-semibold">
            Riddle Text
          </Label>
          <Input
            id="riddle"
            placeholder="E.g. What has lots of keys but can't open any doors?"
            value={riddle}
            onChange={(e) => setRiddle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="answer" className="font-semibold">
            Riddle Answer
          </Label>
          <Input
            id="answer"
            placeholder="E.g. piano"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>

        {/* Language */}
        <div>
          <Label className="font-semibold">Language</Label>
          <Select
            onValueChange={(val) => setLanguage(val as Language)}
            value={language}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="bangla">Bangla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Level */}
        <div>
          <Label className="font-semibold">Difficulty Level</Label>
          <Select
            onValueChange={(val) => setDifficultyLevel(parseInt(val, 10))}
            value={difficultyLevel.toString()}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Level 1 (1-digit math)</SelectItem>
              <SelectItem value="2">Level 2 (2-digit math)</SelectItem>
              <SelectItem value="3">Level 3 (3-digit math)</SelectItem>
              <SelectItem value="4">Level 4 (4-digit math)</SelectItem>
              <SelectItem value="5">Level 5 (5-digit math)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Multi-select for operations */}
        <div>
          <Label className="font-semibold">Select Operations</Label>
          <select
            multiple
            className="border p-2 w-full rounded-md"
            value={operations}
            onChange={handleOperationsChange}
          >
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
            <option value="multiply">Multiply</option>
            <option value="division">Division</option>
          </select>
          <small className="block text-gray-500">
            (Hold Ctrl/Cmd to select multiple)
          </small>
        </div>

        <Button onClick={handleGenerate}>Generate Puzzle</Button>
      </div>

      {/* Puzzle Preview */}
      {problems.length > 0 && (
        <div className="max-w-xl mx-auto mt-8 space-y-4">
          <div className="flex justify-center gap-4">
            <Button onClick={handlePrintPuzzle}>Print Puzzle</Button>
            <Button onClick={handlePrintAnswer}>Print Answer</Button>
          </div>

          <div className="text-center text-lg font-semibold mt-4 mb-2">
            Preview (Letters Shuffled; Blank Lines for Offline Solving)
          </div>

          {/* Display the shuffled problems with blank lines */}
          <div>
            {problems.map((p, idx) => {
              const xVal = convertNumber(p.x, language);
              const yVal = convertNumber(p.y, language);
              const symbol = getOpSymbol(p.operation);
              return (
                <div key={idx} className="flex items-center mb-2">
                  <span
                    style={{ color: p.color, width: '30px' }}
                    className="font-bold"
                  >
                    {p.letter}
                  </span>
                  <span className="w-28">
                    {xVal} {symbol} {yVal} =
                  </span>
                  <div className="border-b border-black w-24 ml-2" />
                </div>
              );
            })}
          </div>

          {/* Bottom row in correct order */}
          <div className="flex justify-center items-center gap-4 font-semibold mt-6">
            {[...problems]
              .sort((a, b) => a.originalIndex - b.originalIndex)
              .map((p, i) => {
                const val = convertNumber(p.result, language);
                return (
                  <div key={i} className="flex flex-col items-center p-2">
                    {/* short line for letter */}
                    <div className="border-b border-black w-6 mb-1" />
                    {/* numeric result */}
                    {val}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDynamicMathPuzzle;
