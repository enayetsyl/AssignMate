'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// ------------------------------------------------------------------
// 1) Check if two axis-aligned boxes overlap
// ------------------------------------------------------------------
function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  );
}

// ------------------------------------------------------------------
// 2) Place items without overlap in a bounding box
// ------------------------------------------------------------------
function placeItemsWithoutOverlap(
  count: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  sizeMin: number,
  sizeMax: number,
  existingBoxes: { x: number; y: number; w: number; h: number }[],
  maxAttempts = 100
) {
  const placed = [];

  // Helper: random in [min..max]
  const randomInRange = (mn: number, mx: number) =>
    Math.random() * (mx - mn) + mn;

  for (let i = 0; i < count; i++) {
    let placedThisOne = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const size = randomInRange(sizeMin, sizeMax);
      // Choose random x, y so the item is fully inside [xMin..xMax, yMin..yMax]
      const x = randomInRange(xMin, xMax - size);
      const y = randomInRange(yMin, yMax - size);

      const newBox = { x, y, w: size, h: size };
      // Check overlap
      const overlap = existingBoxes.some((box) => boxesOverlap(box, newBox));
      if (!overlap) {
        // Place it
        existingBoxes.push(newBox);
        placed.push(newBox);
        placedThisOne = true;
        break;
      }
    }

    if (!placedThisOne) {
      console.warn('Skipped an item due to overlap or no space left.');
    }
  }

  return placed;
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
const DynamicA4WorkbookPage: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [leftCount, setLeftCount] = useState<number>(0);
  const [rightCount, setRightCount] = useState<number>(0);
  const [flipLeft, setFlipLeft] = useState<boolean>(false);
  const [flipRight, setFlipRight] = useState<boolean>(false);

  // We'll store all scattered items (both left & right) in a single array
  // Each item: { side: 'left' | 'right', x, y, size }
  const [positions, setPositions] = useState<
    { side: 'left' | 'right'; x: number; y: number; size: number }[]
  >([]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Recompute positions whenever imageSrc, leftCount, or rightCount changes
  useEffect(() => {
    if (!imageSrc || (leftCount + rightCount) === 0) {
      setPositions([]);
      return;
    }

    // A4 page size in mm
    const pageWidth = 210;  // mm
    const pageHeight = 297; // mm

    // 3 rows in a grid:
    //   top: 5% (heading)
    //   middle: 80% (for scattered items)
    //   bottom: 15%
    // For simpler math:
    const headingHeight = pageHeight * 0.05; // ~14.85mm
    const bottomHeight = pageHeight * 0.15;  // ~44.55mm
    let mainContentHeight = pageHeight - headingHeight - bottomHeight; // ~237.6mm

    // 1) Add a 5mm margin at the bottom so items can't sit on the boundary
    const bottomMargin = 5; // mm
    mainContentHeight -= bottomMargin; // e.g. ~232.6mm now

    // We'll track all bounding boxes for collision detection
    const existingBoxes: { x: number; y: number; w: number; h: number }[] = [];

    // 2) Place "left" items (but let them appear anywhere in the middle region)
    //    Use smaller sizeMax so we can fit more
    const leftPlaced = placeItemsWithoutOverlap(
      leftCount,
      0,                 // xMin
      pageWidth,         // xMax = 210
      0,                 // yMin
      mainContentHeight, // yMax
      20,                // sizeMin (mm)
      30,                // sizeMax (mm) - reduced from 50
      existingBoxes,
      200                // maxAttempts
    );

    const leftPositions = leftPlaced.map((box) => ({
      side: 'left' as const,
      x: box.x,
      y: box.y,
      size: box.w,
    }));

    // 3) Place "right" items similarly
    const rightPlaced = placeItemsWithoutOverlap(
      rightCount,
      0,
      pageWidth,
      0,
      mainContentHeight,
      20,
      30, // same smaller max size
      existingBoxes,
      200
    );

    const rightPositions = rightPlaced.map((box) => ({
      side: 'right' as const,
      x: box.x,
      y: box.y,
      size: box.w,
    }));

    // Combine them
    setPositions([...leftPositions, ...rightPositions]);
  }, [imageSrc, leftCount, rightCount]);

  return (
    <>
      {/* Input Section */}
      <div className="p-4 bg-gray-100">
        <div className="flex flex-col gap-4">
          <label className="font-semibold">
            Upload Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border p-2 mt-1"
            />
          </label>
          <div className="flex gap-4">
            <label className="font-semibold">
              Left Items:
              <input
                type="number"
                value={leftCount}
                onChange={(e) => setLeftCount(Number(e.target.value))}
                className="border p-1 ml-2"
                min="0"
              />
            </label>
            <label className="font-semibold">
              Right Items:
              <input
                type="number"
                value={rightCount}
                onChange={(e) => setRightCount(Number(e.target.value))}
                className="border p-1 ml-2"
                min="0"
              />
            </label>
          </div>
          <div className="flex gap-4">
            <label className="font-semibold">
              Flip Left Images:
              <input
                type="checkbox"
                checked={flipLeft}
                onChange={(e) => setFlipLeft(e.target.checked)}
                className="ml-2"
              />
            </label>
            <label className="font-semibold">
              Flip Right Images:
              <input
                type="checkbox"
                checked={flipRight}
                onChange={(e) => setFlipRight(e.target.checked)}
                className="ml-2"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
@media print {
  /* Hide everything by default */
  body * {
    visibility: hidden;
  }
  /* Show only #printable-area */
  #printable-area,
  #printable-area * {
    visibility: visible;
  }
  /* Position and size #printable-area as needed */
  #printable-area {
    position: absolute;
    inset: 0; /* top:0; right:0; bottom:0; left:0; */
    width: 100vw;
    height: 100vh;
  }
  /* Optional: Force page size + margins */
  @page {
    size: A4 portrait;
    margin: 1cm;
  }
}

      `}</style>

      {/* A4 Page Container */}
      {imageSrc && (leftCount > 0 || rightCount > 0) && (
        <div
          className="a4-page border shadow-lg bg-white mx-auto mt-4"
          style={{ width: '210mm', height: '297mm' }}
        >
          {/* 3-row grid: 5% heading, 80% middle, 15% bottom */}
          <div id="printable-area" className="grid grid-rows-[5%_80%_15%] h-full ">
            {/* Top (5%): Heading */}
            <div className="flex items-center justify-center text-4xl font-bold text-red-600">
              HOW MANY?
            </div>

            {/* Middle (80%): position: relative for scattered items */}
            <div className="relative w-full h-full overflow-hidden">
              {positions.map((pos, index) => {
                // Flip logic
                // "left" items => flipLeft
                // "right" items => flipRight
                const isFlipped =
                  (pos.side === 'left' && flipLeft) ||
                  (pos.side === 'right' && flipRight);

                // We'll offset by the heading's 5% so they appear
                // in the middle row visually.
                const headingHeight = 0.05 * 297; // ~14.85mm

                return (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      top: `calc(${headingHeight}mm + ${pos.y}mm)`,
                      left: `${pos.x}mm`,
                      width: `${pos.size}mm`,
                      height: `${pos.size}mm`,
                      transform: isFlipped ? 'scaleX(-1)' : 'none',
                    }}
                  >
                    <Image
                      src={imageSrc}
                      alt="Item"
                      fill
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </div>
                );
              })}
            </div>

            {/* Bottom (15%): answer area */}
            <div className="relative w-full h-full">
              {/* Horizontal line at the top + background color */}
              <hr className="absolute top-0 left-0 w-full border-gray-400" />
              <div className="w-full h-full bg-gray-100 flex items-center justify-around">
                {/* Left Count Circle */}
                {leftCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div
                      className="relative"
                      style={{ height: '30mm', width: '30mm' }}
                    >
                      <Image
                        src={imageSrc}
                        alt="Left small image"
                        fill
                        style={{
                          objectFit: 'contain',
                          transform: flipLeft ? 'scaleX(-1)' : 'none',
                        }}
                        unoptimized
                      />
                    </div>
                    <div className="count-circle w-[20mm] h-[20mm] border-2 border-red-500 rounded-full" />
                  </div>
                )}

                {/* Right Count Circle */}
                {rightCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div
                      className="relative"
                      style={{ height: '30mm', width: '30mm' }}
                    >
                      <Image
                        src={imageSrc}
                        alt="Right small image"
                        fill
                        style={{
                          objectFit: 'contain',
                          transform: flipRight ? 'scaleX(-1)' : 'none',
                        }}
                        unoptimized
                      />
                    </div>
                    <div className="count-circle w-[20mm] h-[20mm] border-2 border-red-500 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Button */}
      {imageSrc && (leftCount > 0 || rightCount > 0) && (
        <Button
          onClick={() => window.print()}
          className="mt-4 mx-auto block bg-red-600 hover:bg-red-700 text-white"
        >
          Print
        </Button>
      )}
    </>
  );
};

export default DynamicA4WorkbookPage;
