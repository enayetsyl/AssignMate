'use client';
import React, { useState } from 'react';

export default function TriArrowSVGPage() {
  //
  // 1) Puzzle Type
  //
  type Puzzle = {
    top: number | null;
    left: number | null;
    right: number | null;

    arrowLeftOp: '+' | '-';
    arrowLeftVal: number;
    arrowRightOp: '+' | '-';
    arrowRightVal: number;

    arrowHorizontalOp: '+' | '-';
    arrowHorizontalVal: number;

    solution: {
      top: number;
      left: number;
      right: number;
    };
  };

  //
  // 2) Puzzle Generation
  //
  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generatePuzzle(): Puzzle {
    // Top circle
    const topNumber = getRandomInt(1, 20);

    // Top → Left arrow
    const arrowLeftOp = Math.random() < 0.5 ? '+' : '-';
    const arrowLeftVal = getRandomInt(1, 10);
    const leftNumber =
      arrowLeftOp === '+'
        ? topNumber + arrowLeftVal
        : topNumber - arrowLeftVal;

    // Top → Right arrow
    const arrowRightOp = Math.random() < 0.5 ? '+' : '-';
    const arrowRightVal = getRandomInt(1, 10);
    const rightNumber =
      arrowRightOp === '+'
        ? topNumber + arrowRightVal
        : topNumber - arrowRightVal;

    // Left → Right arrow (horizontal)
    let arrowHorizontalOp: '+' | '-';
    let arrowHorizontalVal: number;
    if (leftNumber > rightNumber) {
      arrowHorizontalOp = '-';
      arrowHorizontalVal = leftNumber - rightNumber;
    } else {
      arrowHorizontalOp = '+';
      arrowHorizontalVal = rightNumber - leftNumber;
    }

    return {
      top: topNumber,
      left: null,
      right: null,
      arrowLeftOp,
      arrowLeftVal,
      arrowRightOp,
      arrowRightVal,
      arrowHorizontalOp,
      arrowHorizontalVal,
      solution: {
        top: topNumber,
        left: leftNumber,
        right: rightNumber,
      },
    };
  }

  function generatePuzzles(count: number): Puzzle[] {
    const puzzles: Puzzle[] = [];
    for (let i = 0; i < count; i++) {
      puzzles.push(generatePuzzle());
    }
    return puzzles;
  }

  //
  // 3) State: We'll generate 8 puzzles (2 columns × 4 rows)
  //
  const [puzzles, setPuzzles] = useState(() => generatePuzzles(8));

  //
  // 4) Handlers
  //
  const handleRegenerate = () => {
    setPuzzles(generatePuzzles(8));
  };

  const handlePrint = () => {
    window.print();
  };

  //
  // 5) Rendering
  //
  return (
    <>
      {/* Global print CSS */}
      <style jsx global>{`
        @page {
          size: A4 portrait; /* Force A4 portrait */
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          /* Show only .worksheet in print */
          .worksheet,
          .worksheet * {
            visibility: visible;
          }
          .worksheet {
            position: absolute;
            left: 0;
            top: 0;
            /* A4 portrait => 210mm wide, 297mm tall */
            width: 210mm;
            height: 297mm;
          }
          .print-button {
            display: none;
          }
        }
      `}</style>

      {/* Top bar (hidden on print) */}
      <div className="print-button flex gap-2 mb-4">
        <button
          onClick={handleRegenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Regenerate
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Print
        </button>
      </div>

      {/* Worksheet container that will be visible in print */}
      <div className="worksheet mx-auto p-4">
        {/* 2 columns × 4 rows = 8 puzzles */}
        {/* gap-4 => moderate space between puzzle boxes */}
        <div className="grid grid-cols-2 grid-rows-4 gap-4">
          {puzzles.map((puzzle, idx) => (
            <PuzzleSVG key={idx} puzzle={puzzle} />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * 6) A separate component that renders a single puzzle as an SVG
 */
function PuzzleSVG({ puzzle }: { puzzle: any }) {
  const {
    top,
    left,
    right,
    arrowLeftOp,
    arrowLeftVal,
    arrowRightOp,
    arrowRightVal,
    arrowHorizontalOp,
    arrowHorizontalVal,
  } = puzzle;

  // Circle radius
  const RADIUS = 15; // bigger circles

  // We'll make each puzzle's container bigger so the triangles are larger
  // Adjust w-56/h-56 as needed (Tailwind ~ 14rem, i.e. ~224px)
  // If you want them even bigger, try w-64/h-64, etc.
  return (
    <div className="relative w-56 h-56 mx-auto my-2">
      <svg
        className="w-full h-full"
        // We'll keep the same 120x100 coordinate system, but the container is bigger
        viewBox="0 0 120 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="black" />
          </marker>
        </defs>

        {/* Circle coordinates: spread out within 120x100 */}
        {/* Moved top circle slightly lower so it's not too close to the edge */}
        {/* Moved bottom circles to ~ (20,85) and (100,85) */}
        {/*
          Adjust if needed:
          - If circles get cut off, move them up/down or reduce RADIUS
        */}
        <PuzzleArrows
          topCircle={{ x: 60, y: 20 }}
          leftCircle={{ x: 20, y: 85 }}
          rightCircle={{ x: 100, y: 85 }}
          radius={RADIUS}
          arrowLeftOp={arrowLeftOp}
          arrowLeftVal={arrowLeftVal}
          arrowRightOp={arrowRightOp}
          arrowRightVal={arrowRightVal}
          arrowHorizontalOp={arrowHorizontalOp}
          arrowHorizontalVal={arrowHorizontalVal}
          top={top}
          left={left}
          right={right}
        />
      </svg>
    </div>
  );
}

/**
 * Sub-component for the actual lines, circles, text
 * So we can keep code a bit tidier
 */
function PuzzleArrows({
  topCircle,
  leftCircle,
  rightCircle,
  radius,
  arrowLeftOp,
  arrowLeftVal,
  arrowRightOp,
  arrowRightVal,
  arrowHorizontalOp,
  arrowHorizontalVal,
  top,
  left,
  right,
}: {
  topCircle: { x: number; y: number };
  leftCircle: { x: number; y: number };
  rightCircle: { x: number; y: number };
  radius: number;
  arrowLeftOp: '+' | '-';
  arrowLeftVal: number;
  arrowRightOp: '+' | '-';
  arrowRightVal: number;
  arrowHorizontalOp: '+' | '-';
  arrowHorizontalVal: number;
  top: number | null;
  left: number | null;
  right: number | null;
}) {
  // Helper to shift arrow endpoints
  function shiftLineEndpoints(
    cx1: number,
    cy1: number,
    cx2: number,
    cy2: number,
    r1: number,
    r2: number
  ) {
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) {
      return { x1: cx1, y1: cy1, x2: cx2, y2: cy2 };
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const x1 = cx1 + r1 * nx;
    const y1 = cy1 + r1 * ny;
    const x2 = cx2 - r2 * nx;
    const y2 = cy2 - r2 * ny;
    return { x1, y1, x2, y2 };
  }

  // Shift lines so they end at circle edges
  const lineTopLeft = shiftLineEndpoints(
    topCircle.x,
    topCircle.y,
    leftCircle.x,
    leftCircle.y,
    radius,
    radius
  );
  const lineTopRight = shiftLineEndpoints(
    topCircle.x,
    topCircle.y,
    rightCircle.x,
    rightCircle.y,
    radius,
    radius
  );
  const lineLeftRight = shiftLineEndpoints(
    leftCircle.x,
    leftCircle.y,
    rightCircle.x,
    rightCircle.y,
    radius,
    radius
  );

  // Midpoints
  function midpoint(x1: number, y1: number, x2: number, y2: number) {
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  }
  const midTopLeft = midpoint(
    lineTopLeft.x1,
    lineTopLeft.y1,
    lineTopLeft.x2,
    lineTopLeft.y2
  );
  const midTopRight = midpoint(
    lineTopRight.x1,
    lineTopRight.y1,
    lineTopRight.x2,
    lineTopRight.y2
  );
  const midLeftRight = midpoint(
    lineLeftRight.x1,
    lineLeftRight.y1,
    lineLeftRight.x2,
    lineLeftRight.y2
  );

  // Offsets to shift arrow labels
  const offsetTopLeft = { x: -10, y: -4 };
  const offsetTopRight = { x: 8, y: -4 };
  const offsetLeftRight = { x: 0, y: -6 };

  return (
    <>
      {/* Lines */}
      <line
        x1={lineTopLeft.x1}
        y1={lineTopLeft.y1}
        x2={lineTopLeft.x2}
        y2={lineTopLeft.y2}
        stroke="black"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
      />
      <line
        x1={lineTopRight.x1}
        y1={lineTopRight.y1}
        x2={lineTopRight.x2}
        y2={lineTopRight.y2}
        stroke="black"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
      />
      <line
        x1={lineLeftRight.x1}
        y1={lineLeftRight.y1}
        x2={lineLeftRight.x2}
        y2={lineLeftRight.y2}
        stroke="black"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
      />

      {/* Arrow operator text */}
      <text
        x={midTopLeft.x + offsetTopLeft.x}
        y={midTopLeft.y + offsetTopLeft.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {arrowLeftOp} {arrowLeftVal}
      </text>
      <text
        x={midTopRight.x + offsetTopRight.x}
        y={midTopRight.y + offsetTopRight.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {arrowRightOp} {arrowRightVal}
      </text>
      <text
        x={midLeftRight.x + offsetLeftRight.x}
        y={midLeftRight.y + offsetLeftRight.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {arrowHorizontalOp} {arrowHorizontalVal}
      </text>

      {/* Circles */}
      {/* Top circle */}
      <circle
        cx={topCircle.x}
        cy={topCircle.y}
        r={radius}
        fill="white"
        stroke="gray"
        strokeWidth="1"
      />
      <text
        x={topCircle.x}
        y={topCircle.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {top ?? ''}
      </text>

      {/* Bottom-left circle */}
      <circle
        cx={leftCircle.x}
        cy={leftCircle.y}
        r={radius}
        fill="white"
        stroke="gray"
        strokeWidth="1"
      />
      <text
        x={leftCircle.x}
        y={leftCircle.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {left === null ? '' : left}
      </text>

      {/* Bottom-right circle */}
      <circle
        cx={rightCircle.x}
        cy={rightCircle.y}
        r={radius}
        fill="white"
        stroke="gray"
        strokeWidth="1"
      />
      <text
        x={rightCircle.x}
        y={rightCircle.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {right === null ? '' : right}
      </text>
    </>
  );
}
