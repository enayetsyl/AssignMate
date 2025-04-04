'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageType {
  file: File | null;
  count: number;
}

// Returns an inline SVG outline for each supported shape
function getShapePlaceholder(shape: string) {
  const shapeProps = {
    stroke: 'black',
    fill: 'none',
    strokeWidth: 2,
  };

  switch (shape) {
    case 'circle':
      return (
        <svg width="64" height="64">
          <circle cx="32" cy="32" r="30" {...shapeProps} />
        </svg>
      );
    case 'triangle':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 2,62 62,62" {...shapeProps} />
        </svg>
      );
    case 'square':
      return (
        <svg width="64" height="64">
          <rect x="2" y="2" width="60" height="60" {...shapeProps} />
        </svg>
      );
    case 'rectangle':
      // Example: wider shape
      return (
        <svg width="80" height="64">
          <rect x="2" y="2" width="76" height="60" {...shapeProps} />
        </svg>
      );
    case 'pentagon':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 2,24 12,62 52,62 62,24" {...shapeProps} />
        </svg>
      );
    case 'hexagon':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 10,16 10,48 32,62 54,48 54,16" {...shapeProps} />
        </svg>
      );
    case 'heptagon':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 11,14 2,36 13,58 51,58 62,36 53,14" {...shapeProps} />
        </svg>
      );
    case 'octagon':
      return (
        <svg width="64" height="64">
          <polygon points="20,2 44,2 62,20 62,44 44,62 20,62 2,44 2,20" {...shapeProps} />
        </svg>
      );
    case 'nonagon':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 12,8 2,26 7,46 22,60 42,60 57,46 62,26 52,8" {...shapeProps} />
        </svg>
      );
    case 'decagon':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 14,8 2,22 2,42 14,56 32,62 50,56 62,42 62,22 50,8" {...shapeProps} />
        </svg>
      );
    case 'oval':
      return (
        <svg width="64" height="64">
          <ellipse cx="32" cy="32" rx="20" ry="28" {...shapeProps} />
        </svg>
      );
    case 'rhombus':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 62,32 32,62 2,32" {...shapeProps} />
        </svg>
      );
    case 'parallelogram':
      return (
        <svg width="64" height="64">
          <polygon points="12,2 62,2 52,62 2,62" {...shapeProps} />
        </svg>
      );
    case 'trapezium':
      return (
        <svg width="64" height="64">
          <polygon points="10,2 54,2 62,62 2,62" {...shapeProps} />
        </svg>
      );
    case 'trapezoid':
      return (
        <svg width="64" height="64">
          <polygon points="14,2 50,2 62,62 2,62" {...shapeProps} />
        </svg>
      );
    case 'kite':
      return (
        <svg width="64" height="64">
          <polygon points="32,2 52,32 32,62 12,32" {...shapeProps} />
        </svg>
      );
    case 'star':
      return (
        <svg width="64" height="64">
          <polygon
            points="32,2 39,22 62,22 43,36 50,58 32,46 14,58 21,36 2,22 25,22"
            {...shapeProps}
          />
        </svg>
      );
    default:
      // Fallback to a circle if no valid shape is selected
      return (
        <svg width="64" height="64">
          <circle cx="32" cy="32" r="30" {...shapeProps} />
        </svg>
      );
  }
}

