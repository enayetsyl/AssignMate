'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const BRIGHT_COLORS = [
  '#FF6363', // Bright Red
  '#FFA600', // Bright Orange
  '#FFBC42', // Lighter Orange
  '#45C367', // Leafy Green
  '#8AC926', // Lime Green
  '#1982C4', // Bright Blue
  '#6A4C93', // Purple
  '#FF595E', // Coral Red
  '#FF9B85', // Peach
  '#FFE74C', // Sunny Yellow
];

type Operation = 'addition' | 'subtraction';

interface ArithmeticQuestion {
  a: number;
  b: number;
  answer: number;
}

/**
 * Generate a list of random arithmetic questions.
 *
 * For "addition": a and b are random numbers from 1 to 50.
 * For "subtraction": a is from 20 to 100 and b from 1 to a.
 */
function generateArithmeticQuestions(
  count: number,
  operation: Operation
): ArithmeticQuestion[] {
  const questions: ArithmeticQuestion[] = [];
  for (let i = 0; i < count; i++) {
    let a: number, b: number;
    if (operation === 'addition') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      questions.push({
        a,
        b,
        answer: a + b,
      });
    } else if (operation === 'subtraction') {
      // Ensure a is larger than b so that the result is non-negative.
      a = Math.floor(Math.random() * 81) + 20; // 20..100
      b = Math.floor(Math.random() * a) + 1; // 1..a
      questions.push({
        a,
        b,
        answer: a - b,
      });
    }
  }
  return questions;
}

/**
 * Generate a 100-chart (10×10 grid) with blank cells and a fixed set of bright colors.
 */
function generateHundredChart(blanksCount: number) {
  // Array of numbers 1..100.
  const chartNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

  // Randomly choose positions (indexes 0–99) to be blank.
  const blankPositions: Set<number> = new Set();
  while (blankPositions.size < blanksCount) {
    const randomPos = Math.floor(Math.random() * 100);
    blankPositions.add(randomPos);
  }

  // For each cell, pick a random color from the fixed palette.
  const chartColors = Array.from({ length: 100 }, () => {
    const randomIndex = Math.floor(Math.random() * BRIGHT_COLORS.length);
    return BRIGHT_COLORS[randomIndex];
  });

  return { chartNumbers, blankPositions, chartColors };
}

/**
 * Opens a new window for printing with the given HTML content.
 * The page is set to A4 landscape with minimal margins.
 */
