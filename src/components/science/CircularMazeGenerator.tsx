'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ───────────────────────────────────────────────
// TYPES & UTILITY FUNCTIONS (Polar Maze)
// ───────────────────────────────────────────────

type PolarCell = {
  ring: number;
  index: number;
  walls: {
    inward: boolean;
    outward: boolean;
    cw: boolean;
    ccw: boolean;
  };
  visited?: boolean;
};

function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ───────────────────────────────────────────────
// MAZE GENERATION FUNCTIONS
// ───────────────────────────────────────────────

function createPolarGrid(numRings: number): PolarCell[][] {
  const grid: PolarCell[][] = [];
  for (let r = 0; r < numRings; r++) {
    const count = r === 0 ? 1 : r * 6;
    const ringCells: PolarCell[] = [];
    for (let i = 0; i < count; i++) {
      ringCells.push({
        ring: r,
        index: i,
        walls: {
          inward: true,
          outward: true,
          cw: true,
          ccw: true,
        },
        visited: false,
      });
    }
    grid.push(ringCells);
  }
  return grid;
}

function getPolarNeighbors(
  grid: PolarCell[][],
  cell: PolarCell,
  numRings: number
): { neighbor: PolarCell; direction: 'cw' | 'ccw' | 'inward' | 'outward' }[] {
  const neighbors: { neighbor: PolarCell; direction: 'cw' | 'ccw' | 'inward' | 'outward' }[] = [];
  const r = cell.ring;
  const i = cell.index;
  const count = r === 0 ? 1 : r * 6;

  if (count > 1) {
    const cwIndex = (i + 1) % count;
    const ccwIndex = (i - 1 + count) % count;
    neighbors.push({ neighbor: grid[r][cwIndex], direction: 'cw' });
    neighbors.push({ neighbor: grid[r][ccwIndex], direction: 'ccw' });
  }

  if (r < numRings - 1) {
    const nextCount = (r + 1) * 6;
    const outwardIndex = Math.floor(((i + 0.5) / count) * nextCount);
    neighbors.push({ neighbor: grid[r + 1][outwardIndex], direction: 'outward' });
  }

  if (r > 0) {
    const innerCount = r === 1 ? 1 : (r - 1) * 6;
    const inwardIndex = r === 1 ? 0 : Math.floor(((i + 0.5) / count) * innerCount);
    neighbors.push({ neighbor: grid[r - 1][inwardIndex], direction: 'inward' });
  }

  return neighbors;
}

function carvePolarMaze(
  grid: PolarCell[][],
  cell: PolarCell,
  numRings: number
) {
  cell.visited = true;
  const neighbors = getPolarNeighbors(grid, cell, numRings).filter(
    ({ neighbor }) => !neighbor.visited
  );
  shuffle(neighbors);
  for (const { neighbor, direction } of neighbors) {
    if (!neighbor.visited) {
      if (direction === 'cw') {
        cell.walls.cw = false;
        neighbor.walls.ccw = false;
      } else if (direction === 'ccw') {
        cell.walls.ccw = false;
        neighbor.walls.cw = false;
      } else if (direction === 'outward') {
        cell.walls.outward = false;
        neighbor.walls.inward = false;
      } else if (direction === 'inward') {
        cell.walls.inward = false;
        neighbor.walls.outward = false;
      }
      carvePolarMaze(grid, neighbor, numRings);
    }
  }
}

function generateCircularMaze(numRings: number): {
  grid: PolarCell[][]; 
  exit: { ring: number; index: number };
} {
  const grid = createPolarGrid(numRings);
  carvePolarMaze(grid, grid[0][0], numRings);
  const outerRing = grid[numRings - 1];
  const exitIndex = Math.floor(Math.random() * outerRing.length);
  outerRing[exitIndex].walls.outward = false;
  return { grid, exit: { ring: numRings - 1, index: exitIndex } };
}

// ───────────────────────────────────────────────
// SOLUTION PATH (BFS)
// ───────────────────────────────────────────────

function getAccessibleNeighbors(
  grid: PolarCell[][],
  cell: PolarCell,
  numRings: number
): { neighbor: PolarCell; direction: 'cw' | 'ccw' | 'inward' | 'outward' }[] {
  const neighbors: { neighbor: PolarCell; direction: 'cw' | 'ccw' | 'inward' | 'outward' }[] = [];
  const r = cell.ring;
  const i = cell.index;
  const count = r === 0 ? 1 : r * 6;

  if (count > 1) {
    const cwIndex = (i + 1) % count;
    const ccwIndex = (i - 1 + count) % count;
    if (!cell.walls.cw) {
      neighbors.push({ neighbor: grid[r][cwIndex], direction: 'cw' });
    }
    if (!cell.walls.ccw) {
      neighbors.push({ neighbor: grid[r][ccwIndex], direction: 'ccw' });
    }
  }

  if (r < numRings - 1 && !cell.walls.outward) {
    const nextCount = (r + 1) * 6;
    const outwardIndex = Math.floor(((i + 0.5) / count) * nextCount);
    neighbors.push({ neighbor: grid[r + 1][outwardIndex], direction: 'outward' });
  }

  if (r > 0 && !cell.walls.inward) {
    const innerCount = r === 1 ? 1 : (r - 1) * 6;
    const inwardIndex = r === 1 ? 0 : Math.floor(((i + 0.5) / count) * innerCount);
    neighbors.push({ neighbor: grid[r - 1][inwardIndex], direction: 'inward' });
  }

  return neighbors;
}

