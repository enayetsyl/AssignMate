"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageType {
  file: File;
  count: number;
}

export default function ImageCountGenerator() {
  const [imageTypes, setImageTypes] = useState<ImageType[]>([]);
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Clean up image URLs when component unmounts or images change
  useEffect(() => {
    if (showWorksheet) {
      const urls = imageTypes.map((image) => URL.createObjectURL(image.file));
      setImageUrls(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }
  }, [imageTypes, showWorksheet]);

  const addImageType = () => {
    setImageTypes([...imageTypes, { file: null, count: 0 }]);
  };

  const handleFileChange = (index: number, file: File) => {
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
    if (imageTypes.every((img) => img.file && img.count > 0)) {
      setShowWorksheet(true);
    } else {
      alert('Please upload an image and specify a count for each type.');
    }
  };

  const generateGrid = () => {
    const grid: string[] = [];
    imageTypes.forEach((image, index) => {
      for (let i = 0; i < image.count; i++) {
        grid.push(imageUrls[index]);
      }
    });
    return grid.sort(() => Math.random() - 0.5).slice(0, 50); // Limit to 50 for 5x10 grid
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setShowWorksheet(false);
    setImageTypes([]);
    setImageUrls([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!showWorksheet ? (
        <div>
          {imageTypes.map((_, index) => (
            <div key={index} className="mb-4 flex gap-4">
              <Input 
                type="file" 
                onChange={(e) => handleFileChange(index, e.target.files[0])} 
              />
              <Input
                type="number"
                min="0"
                placeholder="Count"
                onChange={(e) => handleCountChange(index, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
          <Button onClick={addImageType} className="mr-2">Add Image Type</Button>
          <Button onClick={handleGenerate}>Generate Worksheet</Button>
        </div>
      ) : (
        <div>
          {/* Worksheet Preview */}
          <div 
            className="worksheet mx-auto" 
            style={{ width: '210mm', height: '297mm', background: 'white' }}
          >
            {/* Top 75%: Grid of Images */}
            <div className="grid-section" style={{ height: '75%' }}>
              <div className="grid grid-cols-10 grid-rows-5 gap-1 p-2">
                {generateGrid().map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt="grid item"
                    className="w-full h-full object-contain"
                  />
                ))}
              </div>
            </div>

            {/* Bottom 25%: Counting Section */}
            <div className="counting-section" style={{ height: '25%', background: '#e6ffe6' }}>
              <div className="flex justify-around items-center h-full">
                {imageTypes.map((image, index) => (
                  <div key={index} className="flex items-center">
                    <img 
                      src={imageUrls[index]} 
                      alt="image type" 
                      className="w-10 h-10 mr-2" 
                    />
                    <div className="flex gap-1">
                      {[1].map((_, i) => (
                        <div
                          key={i}
                          className="w-20 h-20 border border-black rounded-full bg-white"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons and Note */}
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={handlePrint} className="print-button">Print Worksheet</Button>
            <Button variant="secondary" onClick={handleReset}>Create New Worksheet</Button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
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