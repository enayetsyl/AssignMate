'use client';
import React, { useState } from 'react';

// --- SHADCN UI IMPORTS (adjust paths to match your project) ---
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------------

type Difficulty = 'easy' | 'medium' | 'hard';

// Extended list of shapes
type ShapeType =
  | 'circle'
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'pentagon'
  | 'hexagon'
  | 'heptagon'
  | 'octagon'
  | 'nonagon'
  | 'decagon'
  | 'oval'
  | 'rhombus'
  | 'parallelogram'
  | 'trapezium'
  | 'trapezoid'
  | 'kite'
  | 'star';

type Puzzle = {
  top: number | null;
  left: number | null;
  right: number | null;

  arrowLeftOp: string;
  arrowLeftVal: number;
  arrowRightOp: string;
  arrowRightVal: number;

  arrowHorizontalOp: string;
  arrowHorizontalVal: number;
};

export default function MathTriangleGenerator() {
  //
  // 1) State
  //
  const [title, setTitle] = useState('My Puzzle Worksheet');

  // Operators for puzzle generation
  const [selectedOperators, setSelectedOperators] = useState<string[]>([
    '+',
    '-',
  ]);

  // Difficulty
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // Shape
  const [shape, setShape] = useState<ShapeType>('circle');

  // Puzzles
  const [puzzles, setPuzzles] = useState<Puzzle[]>(() =>
    generatePuzzles(8, selectedOperators, difficulty)
  );

  //
  // 2) Handlers
  //
  const handleRegenerate = () => {
    setPuzzles(generatePuzzles(8, selectedOperators, difficulty));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOperatorToggle = (op: string) => {
    // toggles an operator in selectedOperators
    setSelectedOperators((prev) => {
      if (prev.includes(op)) {
        return prev.filter((x) => x !== op);
      } else {
        return [...prev, op];
      }
    });
  };

  //
  // 3) Rendering
  //
  // For convenience, build an array of shape options to map in <SelectItem>
  const shapeOptions: ShapeType[] = [
    'circle',
    'triangle',
    'square',
    'rectangle',
    'pentagon',
    'hexagon',
    'heptagon',
    'octagon',
    'nonagon',
    'decagon',
    'oval',
    'rhombus',
    'parallelogram',
    'trapezium',
    'trapezoid',
    'kite',
    'star',
  ];

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
      <div className="print-button flex flex-col gap-4 mb-4 mx-auto p-4 lg:mx-20">
        {/* Title input */}
        <div>
          <Label htmlFor="title" className="block mb-1">
            Puzzle Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

      <div className='flex flex-col lg:flex-row gap-5'>
          {/* Multi-select for operators */}
          <div>
          <Label className="mb-1">Operators</Label>
          <OperatorMultiSelect
            selectedOperators={selectedOperators}
            onToggleOperator={handleOperatorToggle}
          />
        </div>

        {/* Difficulty dropdown */}
        <div>
          <Label className="mb-1">Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(val) => {
              setDifficulty(val as Difficulty);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shape dropdown */}
        <div>
          <Label className="mb-1">Node Shape</Label>
          <Select value={shape} onValueChange={(val) => setShape(val as ShapeType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              {shapeOptions.map((sh) => (
                <SelectItem key={sh} value={sh}>
                  {sh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

        <div className="flex gap-2">
          <Button onClick={handleRegenerate} variant="default">
            Regenerate
          </Button>
          <Button onClick={handlePrint} variant="default">
            Print
          </Button>
        </div>
      </div>

      {/* Worksheet container that will be visible in print */}
      <div className="worksheet mx-auto p-4">
        {/* Show the title in the printable area */}
        <h1 className="text-xl font-bold text-center mb-6">{title}</h1>

        {/* 2 columns × 4 rows = 8 puzzles */}
        <div className="grid grid-cols-2 grid-rows-4 gap-4">
          {puzzles.map((puzzle, idx) => (
            <PuzzleSVG key={idx} puzzle={puzzle} shape={shape} />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Helper: multi-select for operators using ShadCN <Popover> + <Command>.
 * This is a simple pattern for multi-select in ShadCN (no official multi-select out of box).
 */
function OperatorMultiSelect({
  selectedOperators,
  onToggleOperator,
}: {
  selectedOperators: string[];
  onToggleOperator: (op: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const allOps = ['+', '-', '*', '/'];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[180px] justify-between"
          aria-label="Select operators"
        >
          {selectedOperators.length > 0
            ? `Operators: ${selectedOperators.join(', ')}`
            : 'Select operators'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandList>
            <CommandGroup>
              {allOps.map((op) => {
                const isSelected = selectedOperators.includes(op);
                return (
                  <CommandItem
                    key={op}
                    onSelect={() => {
                      onToggleOperator(op);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {op}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ------------------------------------------------------------------
// Puzzle Generation
// ------------------------------------------------------------------
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a single puzzle, given the list of possible operators and the difficulty.
 * - "easy": top 1–20, arrow values 1–10, hide 1 circle
 * - "medium": top 1–50, arrow values 1–20, hide 2 circles
 * - "hard": top 100–999 (3 digits), arrow values 10–99, hide all circles
 */
function generatePuzzle(operators: string[], difficulty: Difficulty): Puzzle {
  // Ensure we have at least one operator
  if (operators.length === 0) {
    operators = ['+', '-'];
  }

  let topMin = 1;
  let topMax = 20;
  let arrowValMin = 1;
  let arrowValMax = 10;
  let hideCount = 1; // default for easy

  if (difficulty === 'medium') {
    topMin = 1;
    topMax = 50;
    arrowValMin = 1;
    arrowValMax = 20;
    hideCount = 2;
  } else if (difficulty === 'hard') {
    topMin = 100;
    topMax = 999; // 3-digit numbers
    arrowValMin = 10;
    arrowValMax = 99;
    hideCount = 3; // hide all
  }

  // 1) Pick top circle
  const topNumber = getRandomInt(topMin, topMax);

  // 2) Pick arrowLeftOp & arrowLeftVal => left circle
  const arrowLeftOp = operators[Math.floor(Math.random() * operators.length)];
  const arrowLeftVal = getRandomInt(arrowValMin, arrowValMax);
  const leftNumber = computeResult(topNumber, arrowLeftOp, arrowLeftVal);

  // 3) Pick arrowRightOp & arrowRightVal => right circle
  const arrowRightOp = operators[Math.floor(Math.random() * operators.length)];
  const arrowRightVal = getRandomInt(arrowValMin, arrowValMax);
  const rightNumber = computeResult(topNumber, arrowRightOp, arrowRightVal);

  // 4) Left -> Right arrow
  let arrowHorizontalOp: string;
  let arrowHorizontalVal: number;
  if (leftNumber > rightNumber) {
    arrowHorizontalOp = '-';
    arrowHorizontalVal = leftNumber - rightNumber;
  } else {
    arrowHorizontalOp = '+';
    arrowHorizontalVal = rightNumber - leftNumber;
  }

  // 5) Hide circles based on hideCount
  //    We'll systematically pick which circles to hide. For "hard" we hide all 3.
  //    For easy, hide 1 random circle. For medium, hide 2 random circles.
  let circles: (number | null)[] = [topNumber, leftNumber, rightNumber];

  if (hideCount === 3) {
    // Hard => hide all
    circles = [null, null, null];
  } else {
    // For easy or medium, randomly hide 'hideCount' of them
    const indicesToHide = pickUniqueIndices(hideCount, 3);
    indicesToHide.forEach((i) => {
      circles[i] = null;
    });
  }

  const puzzle: Puzzle = {
    top: circles[0],
    left: circles[1],
    right: circles[2],
    arrowLeftOp,
    arrowLeftVal,
    arrowRightOp,
    arrowRightVal,
    arrowHorizontalOp,
    arrowHorizontalVal,
  };

  return puzzle;
}

/** Helper to pick 'count' unique indices from 0..(size-1) */
function pickUniqueIndices(count: number, size: number): number[] {
  const indices = Array.from({ length: size }, (_, i) => i);
  const chosen: number[] = [];
  for (let i = 0; i < count; i++) {
    const rndIndex = Math.floor(Math.random() * indices.length);
    chosen.push(indices[rndIndex]);
    indices.splice(rndIndex, 1);
  }
  return chosen;
}

/** Compute topNumber (op) arrowVal. Allows +, -, *, /.
 *  If /, may produce non-integers. Adjust if you only want integer results.
 */
function computeResult(a: number, op: string, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      // If you want to force integer, do something like `Math.floor(a / b)` or skip if remainder != 0
      return a / b;
    default:
      return a + b;
  }
}

function generatePuzzles(
  count: number,
  operators: string[],
  difficulty: Difficulty
): Puzzle[] {
  const puzzles: Puzzle[] = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(generatePuzzle(operators, difficulty));
  }
  return puzzles;
}

// ------------------------------------------------------------------
// Puzzle SVG
// ------------------------------------------------------------------
function PuzzleSVG({ puzzle, shape }: { puzzle: Puzzle; shape: ShapeType }) {
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

  // We'll keep the same logic as before but pass shape into the node rendering
  // "size" is the bounding box for squares, polygons, etc.
  const SIZE = 30; // diameter for circle, side for square, etc.

  return (
    <div className="relative w-56 h-56 mx-auto my-2">
      <svg
        className="w-full h-full"
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

        {/* Arrows */}
        <PuzzleArrows
          topCircle={{ x: 60, y: 20 }}
          leftCircle={{ x: 20, y: 85 }}
          rightCircle={{ x: 100, y: 85 }}
          radius={SIZE / 2} // approximate for arrow endpoints
          arrowLeftOp={arrowLeftOp}
          arrowLeftVal={arrowLeftVal}
          arrowRightOp={arrowRightOp}
          arrowRightVal={arrowRightVal}
          arrowHorizontalOp={arrowHorizontalOp}
          arrowHorizontalVal={arrowHorizontalVal}
        />

        {/* Nodes */}
        <Node
          shape={shape}
          x={60}
          y={20}
          size={SIZE}
          text={top === null ? '' : top.toString()}
        />
        <Node
          shape={shape}
          x={20}
          y={85}
          size={SIZE}
          text={left === null ? '' : left.toString()}
        />
        <Node
          shape={shape}
          x={100}
          y={85}
          size={SIZE}
          text={right === null ? '' : right.toString()}
        />
      </svg>
    </div>
  );
}

/**
 * PuzzleArrows: draws the 3 arrows + operator text.
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
}: {
  topCircle: { x: number; y: number };
  leftCircle: { x: number; y: number };
  rightCircle: { x: number; y: number };
  radius: number;
  arrowLeftOp: string;
  arrowLeftVal: number;
  arrowRightOp: string;
  arrowRightVal: number;
  arrowHorizontalOp: string;
  arrowHorizontalVal: number;
}) {
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

      {/* Operators on arrows */}
      <text
        x={midTopLeft.x - 10}
        y={midTopLeft.y - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {arrowLeftOp} {arrowLeftVal}
      </text>
      <text
        x={midTopRight.x + 10}
        y={midTopRight.y - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {arrowRightOp} {arrowRightVal}
      </text>
      <text
        x={midLeftRight.x}
        y={midLeftRight.y - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="black"
      >
        {arrowHorizontalOp} {arrowHorizontalVal}
      </text>
    </>
  );
}

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

function midpoint(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

// ------------------------------------------------------------------
// Node Rendering for different shapes
// ------------------------------------------------------------------
function Node({
  shape,
  x,
  y,
  size,
  text,
}: {
  shape: ShapeType;
  x: number;
  y: number;
  size: number; // bounding dimension
  text: string;
}) {
  const fill = 'white';
  const stroke = 'gray';
  const strokeWidth = 1;
  const fontSize = 10;

  switch (shape) {
    case 'circle': {
      const r = size / 2;
      return (
        <>
          <circle
            cx={x}
            cy={y}
            r={r}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fill="black"
          >
            {text}
          </text>
        </>
      );
    }

    case 'triangle': {
      // Equilateral triangle using a regular polygon approach
      const points = regularPolygonPoints(x, y, 3, size / 2, -Math.PI / 2);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'square': {
      const half = size / 2;
      return (
        <>
          <rect
            x={x - half}
            y={y - half}
            width={size}
            height={size}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fill="black"
          >
            {text}
          </text>
        </>
      );
    }

    case 'rectangle': {
      // Let's make it 1.5 times wider than tall
      const w = size * 1.5;
      const h = size;
      const x1 = x - w / 2;
      const y1 = y - h / 2;
      return (
        <>
          <rect
            x={x1}
            y={y1}
            width={w}
            height={h}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fill="black"
          >
            {text}
          </text>
        </>
      );
    }

    case 'pentagon': {
      const points = regularPolygonPoints(x, y, 5, size / 2, -Math.PI / 2);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'hexagon': {
      const points = regularPolygonPoints(x, y, 6, size / 2, -Math.PI / 2);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'heptagon': {
      const points = regularPolygonPoints(x, y, 7, size / 2, -Math.PI / 2);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'octagon': {
      const points = regularPolygonPoints(x, y, 8, size / 2, -Math.PI / 8);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'nonagon': {
      const points = regularPolygonPoints(x, y, 9, size / 2, -Math.PI / 2);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'decagon': {
      const points = regularPolygonPoints(x, y, 10, size / 2, -Math.PI / 2);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'oval': {
      // Just an ellipse with different rx, ry
      const rx = size / 2;
      const ry = size / 3;
      return (
        <>
          <ellipse
            cx={x}
            cy={y}
            rx={rx}
            ry={ry}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fill="black"
          >
            {text}
          </text>
        </>
      );
    }

    case 'rhombus': {
      // A diamond shape
      const half = size / 2;
      // Points: top, right, bottom, left
      const points: [number, number][] = [
        [x, y - half],
        [x + half, y],
        [x, y + half],
        [x - half, y],
      ];
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'parallelogram': {
      // 4 points with a certain slant
      const half = size / 2;
      const slant = size / 4;
      // We'll define something like a skewed rectangle
      // top-left, top-right, bottom-right, bottom-left
      const points: [number, number][] = [
        [x - half, y - half],
        [x + half, y - half],
        [x + half + slant, y + half],
        [x - half + slant, y + half],
      ];
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'trapezium':
    case 'trapezoid': {
      // We'll do an isosceles trapezoid: top narrower, bottom wider
      const half = size / 2;
      // top width ~ size/2, bottom width ~ size
      const topHalf = size / 4;
      const bottomHalf = size / 2;
      const points: [number, number][] = [
        [x - topHalf, y - half],
        [x + topHalf, y - half],
        [x + bottomHalf, y + half],
        [x - bottomHalf, y + half],
      ];
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'kite': {
      // 4 points: top, left, right, bottom
      // We'll do a simple symmetrical kite
      const half = size / 2;
      const points: [number, number][] = [
        [x, y - half],
        [x + half / 2, y],
        [x, y + half],
        [x - half / 2, y],
      ];
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    case 'star': {
      // 5-point star (10 vertices if you consider outer & inner points).
      // We'll define a standard star, or use a helper function:
      const points = starPoints(x, y, size / 2, size / 4, 5);
      return drawPolygon(points, fill, stroke, strokeWidth, text, fontSize);
    }

    default:
      return null;
  }
}

/** 
 * Utility to draw <polygon> + centered text 
 * We return a fragment that has the <polygon> plus a <text> overlay 
 */
function drawPolygon(
  points: [number, number][],
  fill: string,
  stroke: string,
  strokeWidth: number,
  text: string,
  fontSize: number
) {
  // get bounding box center for text
  // or you can assume we already know the center
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return (
    <>
      <polygon
        points={points.map((p) => p.join(',')).join(' ')}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fill="black"
      >
        {text}
      </text>
    </>
  );
}

/**
 * Generate points for a regular polygon with 'sides' sides,
 * centered at (cx, cy), radius = r, starting rotation = rotate (radians).
 */
function regularPolygonPoints(
  cx: number,
  cy: number,
  sides: number,
  r: number,
  rotate = 0
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides + rotate;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push([x, y]);
  }
  return points;
}

/**
 * starPoints: returns an array of x,y pairs for a star with 'points' tips.
 * - outerRadius, innerRadius
 * - typically for a 5-point star, points=5 => 10 total vertices
 */
function starPoints(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points: number
): [number, number][] {
  const step = Math.PI / points; // half-step between outer & inner
  const arr: [number, number][] = [];
  let angle = -Math.PI / 2; // start from top
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    arr.push([x, y]);
    angle += step;
  }
  return arr;
}