function openPrintWindow(title: string, printContents: string) {
  const printWindow = window.open('', '', 'width=1000,height=800');
  if (!printWindow) {
    alert('Popup blocked. Please allow popups for this website.');
    return;
  }
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
            font-size: 16px;
          }
          .instructions {
            margin-bottom: 1rem;
            font-weight: 500;
          }
          .container {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
          .section {
            flex: 1;
            margin-right: 1rem;
          }
          .questions-container {
            margin-bottom: 1rem;
          }
          .question {
            margin-bottom: 0.5rem;
            font-size: 16px;
          }
          .hundred-chart {
            display: flex;
            flex-wrap: wrap;
            width: 600px; /* 10 columns × 60px each */
            margin-left: auto;
            margin-right: auto;
          }
          .chart-cell {
            width: 60px;
            height: 60px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0; /* cells snug together */
            font-size: 16px;
            box-sizing: border-box;
          }
          h2 {
            margin-top: 0;
          }
        </style>
      </head>
      <body>
        <div class="instructions">${printContents}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

const HundredChartWorksheet: React.FC = () => {
  const [questionCount, setQuestionCount] = useState(5);
  const [blanksCount, setBlanksCount] = useState(10);
  const [operation, setOperation] = useState<Operation>('addition');

  const [questions, setQuestions] = useState<ArithmeticQuestion[]>([]);
  const [chartNumbers, setChartNumbers] = useState<number[]>([]);
  const [blankPositions, setBlankPositions] = useState<Set<number>>(new Set());
  const [chartColors, setChartColors] = useState<string[]>([]);

  /**
   * Generate new worksheet data.
   */
  const handleGenerate = () => {
    setQuestions(generateArithmeticQuestions(questionCount, operation));
    const { chartNumbers, blankPositions, chartColors } = generateHundredChart(blanksCount);
    setChartNumbers(chartNumbers);
    setBlankPositions(blankPositions);
    setChartColors(chartColors);
  };

  /**
   * Print the worksheet view.
   */
  const handlePrintWorksheet = () => {
    const instructionText =
      operation === 'addition'
        ? 'Complete the addition problems using the 100 chart below. Write your final answers in the blanks.'
        : 'Complete the subtraction problems using the 100 chart below. Write your final answers in the blanks.';
    let htmlContent = `
      <p>${instructionText}</p>
      <div class="container">
        <div class="section">
          <h2>${operation === 'addition' ? 'Addition' : 'Subtraction'} Questions</h2>
          <div class="questions-container">
    `;

    questions.forEach(({ a, b }) => {
      if (operation === 'addition') {
        htmlContent += `<div class="question">${a} + ${b} = ______</div>`;
      } else {
        htmlContent += `<div class="question">${a} - ${b} = ______</div>`;
      }
    });

    htmlContent += `
          </div>
        </div>
        <div class="section">
          <h2>100 Chart</h2>
          <div class="hundred-chart">
    `;

    chartNumbers.forEach((num, idx) => {
      const cellContent = blankPositions.has(idx) ? '' : `${num}`;
      const bgColor = chartColors[idx];
      htmlContent += `<div class="chart-cell" style="background-color: ${bgColor};">${cellContent}</div>`;
    });

    htmlContent += `
          </div>
        </div>
      </div>
    `;

    openPrintWindow('Arithmetic Worksheet', htmlContent);
  };

  /**
   * Print the answer view.
   */
  const handlePrintAnswer = () => {
    const instructionText =
      operation === 'addition'
        ? 'Answer Key: The answers to the addition problems and the complete 100 chart.'
        : 'Answer Key: The answers to the subtraction problems and the complete 100 chart.';
    let htmlContent = `
      <p>${instructionText}</p>
      <div class="container">
        <div class="section">
          <h2>${operation === 'addition' ? 'Addition' : 'Subtraction'} Answers</h2>
          <div class="questions-container">
    `;

    questions.forEach(({ a, b, answer }) => {
      if (operation === 'addition') {
        htmlContent += `<div class="question">${a} + ${b} = ${answer}</div>`;
      } else {
        htmlContent += `<div class="question">${a} - ${b} = ${answer}</div>`;
      }
    });

    htmlContent += `
          </div>
        </div>
        <div class="section">
          <h2>100 Chart</h2>
          <div class="hundred-chart">
    `;

    chartNumbers.forEach((num, idx) => {
      const bgColor = chartColors[idx];
      htmlContent += `<div class="chart-cell" style="background-color: ${bgColor};">${num}</div>`;
    });

    htmlContent += `
          </div>
        </div>
      </div>
    `;

    openPrintWindow('Arithmetic Worksheet - Answers', htmlContent);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Global print styling */}
      <style jsx global>{`
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
      `}</style>

      <h1 className="text-2xl font-bold mb-4 text-center">
        Arithmetic Worksheet with 10×10 100 Chart
      </h1>

      {/* Operation selection */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="operation"
              value="addition"
              checked={operation === 'addition'}
              onChange={() => setOperation('addition')}
              className="form-radio"
            />
            <span>Addition</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="operation"
              value="subtraction"
              checked={operation === 'subtraction'}
              onChange={() => setOperation('subtraction')}
              className="form-radio"
            />
            <span>Subtraction</span>
          </label>
        </div>

        {/* Question count control */}
        <div>
          <label className="mr-2">Number of questions:</label>
          <input
            type="number"
            min={1}
            max={20}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="border px-2 py-1"
          />
        </div>

        {/* Blanks count control */}
        <div>
          <label className="mr-2">Number of blanks in 100-chart:</label>
          <input
            type="number"
            min={0}
            max={100}
            value={blanksCount}
            onChange={(e) => setBlanksCount(Number(e.target.value))}
            className="border px-2 py-1"
          />
        </div>

        <Button onClick={handleGenerate}>Generate Worksheet</Button>

        {questions.length > 0 && chartNumbers.length > 0 && (
          <div className="flex space-x-4">
            <Button onClick={handlePrintWorksheet}>Print Worksheet</Button>
            <Button onClick={handlePrintAnswer}>Print Answer</Button>
          </div>
        )}
      </div>

      {/* On-screen preview */}
      {questions.length > 0 && chartNumbers.length > 0 && (
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {operation === 'addition' ? 'Addition' : 'Subtraction'} Questions
            </h2>
            {questions.map(({ a, b }, i) => (
              <div key={i} className="mb-1 text-lg">
                {operation === 'addition' ? `${a} + ${b} = ______` : `${a} - ${b} = ______`}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">100 Chart</h2>
            <div className="flex flex-wrap border" style={{ width: '600px' }}>
              {chartNumbers.map((num, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center border"
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: chartColors[idx],
                  }}
                >
                  {blankPositions.has(idx) ? '' : num}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HundredChartWorksheet;