"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Define the Maze type
type Maze = {
  horizontalWalls: boolean[][];
  verticalWalls: boolean[][];
};

// Utility function to shuffle an array (Fisher-Yates shuffle)
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to generate the maze using recursive backtracking
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

// Component to render the maze as an SVG
interface MazeSVGProps {
  maze: Maze;
}

const MazeSVG = ({ maze }: MazeSVGProps) => {
  const { horizontalWalls, verticalWalls } = maze;
  const height = horizontalWalls.length - 1;
  const width = verticalWalls[0].length - 1;
  const cellSize = 20;
  const svgWidth = width * cellSize;
  const svgHeight = height * cellSize;

  return (
    <svg width={svgWidth} height={svgHeight}>
      {/* Render horizontal walls */}
      {horizontalWalls.map((row, y) =>
        row.map((wall, x) =>
          wall ? (
            <line
              key={`h-${y}-${x}`}
              x1={x * cellSize}
              y1={y * cellSize}
              x2={(x + 1) * cellSize}
              y2={y * cellSize}
              stroke="black"
            />
          ) : null
        )
      )}
      {/* Render vertical walls */}
      {verticalWalls.map((row, y) =>
        row.map((wall, x) =>
          wall ? (
            <line
              key={`v-${y}-${x}`}
              x1={x * cellSize}
              y1={y * cellSize}
              x2={x * cellSize}
              y2={(y + 1) * cellSize}
              stroke="black"
            />
          ) : null
        )
      )}
      {/* Start marker (top-left) */}
      <circle
        cx={0.5 * cellSize}
        cy={0.5 * cellSize}
        r={cellSize / 4}
        fill="green"
      />
      {/* End marker (bottom-right) */}
      <circle
        cx={(width - 0.5) * cellSize}
        cy={(height - 0.5) * cellSize}
        r={cellSize / 4}
        fill="red"
      />
    </svg>
  );
};

// Main MathGridzGenerator component
const MathGridzGenerator = () => {
  const [maze, setMaze] = useState<Maze | null>(null);

  const generateNewMaze = () => {
    const width = 10;
    const height = 10;
    const newMaze = generateMaze(width, height);
    setMaze(newMaze);
  };

  // Generate a maze when the component mounts
  useEffect(() => {
    generateNewMaze();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button onClick={generateNewMaze}>Generate New Maze</Button>
      {maze && <MazeSVG maze={maze} />}
    </div>
  );
};

export default MathGridzGenerator;