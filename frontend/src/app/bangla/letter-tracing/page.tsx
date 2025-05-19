'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

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
  bengNums: Array.from({ length: 10 }, (_, i) => {
    const bengDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return bengDigits[i];
  }),
  engNums: Array.from({ length: 10 }, (_, i) => `${i}`),
};

export default function PrintableGenerator() {
  const [selection, setSelection] = useState<string>(options[0].value);
  const [items, setItems] = useState<string[]>([]);

  const handleGenerate = () => setItems(dataMap[selection] || []);
  const handlePrint = () => window.print();

  // grid settings: 10 columns, 15 rows = 150 cells per page
  const columns = 10;
  const rows = 15;
  const totalCells = columns * rows;

  // fill cells by repeating items
  const displayItems = useMemo(() => {
    if (!items.length) return [];
    return Array.from({ length: totalCells }, (_, idx) => items[idx % items.length]);
  }, [items, totalCells]);

  // break into rows
  const rowChunks = useMemo(() => {
    const chunks: string[][] = [];
    for (let i = 0; i < rows; i++) {
      chunks.push(displayItems.slice(i * columns, (i + 1) * columns));
    }
    return chunks;
  }, [displayItems, rows, columns]);

  return (
    <div className="print-container p-4">
      <div className="flex items-center space-x-2 print:hidden mb-4">
        <Select onValueChange={setSelection} defaultValue={selection}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerate}>Generate</Button>
        <Button variant="secondary" onClick={handlePrint}>Print</Button>
      </div>

      <div
        className="printable-content border print:border-none"
        style={{ width: '210mm', height: '297mm' }}
      >
        {rowChunks.map((rowItems, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-10 gap-2 p-1"
          >
            {rowItems.map((item, idx) => (
              <div key={idx} className="flex justify-center items-center border rounded">
                <span className="text-7xl opacity-10">

                {item}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container {
            position: absolute; top: 0; left: 0; margin: 0; padding: 0;
            width: 210mm; height: 297mm;
          }
          .printable-content { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}