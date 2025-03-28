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
        <svg width="32" height="32">
          <circle cx="16" cy="16" r="14" {...shapeProps} />
        </svg>
      );
    case 'triangle':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 1,31 31,31" {...shapeProps} />
        </svg>
      );
    case 'square':
      return (
        <svg width="32" height="32">
          <rect x="1" y="1" width="30" height="30" {...shapeProps} />
        </svg>
      );
    case 'rectangle':
      return (
        <svg width="40" height="32">
          <rect x="1" y="1" width="38" height="30" {...shapeProps} />
        </svg>
      );
    case 'pentagon':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 1,12 6,31 26,31 31,12" {...shapeProps} />
        </svg>
      );
    case 'hexagon':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 5,8 5,24 16,31 27,24 27,8" {...shapeProps} />
        </svg>
      );
    case 'heptagon':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 6,7 1,18 7,29 26,29 31,18 27,7" {...shapeProps} />
        </svg>
      );
    case 'octagon':
      return (
        <svg width="32" height="32">
          <polygon points="10,1 22,1 31,10 31,22 22,31 10,31 1,22 1,10" {...shapeProps} />
        </svg>
      );
    case 'nonagon':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 6,4 1,13 4,23 11,30 21,30 29,23 31,13 26,4" {...shapeProps} />
        </svg>
      );
    case 'decagon':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 7,4 1,11 1,21 7,28 16,31 25,28 31,21 31,11 25,4" {...shapeProps} />
        </svg>
      );
    case 'oval':
      return (
        <svg width="32" height="32">
          <ellipse cx="16" cy="16" rx="10" ry="14" {...shapeProps} />
        </svg>
      );
    case 'rhombus':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 31,16 16,31 1,16" {...shapeProps} />
        </svg>
      );
    case 'parallelogram':
      return (
        <svg width="32" height="32">
          <polygon points="6,1 31,1 26,31 1,31" {...shapeProps} />
        </svg>
      );
    case 'trapezium':
      return (
        <svg width="32" height="32">
          <polygon points="5,1 27,1 31,31 1,31" {...shapeProps} />
        </svg>
      );
    case 'trapezoid':
      return (
        <svg width="32" height="32">
          <polygon points="7,1 25,1 31,31 1,31" {...shapeProps} />
        </svg>
      );
    case 'kite':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 26,16 16,31 6,16" {...shapeProps} />
        </svg>
      );
    case 'star':
      return (
        <svg width="32" height="32">
          <polygon points="16,1 20,11 31,11 22,18 25,29 16,23 7,29 11,18 1,11 13,11" {...shapeProps} />
        </svg>
      );
    default:
      return (
        <svg width="32" height="32">
          <circle cx="16" cy="16" r="14" {...shapeProps} />
        </svg>
      );
  }
}


export default function ImageCountVerticalGenerator() {
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
            className="worksheet mx-auto relative flex"
            style={{ width: '210mm', height: '297mm', background: 'white' }}
          >
            {/* Grid Section (85% width) */}
            <div className="grid-section relative" style={{ width: '85%', height: '100%' }}>
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

            {/* Counting Section (15% width, moved to the right) */}
            <div
              className="counting-section flex flex-col "
              style={{ width: '15%', height: '100%', background: '#e6ffe6' }}
            >
              <h2 className="text-center font-bold mb-2">
                Count and Write
              </h2>
              <div className="grid grid-cols-1 grid-rows-10 gap-1 p-2 ">
                {imageTypes.map((_, index) => (
                  <div key={index} className="flex items-center justify-center flex-wrap gap-2">
                    {imageUrls[index] && (
                      <Image
                        src={imageUrls[index]}
                        alt="bottom image"
                        width={40}
                        height={40}
                        unoptimized
                      />
                    )}
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