function findPolarSolutionPath(
  grid: PolarCell[][],
  exit: { ring: number; index: number },
  numRings: number
): [number, number][] {
  const start = grid[0][0];
  const queue: { cell: PolarCell; path: [number, number][] }[] = [
    { cell: start, path: [[0, 0]] },
  ];
  const visited = new Set<string>();
  visited.add('0-0');

  while (queue.length > 0) {
    const { cell, path } = queue.shift()!;
    if (cell.ring === exit.ring && cell.index === exit.index) {
      return path;
    }
    const neighbors = getAccessibleNeighbors(grid, cell, numRings);
    for (const { neighbor } of neighbors) {
      const key = `${neighbor.ring}-${neighbor.index}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ cell: neighbor, path: [...path, [neighbor.ring, neighbor.index]] });
      }
    }
  }
  return [];
}

// ───────────────────────────────────────────────
// RENDERING FUNCTIONS (SVG)
// ───────────────────────────────────────────────

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

interface CircularMazeSVGProps {
  grid: PolarCell[][];
  solutionPath: [number, number][];
  exit: { ring: number; index: number };
  showAnswer: boolean;
  startImage?: string;
  endImage?: string;
}

const CircularMazeSVG = ({
  grid,
  solutionPath,
  exit,
  showAnswer,
  startImage,
  endImage,
}: CircularMazeSVGProps) => {
  const numRings = grid.length;

  // Slightly smaller radius to help fit on one page with heading
  const mazeRadius = 250;
  const cellHeight = mazeRadius / numRings;
  const margin = 40;
  const svgSize = (mazeRadius + margin) * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  const wallPaths: JSX.Element[] = [];
  grid.forEach((ringCells, r) => {
    const count = r === 0 ? 1 : r * 6;
    const theta = (2 * Math.PI) / (r === 0 ? 1 : count);
    ringCells.forEach((cell, i) => {
      const startAngle = i * theta;
      const endAngle = (i + 1) * theta;
      const innerRadius = r * cellHeight;
      const outerRadius = (r + 1) * cellHeight;

      if (r === 0) {
        if (cell.walls.outward) {
          wallPaths.push(
            <circle
              key={'center-out'}
              cx={cx}
              cy={cy}
              r={outerRadius}
              stroke="black"
              fill="none"
            />
          );
        }
      } else {
        if (cell.walls.inward) {
          const pathData = describeArc(cx, cy, innerRadius, startAngle, endAngle);
          wallPaths.push(
            <path key={`r${r}-cell${i}-in`} d={pathData} stroke="black" fill="none" />
          );
        }
      }

      if (cell.walls.outward) {
        const pathData = describeArc(cx, cy, outerRadius, startAngle, endAngle);
        wallPaths.push(
          <path key={`r${r}-cell${i}-out`} d={pathData} stroke="black" fill="none" />
        );
      }

      if (cell.walls.ccw) {
        const p1 = polarToCartesian(cx, cy, innerRadius, startAngle);
        const p2 = polarToCartesian(cx, cy, outerRadius, startAngle);
        wallPaths.push(
          <line key={`r${r}-cell${i}-ccw`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="black" />
        );
      }
      if (cell.walls.cw) {
        const p1 = polarToCartesian(cx, cy, innerRadius, endAngle);
        const p2 = polarToCartesian(cx, cy, outerRadius, endAngle);
        wallPaths.push(
          <line key={`r${r}-cell${i}-cw`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="black" />
        );
      }
    });
  });

  let solutionPoints = '';
  if (showAnswer && solutionPath.length > 0) {
    solutionPoints = solutionPath
      .map(([r, i]) => {
        const count = r === 0 ? 1 : r * 6;
        const theta = (2 * Math.PI) / (r === 0 ? 1 : count);
        const startAngle = i * theta;
        const endAngle = (i + 1) * theta;
        const midAngle = (startAngle + endAngle) / 2;
        const innerR = r * cellHeight;
        const outerR = (r + 1) * cellHeight;
        const midRadius = (innerR + outerR) / 2;
        const { x, y } = polarToCartesian(cx, cy, midRadius, midAngle);
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {wallPaths}
      {showAnswer && solutionPoints && (
        <polyline points={solutionPoints} fill="none" stroke="blue" strokeWidth={3} />
      )}
      {/* Start marker in center */}
      {startImage ? (
        <image
          href={startImage}
          x={cx - cellHeight / 2}
          y={cy - cellHeight / 2}
          width={cellHeight}
          height={cellHeight}
        />
      ) : (
        <circle cx={cx} cy={cy} r={cellHeight / 4} fill="green" />
      )}
      {/* Exit marker */}
      {exit && (
        <>
          {endImage ? (
            (() => {
              const r = exit.ring;
              const count = r === 0 ? 1 : r * 6;
              const theta = (2 * Math.PI) / (r === 0 ? 1 : count);
              const startAngle = exit.index * theta;
              const endAngle = (exit.index + 1) * theta;
              const midAngle = (startAngle + endAngle) / 2;
              const innerR = r * cellHeight;
              const outerR = (r + 1) * cellHeight;
              const midRadius = (innerR + outerR) / 2;
              const { x, y } = polarToCartesian(cx, cy, midRadius, midAngle);
              return (
                <image
                  href={endImage}
                  x={x - cellHeight / 2}
                  y={y - cellHeight / 2}
                  width={cellHeight}
                  height={cellHeight}
                  key="exit-img"
                />
              );
            })()
          ) : (
            (() => {
              const r = exit.ring;
              const count = r === 0 ? 1 : r * 6;
              const theta = (2 * Math.PI) / (r === 0 ? 1 : count);
              const startAngle = exit.index * theta;
              const endAngle = (exit.index + 1) * theta;
              const midAngle = (startAngle + endAngle) / 2;
              const innerR = r * cellHeight;
              const outerR = (r + 1) * cellHeight;
              const midRadius = (innerR + outerR) / 2;
              const { x, y } = polarToCartesian(cx, cy, midRadius, midAngle);
              return <circle key="exit-circle" cx={x} cy={y} r={cellHeight / 4} fill="red" />;
            })()
          )}
        </>
      )}
    </svg>
  );
};

// ───────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────

const PrintableCircularMazeGenerator = () => {
  const difficultyMapping: Record<string, number> = {
    easy: 5,
    medium: 7,
    hard: 9,
    iron: 10,
  };

  const [difficulty, setDifficulty] = useState('medium');
  const [heading, setHeading] = useState('Go from green to red');
  const [grid, setGrid] = useState<PolarCell[][] | null>(null);
  const [exit, setExit] = useState<{ ring: number; index: number } | null>(null);
  const [solutionPath, setSolutionPath] = useState<[number, number][]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);

  const generateNewMaze = () => {
    const numRings = difficultyMapping[difficulty];
    const { grid, exit } = generateCircularMaze(numRings);
    setGrid(grid);
    setExit(exit);
    setShowAnswer(false);
    if (grid && exit) {
      const path = findPolarSolutionPath(grid, exit, numRings);
      setSolutionPath(path);
    }
  };

  useEffect(() => {
    generateNewMaze();
  }, [difficulty]);

  const handleStartImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStartImage(URL.createObjectURL(file));
    }
  };

  const handleEndImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEndImage(URL.createObjectURL(file));
    }
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      {/* Print styles for A4 landscape */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
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
            width: 100vw;
            height: 100vh;
            /* Prevent splitting heading & maze across pages */
            page-break-inside: avoid;
            break-inside: avoid;
          }
          #printable-area svg {
            width: 100%;
            height: auto;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-4 p-4">
        {/* Difficulty & Heading in a single row with gap */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <Label htmlFor="difficulty">Difficulty:</Label>
            <Select value={difficulty} onValueChange={(value: string) => setDifficulty(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (5 rings)</SelectItem>
                <SelectItem value="medium">Medium (7 rings)</SelectItem>
                <SelectItem value="hard">Hard (9 rings)</SelectItem>
                <SelectItem value="iron">Iron (10 rings)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Heading */}
          <div className="flex gap-4 ">
            <Label htmlFor="heading">Maze Heading:</Label>
            <Input
              id="heading"
              type="text"
              placeholder="Enter heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 py-4">
          <Button onClick={generateNewMaze}>Generate New Maze</Button>
          <Button
            onClick={() => {
              setShowAnswer(false);
              handlePrint();
            }}
          >
            Print Maze
          </Button>
          <Button
            onClick={() => {
              setShowAnswer(true);
              handlePrint();
            }}
          >
            Print Answer
          </Button>
        </div>

        {/* File Uploads side-by-side with gap-4 */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="startImage">Upload Start Image</Label>
            <Input
              id="startImage"
              type="file"
              accept="image/*"
              onChange={handleStartImageUpload}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="endImage">Upload End Image</Label>
            <Input
              id="endImage"
              type="file"
              accept="image/*"
              onChange={handleEndImageUpload}
            />
          </div>
        </div>

        {/* Printable Area */}
        <div
          id="printable-area"
          className="w-full max-w-[700px] flex flex-col items-center gap-4"
          style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
        >
          <h1 className="text-2xl font-bold text-center mt-4">{heading}</h1>
          {grid && exit && (
            <CircularMazeSVG
              grid={grid}
              solutionPath={solutionPath}
              exit={exit}
              showAnswer={showAnswer}
              startImage={startImage || undefined}
              endImage={endImage || undefined}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PrintableCircularMazeGenerator;
