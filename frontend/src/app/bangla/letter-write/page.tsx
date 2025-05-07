// components/ScatterPuzzle.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

type ScatterItem = {
  letter: string;
  top: number;      // percent
  left: number;     // percent
  rotation: number; // deg
};

// — Character sets (unchanged) —
const englishCaps = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);
const englishSmall = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(97 + i)
);
const banglaLetters = [
  'অ','আ','ই','ঈ','উ','ঊ','এ','ঐ','ও','ঔ',
  'ক','খ','গ','ঘ','ঙ','চ','ছ','জ','ঝ','ঞ',
  'ট','ঠ','ড','ঢ','ণ','ত','থ','দ','ধ','ন',
  'প','ফ','ব','ভ','ম','য','র','ল','শ','ষ','স','হ',
];
const mathEnglish = Array.from({ length: 10 }, (_, i) => i.toString());
const mathBangla = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];

// A small palette to cycle through in the title
const palettes = [
  'text-red-500',
  'text-green-500',
  'text-blue-500',
  'text-yellow-500',
  'text-purple-500',
  'text-pink-500',
];

// Helpers (unchanged)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function ScatterPuzzle() {
  // — State —
  const [type, setType] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState<number>(8);
  const [letterSize, setLetterSize] = useState<number>(60);
  const [scatter, setScatter] = useState<ScatterItem[]>([]);

  // Toggle a letter on/off
  const toggleOpt = (opt: string) => {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((c) => c !== opt) : [...prev, opt]
    );
  };

  // Switch character set
  const handleTypeChange = (val: string) => {
    setType(val);
    setSelected([]);
    setScatter([]);
    switch (val) {
      case 'english-capital':
        setOptions(englishCaps);
        break;
      case 'english-small':
        setOptions(englishSmall);
        break;
      case 'bangla':
        setOptions(banglaLetters);
        break;
      case 'math-english':
        setOptions(mathEnglish);
        break;
      case 'math-bangla':
        setOptions(mathBangla);
        break;
      default:
        setOptions([]);
    }
  };

  // Generate the scatter
  const handleGenerate = () => {
    if (!type || selected.length === 0) return;

    // 1) Repeat each chosen letter count-times
    const picks: string[] = [];
    selected.forEach((ch) => {
      for (let i = 0; i < count; i++) picks.push(ch);
    });

    // 2) Distractors only from non-selected (or full set if none left)
    const pool = options.filter((o) => !selected.includes(o));
    const distractorPool = pool.length > 0 ? pool : options;
    const distractors: string[] = [];
    // <-- REDUCED from *3 to *2 to lower density -->
    for (let i = 0; i < picks.length * 2; i++) {
      const r =
        distractorPool[Math.floor(Math.random() * distractorPool.length)];
      distractors.push(r);
    }

    // 3) Shuffle all
    const all = shuffle([...picks, ...distractors]);

    // 4) Layout with larger spacing to avoid overlaps
    const MIN_X = 10;   // <-- was 5% -->
    const MIN_Y = 10;   // <-- was 7% -->
    const BUFFER = 8;   // percent from page edges
    const layout: ScatterItem[] = [];

    all.forEach((letter) => {
      for (let tries = 0; tries < 300; tries++) {
        const top = randomBetween(BUFFER, 100 - MIN_Y - BUFFER);
        const left = randomBetween(BUFFER, 100 - MIN_X - BUFFER);
        const tooClose = layout.some(
          (it) =>
            Math.abs(it.top - top) < MIN_Y &&
            Math.abs(it.left - left) < MIN_X
        );
        if (!tooClose) {
          layout.push({
            letter,
            top,
            left,
            rotation: randomBetween(-45, 45),
          });
          break;
        }
      }
    });

    setScatter(layout);
  };

  return (
    <>
      {/* — Print Styles — */}
      <style jsx global>{`
        @page {
          size: A4 landscape;
         
        }
        @media print {
          /* hide everything by default */
          body * {
            visibility: hidden !important;
          }
          /* show only the print-area */
          #print-area,
          #print-area * {
            visibility: visible !important;
          }
          /* pin to full page, then scale down slightly so no spillover */
          #print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform-origin: top left;
            transform: scale(0.92);     /* <-- scale down so it never overflows */
          }
        }
      `}</style>

      {/* — On-screen Controls (hidden in print) — */}
      <div className="p-4 print:hidden space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* 1) Character set */}
          <Select onValueChange={handleTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select type…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english-capital">
                English Capital
              </SelectItem>
              <SelectItem value="english-small">English Small</SelectItem>
              <SelectItem value="bangla">Bangla</SelectItem>
              <SelectItem value="math-english">Math English</SelectItem>
              <SelectItem value="math-bangla">Math Bangla</SelectItem>
            </SelectContent>
          </Select>

          {/* 2) Multi-select letters */}
          <Command className="w-48">
            <CommandInput placeholder="Choose letters…" />
            <CommandList className="max-h-60 overflow-auto">
              <CommandEmpty>No options</CommandEmpty>
              {options.map((opt) => (
                <CommandItem key={opt} onSelect={() => toggleOpt(opt)}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={selected.includes(opt)}
                      className="mr-2"
                    />
                    {opt}
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>

          {/* 3) Repeat count */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Count</label>
            <Input
              type="number"
              min={8}
              max={20}
              value={count}
              onChange={(e) =>
                setCount(Math.max(8, Math.min(20, Number(e.target.value))))
              }
              className="w-24"
            />
          </div>

          {/* 4) Letter size */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Letter size (px)</label>
            <Input
              type="number"
              min={16}
              max={200}
              value={letterSize}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 16 && v <= 200) setLetterSize(v);
              }}
              className="w-24"
            />
          </div>
        </div>

        {/* Generate & Print */}
        <div className="flex space-x-2">
          <Button onClick={handleGenerate}>Generate</Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      {/* — Printable Area — */}
      <div id="print-area" className="flex flex-col w-full h-full p-[5px]">
        {scatter.length > 0 && (
          <>
            <h1 className="text-[32px] font-bold mb-4">
              Find out {count}{' '}
              {selected.map((ch, i) => (
                <React.Fragment key={ch}>
                  {i > 0 && ', '}
                  <span className={palettes[i % palettes.length]}>{ch}</span>
                </React.Fragment>
              ))}
            </h1>

            <div className="relative flex-1">
              {scatter.map((item, i) => (
                <div
                  key={i}
                  className="absolute p-[5px] opacity-20"
                  style={{
                    top: `${item.top}%`,
                    left: `${item.left}%`,
                    transform: `rotate(${item.rotation}deg)`,
                    fontSize: `${letterSize}px`,
                  }}
                >
                  {item.letter}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
