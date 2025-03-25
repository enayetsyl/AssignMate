"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Maze = {
  horizontalWalls: boolean[][];
  verticalWalls: boolean[][];
};

//
// ─── 1. MAZE GENERATION ─────────────────────────────────────────────────────────
//

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Recursive backtracking maze generator
function generateMaze(width: number, height: number): Maze {
  const horizontalWalls: boolean[][] = Array.from(
    { length: height + 1 },
    () => Array(width).fill(true)
  );
  const verticalWalls: boolean[][] = Array.from(
    { length: height },
    () => Array(width + 1).fill(true)
  );
  const visited: boolean[][] = Array.from(
    { length: height },
    () => Array(width).fill(false)
  );

  function carvePassagesFrom(cx: number, cy: number): void {
    visited[cy][cx] = true;

    const directions = [
      { dx: 0, dy: -1, wall: "horizontal" as const, wy: cy },
      { dx: 0, dy: 1, wall: "horizontal" as const, wy: cy + 1 },
      { dx: -1, dy: 0, wall: "vertical" as const, wx: cx },
      { dx: 1, dy: 0, wall: "vertical" as const, wx: cx + 1 },
    ];

    shuffle(directions);

    for (const dir of directions) {
      const nx = cx + dir.dx;
      const ny = cy + dir.dy;
      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        !visited[ny][nx]
      ) {
        // Remove the wall
        if (dir.wall === "horizontal") {
          horizontalWalls[dir.wy][cx] = false;
        } else {
          verticalWalls[cy][dir.wx] = false;
        }
        carvePassagesFrom(nx, ny);
      }
    }
  }

  carvePassagesFrom(0, 0);
  return { horizontalWalls, verticalWalls };
}

//
// ─── 2. FIND SOLUTION PATH ─────────────────────────────────────────────────────
//

// We'll do a BFS from (0,0) to (height-1, width-1)
function findSolutionPath(maze: Maze): [number, number][] {
  const { horizontalWalls, verticalWalls } = maze;
  const height = horizontalWalls.length - 1;
  const width = verticalWalls[0].length - 1;

  // BFS queue items store (r, c) + the path taken
  const queue: Array<{ r: number; c: number; path: [number, number][] }> = [
    { r: 0, c: 0, path: [[0, 0]] },
  ];

  const visited = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );
  visited[0][0] = true;

  while (queue.length > 0) {
    const { r, c, path } = queue.shift()!;

    // If we've reached the bottom-right cell, return the path
    if (r === height - 1 && c === width - 1) {
      return path;
    }

    // Check neighbors: up, down, left, right
    // We'll define a helper that checks if we can move from (r,c) to (nr,nc)
    const neighbors = getNeighbors(r, c, maze);

    for (const [nr, nc] of neighbors) {
      if (!visited[nr][nc]) {
        visited[nr][nc] = true;
        queue.push({ r: nr, c: nc, path: [...path, [nr, nc]] });
      }
    }
  }

  // If no path found (unlikely in a perfect maze), return empty
  return [];
}

// This checks up/down/left/right, ensuring there's no wall blocking movement
function getNeighbors(r: number, c: number, maze: Maze): [number, number][] {
  const { horizontalWalls, verticalWalls } = maze;
  const height = horizontalWalls.length - 1;
  const width = verticalWalls[0].length - 1;
  const neighbors: [number, number][] = [];

  // Move Up: (r-1, c)
  if (r > 0 && horizontalWalls[r][c] === false) {
    neighbors.push([r - 1, c]);
  }
  // Move Down: (r+1, c)
  if (r < height - 1 && horizontalWalls[r + 1][c] === false) {
    neighbors.push([r + 1, c]);
  }
  // Move Left: (r, c-1)
  if (c > 0 && verticalWalls[r][c] === false) {
    neighbors.push([r, c - 1]);
  }
  // Move Right: (r, c+1)
  if (c < width - 1 && verticalWalls[r][c + 1] === false) {
    neighbors.push([r, c + 1]);
  }

  return neighbors;
}

//
// ─── 3. MAZE SVG COMPONENT ─────────────────────────────────────────────────────
//

interface MazeSVGProps {
  maze: Maze;
  showAnswer: boolean;
  solutionPath: [number, number][]; // array of [row, col]
  startImage?: string;
  endImage?: string;
}

