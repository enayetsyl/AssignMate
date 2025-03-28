// File: app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WordClue {
  word: string
  clue: string
}

interface WordPlacement extends WordObj {
  x: number
  y: number
  dir: number
}

interface WordObj {
  string: string
  char: string[]
  totalMatches: number
  effectiveMatches: number
  successfulMatches: { x: number; y: number; dir: number }[]
}

const GRID_SIZE = 32;

const Bounds = {
  top: 999,
  right: 0,
  bottom: 0,
  left: 999,
  update(x: number, y: number) {
    this.top = Math.min(y, this.top);
    this.right = Math.max(x, this.right);
    this.bottom = Math.max(y, this.bottom);
    this.left = Math.min(x, this.left);
  },
  clean() {
    this.top = 999;
    this.right = 0;
    this.bottom = 0;
    this.left = 999;
  },
};

const initialWordClues: WordClue[] = [
  { word: 'Tucan', clue: 'A tropical bird with a large beak' },
  { word: 'Dingo', clue: 'This free-ranging dog is at home in the outback.' },
  { word: 'Dolphin', clue: 'A friendly finned non-fish' },
  { word: 'Pig', clue: 'Bosses of the farm in Orwell\'s world' },
  { word: 'Kangaroo', clue: 'Boxing champions of the outback' },
  { word: 'Octopus', clue: 'Eight legged sea creature' },
  { word: 'Hamster', clue: 'Furry rodent whose teeth never stop growing' },
  { word: 'Alligator', clue: 'Dating back further than the T-rex, this reptile is a modern day dinosaur' },
  { word: 'Ostrich', clue: 'Flightless bird not know for its people skills' },
  { word: 'Koala', clue: 'Friendly version of the infamous Australian tourist terrorizing tree-dwellers' },
  { word: 'Mouse', clue: 'This poor animal is often the victim of feline aggression and human experimentation' },
  { word: 'Antelope', clue: 'The victim of every lion documentary clip you\'ve ever seen.' },
];

export default function CrosswordPage() {
  const [words, setWords] = useState<WordClue[]>(initialWordClues);
  const [board, setBoard] = useState<string[][]>([]);

  function generateBoard() {
    Bounds.clean();
    const tempBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const wordBank = words
      .map(w => w.word.toUpperCase())
      .filter(w => w.length > 1)
      .map(w => ({
        string: w,
        char: w.split(''),
        totalMatches: 0,
        effectiveMatches: 0,
        successfulMatches: []
      }));

    const placedWords: WordPlacement[] = [];

    for (let i = 0; i < wordBank.length; i++) {
      for (let j = 0; j < wordBank[i].char.length; j++) {
        for (let k = 0; k < wordBank.length; k++) {
          for (let l = 0; l < wordBank[k].char.length; l++) {
            if (i !== k && wordBank[i].char[j] === wordBank[k].char[l]) {
              wordBank[i].totalMatches++;
            }
          }
        }
      }
    }

    const tryPlaceWord = (word: WordObj): boolean => {
      if (placedWords.length === 0) {
        placedWords.push({ ...word, x: 12, y: 12, dir: 0 });
        word.char.forEach((c, i) => {
          tempBoard[12 + i][12] = c;
          Bounds.update(12 + i, 12);
        });
        return true;
      }

      word.successfulMatches = [];
      for (let j = 0; j < word.char.length; j++) {
        const curChar = word.char[j];
        for (const placed of placedWords) {
          for (let l = 0; l < placed.char.length; l++) {
            if (curChar !== placed.char[l]) continue;

            let x = placed.x;
            let y = placed.y;
            let dir = 0;

            if (placed.dir === 0) {
              dir = 1;
              x += l;
              y -= j;
            } else {
              dir = 0;
              y += l;
              x -= j;
            }

            let fits = true;
            for (let m = 0; m < word.char.length; m++) {
              const xi = dir === 0 ? x + m : x;
              const yi = dir === 1 ? y + m : y;
              if (xi < 0 || yi < 0 || xi >= GRID_SIZE || yi >= GRID_SIZE) {
                fits = false;
                break;
              }
              const existing = tempBoard[xi][yi];
              if (existing && existing !== word.char[m]) {
                fits = false;
                break;
              }
              if (dir === 0 && (tempBoard[xi][yi + 1] || tempBoard[xi][yi - 1])) {
                if (m !== j) { fits = false; break; }
              }
              if (dir === 1 && (tempBoard[xi + 1]?.[yi] || tempBoard[xi - 1]?.[yi])) {
                if (m !== j) { fits = false; break; }
              }
            }

            if (fits) {
              word.successfulMatches.push({ x, y, dir });
            }
          }
        }
      }

      if (word.successfulMatches.length === 0) return false;

      const match = word.successfulMatches[Math.floor(Math.random() * word.successfulMatches.length)];
      placedWords.push({ ...word, ...match });
      word.char.forEach((c, i) => {
        const xi = match.dir === 0 ? match.x + i : match.x;
        const yi = match.dir === 1 ? match.y + i : match.y;
        tempBoard[xi][yi] = c;
        Bounds.update(xi, yi);
      });
      return true;
    };

    for (let i = 0; i < wordBank.length; i++) {
      const success = tryPlaceWord(wordBank[i]);
      if (!success) {
        console.warn('Could not place:', wordBank[i].string);
      }
    }

    setBoard(tempBoard);
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="flex gap-2">
        <Button onClick={generateBoard}>Create</Button>
        <Button onClick={() => console.log('Play')}>Play</Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {words.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              className="w-32"
              value={entry.word}
              onChange={(e) => {
                const newWords = [...words];
                newWords[index].word = e.target.value;
                setWords(newWords);
              }}
            />
            <Input
              className="w-[500px]"
              value={entry.clue}
              onChange={(e) => {
                const newWords = [...words];
                newWords[index].clue = e.target.value;
                setWords(newWords);
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-900 text-white text-center">
        <div className="inline-block">
          {board.slice(Bounds.top - 1, Bounds.bottom + 2).map((row, i) => (
            <div key={i} className="flex">
              {row.slice(Bounds.left - 1, Bounds.right + 2).map((cell, j) => {
                // If 'cell' is non-empty, it means there's a letter placed there.
                // We'll show a WHITE cell for puzzle squares, and a BLACK cell for unused squares.
                const isUsedSquare = cell !== '';
                return (
                  <div
                    key={j}
                    className={`w-6 h-6 border border-white flex items-center justify-center
                     ${isUsedSquare ? 'bg-white' : 'bg-gray-900'}`}
                  >
                    {/* We leave the cell blank (no letter) to hide the solution. */}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
