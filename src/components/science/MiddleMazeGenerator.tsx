"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

//
// ─── TYPES ─────────────────────────────────────────────────────────────────────
//

type Maze = {
  horizontalWalls: boolean[][]; // horizontalWalls[row][col]
  verticalWalls: boolean[][];   // verticalWalls[row][col]
};

//
// ─── 1. MAZE GENERATION ────────────────────────────────────────────────────────
//

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generate a "perfect maze" by starting recursive backtracking from the center cell.
 * That way, the carving flows outward from the middle.
 */
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

  // Define the center cell (integer math to handle even sizes too)
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  function carvePassagesFrom(cx: number, cy: number): void {
    visited[cy][cx] = true;

    const directions = [
      { dx: 0, dy: -1, wall: "horizontal" as const, wy: cy },
      { dx: 0, dy: 1,  wall: "horizontal" as const, wy: cy + 1 },
      { dx: -1, dy: 0, wall: "vertical"   as const, wx: cx },
      { dx: 1,  dy: 0, wall: "vertical"   as const, wx: cx + 1 },
    ];

    shuffle(directions);

    for (const dir of directions) {
      const nx = cx + dir.dx;
      const ny = cy + dir.dy;
      if (
        nx >= 0 && nx < width &&
        ny >= 0 && ny < height &&
        !visited[ny][nx]
      ) {
        // Remove the wall between (cx, cy) and (nx, ny)
        if (dir.wall === "horizontal") {
          horizontalWalls[dir.wy][cx] = false;
        } else {
          verticalWalls[cy][dir.wx] = false;
        }
        carvePassagesFrom(nx, ny);
      }
    }
  }

  // Start carving from the center
  carvePassagesFrom(centerX, centerY);
  return { horizontalWalls, verticalWalls };
}

//
// ─── 2. FIND SOLUTION PATH FROM CENTER TO ANY BOUNDARY ─────────────────────────
//

/**
 * Return a path of [row, col] from the center cell to
 * whichever boundary cell BFS finds first.
 */
function findSolutionPath(maze: Maze): {
  path: [number, number][];
  exitCell: [number, number] | null;
} {
  const { horizontalWalls, verticalWalls } = maze;
  const height = horizontalWalls.length - 1;
  const width = verticalWalls[0].length - 1;

  // Center cell
  const startRow = Math.floor(height / 2);
  const startCol = Math.floor(width / 2);

  // BFS queue: each item stores (row, col, pathSoFar)
  const queue: Array<{ r: number; c: number; path: [number, number][] }> = [
    { r: startRow, c: startCol, path: [[startRow, startCol]] },
  ];
  const visited = Array.from({ length: height }, () => Array(width).fill(false));
  visited[startRow][startCol] = true;

  while (queue.length > 0) {
    const { r, c, path } = queue.shift()!;

    // If we're on a boundary cell, that's our exit
    if (r === 0 || r === height - 1 || c === 0 || c === width - 1) {
      return { path, exitCell: [r, c] };
    }

    // Otherwise, add valid neighbors
    const neighbors = getNeighbors(r, c, maze);
    for (const [nr, nc] of neighbors) {
      if (!visited[nr][nc]) {
        visited[nr][nc] = true;
        queue.push({ r: nr, c: nc, path: [...path, [nr, nc]] });
      }
    }
  }

  // If no boundary found (unlikely in a perfect maze), return empty
  return { path: [], exitCell: null };
}

/**
 * Return all valid neighbors (up, down, left, right) not blocked by walls.
 */
function getNeighbors(r: number, c: number, maze: Maze): [number, number][] {
  const { horizontalWalls, verticalWalls } = maze;
  const height = horizontalWalls.length - 1;
  const width = verticalWalls[0].length - 1;
  const neighbors: [number, number][] = [];

  // Up: (r-1, c) if no horizontal wall between (r,c) and (r-1,c)
  if (r > 0 && horizontalWalls[r][c] === false) {
    neighbors.push([r - 1, c]);
  }
  // Down: (r+1, c)
  if (r < height - 1 && horizontalWalls[r + 1][c] === false) {
    neighbors.push([r + 1, c]);
  }
  // Left: (r, c-1)
  if (c > 0 && verticalWalls[r][c] === false) {
    neighbors.push([r, c - 1]);
  }
  // Right: (r, c+1)
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
  solutionPath: [number, number][]; // BFS path
  exitCell: [number, number] | null;
  startImage?: string;
  endImage?: string;
}