const MazeSVG = ({
  maze,
  showAnswer,
  solutionPath,
  startImage,
  endImage,
}: MazeSVGProps) => {
  const { horizontalWalls, verticalWalls } = maze;
  const height = horizontalWalls.length - 1;
  const width = verticalWalls[0].length - 1;

  // Adjust cellSize and dimensions for a large A4 puzzle
  const cellSize = 30;
  const svgWidth = width * cellSize;
  const svgHeight = height * cellSize;

  // Build a polyline string for the solution path if showAnswer is true
  let solutionPolyline = "";
  if (showAnswer && solutionPath.length > 0) {
    solutionPolyline = solutionPath
      .map(([r, c]) => {
        // center of cell (c + 0.5, r + 0.5)
        const x = (c + 0.5) * cellSize;
        const y = (r + 0.5) * cellSize;
        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Maze walls (horizontal) */}
      {horizontalWalls.map((row, y) =>
        row.map(
          (wall, x) =>
            wall && (
              <line
                key={`h-${y}-${x}`}
                x1={x * cellSize}
                y1={y * cellSize}
                x2={(x + 1) * cellSize}
                y2={y * cellSize}
                stroke="black"
              />
            )
        )
      )}

      {/* Maze walls (vertical) */}
      {verticalWalls.map((row, y) =>
        row.map(
          (wall, x) =>
            wall && (
              <line
                key={`v-${y}-${x}`}
                x1={x * cellSize}
                y1={y * cellSize}
                x2={x * cellSize}
                y2={(y + 1) * cellSize}
                stroke="black"
              />
            )
        )
      )}

      {/* The solution path (if showAnswer is true) */}
      {showAnswer && solutionPath.length > 0 && (
        <polyline
          points={solutionPolyline}
          fill="none"
          stroke="blue"
          strokeWidth={3}
        />
      )}

      {/* Start marker (0,0) */}
      {startImage ? (
        <image
          href={startImage}
          x={0.5 * cellSize - cellSize / 2}
          y={0.5 * cellSize - cellSize / 2}
          width={cellSize}
          height={cellSize}
        />
      ) : (
        <circle
          cx={0.5 * cellSize}
          cy={0.5 * cellSize}
          r={cellSize / 4}
          fill="green"
        />
      )}

      {/* End marker (bottom-right) */}
      {endImage ? (
        <image
          href={endImage}
          x={(width - 0.5) * cellSize - cellSize / 2}
          y={(height - 0.5) * cellSize - cellSize / 2}
          width={cellSize}
          height={cellSize}
        />
      ) : (
        <circle
          cx={(width - 0.5) * cellSize}
          cy={(height - 0.5) * cellSize}
          r={cellSize / 4}
          fill="red"
        />
      )}
    </svg>
  );
};

//
// ─── 4. MAIN COMPONENT ─────────────────────────────────────────────────────────
//

const SimpleMazeGenerator = () => {
  const [maze, setMaze] = useState<Maze | null>(null);
  const [solutionPath, setSolutionPath] = useState<[number, number][]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);

  // Make it big enough to fill an A4 in landscape
  const MAZE_WIDTH = 30;
  const MAZE_HEIGHT = 20;

  // Generate a new maze and find its solution path
  const generateNewMaze = () => {
    const newMaze = generateMaze(MAZE_WIDTH, MAZE_HEIGHT);
    setMaze(newMaze);
    // Hide the old answer if any
    setShowAnswer(false);
    // Once we have a new maze, find the path
    const path = findSolutionPath(newMaze);
    setSolutionPath(path);
  };

  useEffect(() => {
    generateNewMaze();
  }, []);

  // File input handlers
  const handleStartImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setStartImage(url);
    }
  };

  const handleEndImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEndImage(url);
    }
  };

  // Printing
  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      {/* Print style for A4 page in landscape */}
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
          }
          #printable-area svg {
            width: 100%;
            height: auto;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-4 p-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={generateNewMaze}>Generate New Maze</Button>
          <Button
            onClick={() => {
              // Hide the path, then print
              setShowAnswer(false);
              handlePrint();
            }}
          >
            Print Maze
          </Button>
          <Button
            onClick={() => {
              // Show the path, then print
              setShowAnswer(true);
              handlePrint();
            }}
          >
            Print Answer
          </Button>
        </div>

        {/* File Uploads using shadcn/ui */}
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
        <div id="printable-area" className="w-full max-w-[1200px]">
          {maze && (
            <MazeSVG
              maze={maze}
              showAnswer={showAnswer}
              solutionPath={solutionPath}
              startImage={startImage || undefined}
              endImage={endImage || undefined}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SimpleMazeGenerator;
