'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

const options = [
  { label: 'Alphabet Capital', value: 'alphaCap' },
  { label: 'Alphabet Small', value: 'alphaSmall' },
  { label: 'Bangla Vowels', value: 'bengVowels' },
  { label: 'Bangla Consonents', value: 'bengCons' },
  { label: 'Bangla Numbers 0-9', value: 'bengNums' },
  { label: 'English Numbers 0-9', value: 'engNums' },
];

const dataMap: Record<string, string[]> = {
  alphaCap: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  alphaSmall: Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
  bengVowels: ['অ','আ','ই','ঈ','উ','ঊ','ঋ','এ','ঐ','ও','ঔ'],
  bengCons: [
    'ক','খ','গ','ঘ','ঙ','চ','ছ','জ','ঝ','ঞ',
    'ট','ঠ','ড','ঢ','ণ','ত','থ','দ','ধ','ন',
    'প','ফ','ব','ভ','ম','য','র','ল','শ','ষ',
    'স','হ','ড়','ঢ়','য়','ৎ','ং','ঃ','ঁ'
  ],
  bengNums: ['০','১','২','৩','৪','৫','৬','৭','৮','৯'],
  engNums: Array.from({ length: 10 }, (_, i) => `${i}`),
};

export default function PrintableGenerator() {
  const [dataset, setDataset] = useState<string>(options[0].value);
  const [availableChars, setAvailableChars] = useState<string[]>(dataMap[dataset]);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [items, setItems] = useState<string[]>([]);

  const columns = 10;
  const rows = 12;
  const totalCells = columns * rows;

  // When dataset changes, reset available and selected
  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDataset(value);
    const list = dataMap[value] || [];
    setAvailableChars(list);
    setSelectedChars([]);
  };

  // Toggle checkbox selection
  const handleCharToggle = (char: string) => {
    setSelectedChars(prev =>
      prev.includes(char)
        ? prev.filter(c => c !== char)
        : [...prev, char]
    );
  };

  const handleGenerate = () => {
    const base = selectedChars.length ? selectedChars : availableChars;
    const flat = base.flatMap(ch => Array(repeatCount).fill(ch));
    const generated = Array.from({ length: totalCells }, (_, idx) => flat[idx % flat.length]);
    setItems(generated);
  };

  const handlePrint = () => window.print();

  const rowChunks = useMemo(() => {
    const chunks: string[][] = [];
    for (let i = 0; i < rows; i++) {
      chunks.push(items.slice(i * columns, (i + 1) * columns));
    }
    return chunks;
  }, [items]);

  return (
    <div className="print-container p-4">
      <div className="flex flex-col space-y-4 print:hidden mb-4">
        {/* Dataset selector */}
        <div>
          <label htmlFor="datasetSelect" className="block font-medium mb-1">Dataset</label>
          <select
            id="datasetSelect"
            value={dataset}
            onChange={handleDatasetChange}
            className="w-48 border rounded p-1"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Checkbox list for multi-select */}
        <div>
          <span className="block font-medium mb-1">Characters (select any):</span>
          <div className="grid grid-cols-6 gap-2 max-h-40 overflow-auto border rounded p-2 w-48">
            {availableChars.map(ch => (
              <label key={ch} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={selectedChars.includes(ch)}
                  onChange={() => handleCharToggle(ch)}
                />
                <span>{ch}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Repeat count and action buttons */}
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="repeatCount" className="block font-medium mb-1">Repeat</label>
            <input
              id="repeatCount"
              type="number"
              min={1}
              value={repeatCount}
              onChange={e => setRepeatCount(parseInt(e.target.value) || 1)}
              className="w-20 border rounded p-1"
            />
          </div>
          <Button onClick={handleGenerate}>Generate</Button>
          <Button variant="secondary" onClick={handlePrint}>Print</Button>
        </div>
      </div>

      {/* Printable grid output */}
      <div
        className="printable-content border print:border-none"
        style={{ width: '210mm', height: '297mm' }}
      >
        {rowChunks.map((rowItems, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-10 gap-2 p-1">
            {rowItems.map((item, idx) => (
              <div key={idx} className="flex justify-center items-center border rounded">
                <span className="text-7xl opacity-10">{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; top: 0; left: 0; margin: 0; padding: 0; width: 210mm; height: 297mm; }
          .printable-content { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