const MazeSVG = ({
  maze,
  showAnswer,
  solutionPath,
  exitCell,
  startImage,
  endImage,
}: MazeSVGProps) => {
  const { horizontalWalls, verticalWalls } = maze;
  const height = horizontalWalls.length - 1;
  const width = verticalWalls[0].length - 1;

  // Larger cell size so it fills an A4
  const cellSize = 30;
  const svgWidth = width * cellSize;
  const svgHeight = height * cellSize;

  // The center cell
  const centerRow = Math.floor(height / 2);
  const centerCol = Math.floor(width / 2);

  // Build a polyline string if we are showing the answer
  let solutionPolyline = "";
  if (showAnswer && solutionPath.length > 0) {
    solutionPolyline = solutionPath
      .map(([r, c]) => {
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

      {/* The solution path (blue line) if showAnswer is true */}
      {showAnswer && solutionPolyline && (
        <polyline
          points={solutionPolyline}
          fill="none"
          stroke="blue"
          strokeWidth={3}
        />
      )}

      {/* Start marker in the center */}
      {startImage ? (
        <image
          href={startImage}
          x={(centerCol + 0.5) * cellSize - cellSize / 2}
          y={(centerRow + 0.5) * cellSize - cellSize / 2}
          width={cellSize}
          height={cellSize}
        />
      ) : (
        <circle
          cx={(centerCol + 0.5) * cellSize}
          cy={(centerRow + 0.5) * cellSize}
          r={cellSize / 4}
          fill="green"
        />
      )}

      {/* End marker: if BFS found an exit cell, place it */}
      {exitCell && (
        endImage ? (
          <image
            href={endImage}
            x={(exitCell[1] + 0.5) * cellSize - cellSize / 2}
            y={(exitCell[0] + 0.5) * cellSize - cellSize / 2}
            width={cellSize}
            height={cellSize}
          />
        ) : (
          <circle
            cx={(exitCell[1] + 0.5) * cellSize}
            cy={(exitCell[0] + 0.5) * cellSize}
            r={cellSize / 4}
            fill="red"
          />
        )
      )}
    </svg>
  );
};

//
// ─── 4. MAIN COMPONENT ─────────────────────────────────────────────────────────
//

const MiddleMazeGenerator = () => {
  const [maze, setMaze] = useState<Maze | null>(null);
  const [solutionPath, setSolutionPath] = useState<[number, number][]>([]);
  const [exitCell, setExitCell] = useState<[number, number] | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);

  // Maze size
  const MAZE_WIDTH = 30;
  const MAZE_HEIGHT = 20;

  // Generate new maze
  const generateNewMaze = () => {
    const newMaze = generateMaze(MAZE_WIDTH, MAZE_HEIGHT);
    setMaze(newMaze);

    // Once the maze is generated, find the BFS path from center to boundary
    const { path, exitCell } = findSolutionPath(newMaze);
    setSolutionPath(path);
    setExitCell(exitCell);

    // Hide answer until user chooses "Print Answer"
    setShowAnswer(false);
  };

  useEffect(() => {
    generateNewMaze();
  }, []);

  // File uploads
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

  // Print
  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      {/* Print style for A4 page */}
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
        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={generateNewMaze}>Generate New Maze</Button>
          <Button
            onClick={() => {
              // Hide the path, print the puzzle only
              setShowAnswer(false);
              handlePrint();
            }}
          >
            Print Maze
          </Button>
          <Button
            onClick={() => {
              // Show the path, print the solution
              setShowAnswer(true);
              handlePrint();
            }}
          >
            Print Answer
          </Button>
        </div>

        {/* File Uploads (shadcn/ui) */}
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

        {/* Maze Display */}
        <div id="printable-area" className="w-full max-w-[1200px]">
          {maze && (
            <MazeSVG
              maze={maze}
              showAnswer={showAnswer}
              solutionPath={solutionPath}
              exitCell={exitCell}
              startImage={startImage || undefined}
              endImage={endImage || undefined}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MiddleMazeGenerator;
