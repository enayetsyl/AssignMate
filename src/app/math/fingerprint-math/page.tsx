'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // from shadcn/ui
import { Input } from '@/components/ui/input';   // from shadcn/ui

const colorOptions = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'teal',
  'brown',
  'gray',
];

// Define available images (files in public folder)
const imageOptionsList = [
  { label: 'Image 1', value: '/apple.jpg' },
  { label: 'Image 2', value: '/avacado.jpg' },
  { label: 'Image 3', value: '/begun.png' },
  { label: 'Image 4', value: '/capcicum.png' },
  { label: 'Image 5', value: '/coconut.jpg' },
  { label: 'Image 6', value: '/kumra.jpg' },
  { label: 'Image 7', value: '/lemon.jpg' },
  { label: 'Image 8', value: '/malta.jpg' },
  { label: 'Image 9', value: '/mango.jpg' },
  { label: 'Image 10', value: '/mango2.jpg' },
  { label: 'Image 11', value: '/orange.jpg' },
  { label: 'Image 12', value: '/pear.jpg' },
  { label: 'Image 13', value: '/shalgom.png' },
  { label: 'Image 14', value: '/strawberry.png' },
  { label: 'Image 15', value: '/strawberry1.png' },
  { label: 'Image 16', value: '/strawbery2.jpg' },
  { label: 'Image 17', value: '/tree.jpg' },
];

// A single question component
function MathQuestion() {
  // Admin fields (hidden on print)
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operator, setOperator] = useState('+');
  const [color1, setColor1] = useState(colorOptions[0]);
  const [color2, setColor2] = useState(colorOptions[1]);
  // Use dropdown to select an image from public folder
  const [selectedImage, setSelectedImage] = useState<string>(imageOptionsList[0].value);
  const [imageCount, setImageCount] = useState<number>(1);

  // Render the selected image multiple times with increasing number labels
  const renderImages = () => {
    const items = [];
    for (let i = 0; i < imageCount; i++) {
      items.push(
        <div key={i} className="w-12 h-12 relative flex flex-col items-center">
          <Image
            src={selectedImage}
            alt={`Selected ${i + 1}`}
            fill
            style={{ objectFit: 'contain' }}
          />
          <span className="text-xs">{i + 1}</span>
        </div>
      );
    }
    return items;
  };

  return (
    <div className="border p-4 rounded shadow-sm my-4 container mx-auto">
      {/* ----- Admin Input Fields (hidden on print) ----- */}
      <div className="no-print space-y-2 mb-4">
        <div>
          <label className="block text-sm font-medium">First Number:</label>
          <Input
            type="number"
            value={num1}
            onChange={(e) => setNum1(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Second Number:</label>
          <Input
            type="number"
            value={num2}
            onChange={(e) => setNum2(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Operator:</label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="border rounded p-1 w-full"
          >
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">*</option>
            <option value="/">/</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium">Color 1:</label>
            <select
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="border rounded p-1"
            >
              {colorOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Color 2:</label>
            <select
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="border rounded p-1"
            >
              {colorOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* ----- New Image Selection Dropdown ----- */}
        <div>
          <label className="block text-sm font-medium">Select Image:</label>
          <select
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
            className="border rounded p-1 w-full"
          >
            {imageOptionsList.map((img) => (
              <option key={img.value} value={img.value}>
                {img.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Image Count:</label>
          <Input
            type="number"
            min={1}
            value={imageCount}
            onChange={(e) => setImageCount(Number(e.target.value))}
          />
        </div>
      </div>

      {/* ----- Printed/Displayed Output ----- */}
      {/* Line 1: Colored ovals */}
      <div className="flex justify-center gap-10 mb-2 mr-10">
        <div className="flex flex-col items-center">
          <div
            className="w-6 h-6 rounded-full mb-1"
            style={{ backgroundColor: color1 }}
          />
        </div>
        <div className="flex flex-col items-center">
          <div
            className="w-6 h-6 rounded-full mb-1"
            style={{ backgroundColor: color2 }}
          />
        </div>
      </div>

      {/* Line 2: Equation with square boxes */}
      <div className="flex items-center justify-center my-2 space-x-2">
        <span className="text-lg border border-black w-10 h-10 flex justify-center items-center">
          {num1 || '?'}
        </span>
        <span className="text-lg">{operator}</span>
        <div className="border border-black w-10 h-10 text-center" />
        <span className="text-lg">=</span>
        <div className="border border-black w-10 h-10 text-center" />
      </div>

      {/* Line 3: Images in a row */}
      <div className="flex flex-wrap gap-2 justify-center">
        {renderImages()}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [pageHeading, setPageHeading] = useState<string>('My Worksheet');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 container mx-auto">
      {/* ----- Navbar / Top Menu (hidden on print) ----- */}
      <nav className="no-print mb-4 flex justify-between items-center bg-gray-200 p-2">
        <h2 className="text-lg font-bold">AssignMate</h2>
        <div>Menu Item</div>
      </nav>

      {/* ----- Page Heading Input (editable in normal view, hidden on print) ----- */}
      <div className="no-print mb-4">
        <label className="block font-medium text-xl mb-2">Page Heading:</label>
        <Input
          type="text"
          value={pageHeading}
          onChange={(e) => setPageHeading(e.target.value)}
        />
      </div>

      {/* ----- Printable Worksheet Area ----- */}
      <div className="print-area">
        {/* The page heading appears at the top of the printable area */}
        <h1 className="text-2xl font-bold text-center mb-6">
          {pageHeading}
        </h1>

        {/* 6 Question Components arranged in your desired layout */}
        <div className="grid grid-cols-2 gap-4">
          <MathQuestion />
          <MathQuestion />
        </div>
        <MathQuestion />
        <div className="grid grid-cols-2 gap-4">
          <MathQuestion />
          <MathQuestion />
        </div>
        <MathQuestion />
      </div>

      {/* ----- Print Button (hidden on print) ----- */}
      <div className="no-print mt-6 flex justify-center">
        <Button onClick={handlePrint}>Print Worksheet</Button>
      </div>

      {/* ----- Print Styles ----- */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 20;
        }
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          /* Show only .print-area and its children */
          .print-area,
          .print-area * {
            visibility: visible;
          }
          /* Hide elements with .no-print */
          .no-print {
            display: none !important;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