export default function ImageCountGenerator() {
  const [imageTypes, setImageTypes] = useState<ImageType[]>([]);
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedShape, setSelectedShape] = useState('');

  // Generate blob URLs when 'showWorksheet' is true
  useEffect(() => {
    if (showWorksheet) {
      const urls = imageTypes.map((image) =>
        image.file ? URL.createObjectURL(image.file) : ''
      );
      setImageUrls(urls);

      // Cleanup blob URLs on unmount or re-generate
      return () => {
        urls.forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      };
    }
  }, [imageTypes, showWorksheet]);

  const addImageType = () => {
    setImageTypes([...imageTypes, { file: null, count: 0 }]);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newImageTypes = [...imageTypes];
    newImageTypes[index].file = file;
    setImageTypes(newImageTypes);
  };

  const handleCountChange = (index: number, count: number) => {
    const newImageTypes = [...imageTypes];
    newImageTypes[index].count = count;
    setImageTypes(newImageTypes);
  };

  const handleGenerate = () => {
    // Validate each entry
    const allValid = imageTypes.every((img) => img.file && img.count > 0);
    if (!allValid) {
      alert('Please upload an image and specify a count for each type.');
      return;
    }

    if (!selectedShape) {
      alert('Please select a shape before generating the worksheet.');
      return;
    }

    setShowWorksheet(true);
  };

  // Build array of image URLs, shuffle, and limit to 100
  const generateGrid = () => {
    const grid: string[] = [];
    imageTypes.forEach((image, index) => {
      if (imageUrls[index]) {
        for (let i = 0; i < image.count; i++) {
          grid.push(imageUrls[index]);
        }
      }
    });
    return grid.sort(() => Math.random() - 0.5).slice(0, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setShowWorksheet(false);
    setImageTypes([]);
    setImageUrls([]);
    setSelectedShape('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!showWorksheet ? (
        <div>
          {imageTypes.map((_, index) => (
            <div key={index} className="mb-4 flex gap-4">
              <Input
                type="file"
                onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
              />
              <Input
                type="number"
                min="0"
                placeholder="Count"
                onChange={(e) => handleCountChange(index, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}

          <div className="flex items-center gap-4 mb-4">
            <Button onClick={addImageType}>Add Image Type</Button>
            <Button onClick={handleGenerate}>Generate Worksheet</Button>

            {/* Shape Dropdown */}
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="" disabled>
                Select shape
              </option>
              <option value="circle">circle</option>
              <option value="triangle">triangle</option>
              <option value="square">square</option>
              <option value="rectangle">rectangle</option>
              <option value="pentagon">pentagon</option>
              <option value="hexagon">hexagon</option>
              <option value="heptagon">heptagon</option>
              <option value="octagon">octagon</option>
              <option value="nonagon">nonagon</option>
              <option value="decagon">decagon</option>
              <option value="oval">oval</option>
              <option value="rhombus">rhombus</option>
              <option value="parallelogram">parallelogram</option>
              <option value="trapezium">trapezium</option>
              <option value="trapezoid">trapezoid</option>
              <option value="kite">kite</option>
              <option value="star">star</option>
            </select>
          </div>
        </div>
      ) : (
        <div>
          {/* Worksheet Preview */}
          <div
            className="worksheet mx-auto relative"
            style={{ width: '210mm', height: '297mm', background: 'white' }}
          >
            {/* Top 75%: Grid of Images */}
            <div className="grid-section relative" style={{ height: '75%' }}>
              <div className="grid grid-cols-10 grid-rows-10 gap-1 p-2 w-full h-full">
                {generateGrid().map((url, index) => (
                  <div key={index} className="relative w-full h-full">
                    {url && (
                      <Image
                        src={url}
                        alt="grid item"
                        fill
                        unoptimized
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

           {/* Bottom 25%: Counting Section */}
<div
  className="counting-section flex flex-col justify-center items-center"
  style={{ height: '25%', background: '#e6ffe6' }}
>
  <h2 className="text-center font-bold mb-2">
    Count the images and write the correct number
  </h2>
  <div className="grid grid-cols-5 grid-rows-3 gap-1 p-2 w-full h-full">
    {imageTypes.map((_, index) => (
      <div key={index} className="flex items-center flex-wrap gap-2">
        {/* Render the bottom image if there's a valid URL */}
        {imageUrls[index] && (
          <Image
            src={imageUrls[index]}
            alt="bottom image"
            width={40}
            height={40}
            unoptimized
          />
        )}
        {/* Render the selected shape placeholder */}
        {getShapePlaceholder(selectedShape)}
      </div>
    ))}
  </div>
</div>

          </div>

          {/* Buttons and Note */}
          <div className="mt-4 flex items-center gap-2 justify-center">
            <Button onClick={handlePrint} className="print-button">
              Print Worksheet
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Create New Worksheet
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Note: Use high-quality images for better print results.
          </p>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .worksheet,
          .worksheet * {
            visibility: visible;
          }
          .worksheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
          }
          .print-button,
          .text-sm {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
