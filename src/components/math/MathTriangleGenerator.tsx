'use client';
import React, { useState } from 'react';

interface NodeData {
  id: number;
  value: number | null;
  x: number;
  y: number;
}

interface Connection {
  from: number;
  to: number;
  operator: '+' | '-';
  number: number;
}

interface PuzzleData {
  nodes: NodeData[];
  connections: Connection[];
}

const Node: React.FC<{ value: number | null; onChange?: (value: string) => void }> = ({ value, onChange }) => {
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-200 shadow-md">
      {value !== null ? (
        <span className="text-lg font-semibold">{value}</span>
      ) : (
        <input
          type="number"
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full h-full text-center bg-transparent border-none focus:outline-none text-lg"
          placeholder="?"
        />
      )}
    </div>
  );
};

const MathPuzzle: React.FC = () => {
  const puzzle: PuzzleData = {
    nodes: [
      { id: 0, value: 2, x: 20, y: 20 },
      { id: 1, value: 6, x: 80, y: 20 },
      { id: 2, value: 3, x: 20, y: 80 },
      { id: 3, value: null, x: 80, y: 80 },
    ],
    connections: [
      { from: 0, to: 2, operator: '+', number: 1 },
      { from: 1, to: 3, operator: '+', number: 3 },
      { from: 2, to: 3, operator: '+', number: 6 },
    ],
  };

  const [answer, setAnswer] = useState<string>('');
  const nullNode = puzzle.nodes.find((node) => node.value === null);

  const checkAnswer = (): boolean => {
    if (!nullNode || !answer) return false;
    const incomingConnections = puzzle.connections.filter((conn) => conn.to === nullNode.id);
    const expectedValues = incomingConnections.map((conn) => {
      const fromNode = puzzle.nodes.find((n) => n.id === conn.from);
      if (!fromNode || fromNode.value === null) return NaN;
      return conn.operator === '+' ? fromNode.value + conn.number : fromNode.value - conn.number;
    });
    const userAnswer = parseInt(answer, 10);
    return expectedValues.every((val) => val === userAnswer && !isNaN(val));
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Math Puzzle Adventure</h1>
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
        {/* SVG for arrows */}
        <svg className="absolute inset-0" width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>
          {puzzle.connections.map((conn, index) => {
            const fromNode = puzzle.nodes.find((n) => n.id === conn.from);
            const toNode = puzzle.nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={index}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke="black"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {puzzle.nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <Node value={node.value} onChange={node.value === null ? setAnswer : undefined} />
          </div>
        ))}

        {/* Operation Labels */}
        {puzzle.connections.map((conn, index) => {
          const fromNode = puzzle.nodes.find((n) => n.id === conn.from);
          const toNode = puzzle.nodes.find((n) => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          return (
            <div
              key={index}
              className="absolute text-sm font-medium bg-white px-1 rounded"
              style={{ left: `${midX}%`, top: `${midY}%`, transform: 'translate(-50%, -50%)' }}
            >
              {conn.operator}
              {conn.number}
            </div>
          );
        })}

        {/* Feedback */}
        {answer && (
          <div
            className={`absolute bottom-4 left-4 text-lg font-bold ${
              checkAnswer() ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {checkAnswer() ? 'Correct!' : 'Try again'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MathPuzzle;