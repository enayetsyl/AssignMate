'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomizablePrintCardProps {
  questionNumber: string;
  heading: string;
  question: string;
  options: string[];
  // Optional initial customization values
  initialBgColor?: string;
  initialTextBgColor?: string;
  initialTextColor?: string;
  initialImagePosition?: 'left' | 'right';
  initialImageUrl?: string;
}

const bgColorOptions = [
  { label: 'Blue', value: 'bg-blue-200' },
  { label: 'Green', value: 'bg-green-200' },
  { label: 'Yellow', value: 'bg-yellow-200' },
  { label: 'Red', value: 'bg-red-200' },
  { label: 'Purple', value: 'bg-purple-200' },
];

const textBgColorOptions = [
  { label: 'White', value: 'bg-white' },
  { label: 'Gray', value: 'bg-gray-100' },
  { label: 'Yellow', value: 'bg-yellow-100' },
  { label: 'Light Blue', value: 'bg-blue-100' },
];

const textColorOptions = [
  { label: 'Black', value: 'text-black' },
  { label: 'Gray', value: 'text-gray-800' },
  { label: 'Blue', value: 'text-blue-800' },
  { label: 'Green', value: 'text-green-800' },
];

const imagePositionOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
];

const CustomizablePrintCard: React.FC<CustomizablePrintCardProps> = ({
  questionNumber,
  heading,
  question,
  options,
  initialBgColor = 'bg-blue-200',
  initialTextBgColor = 'bg-white',
  initialTextColor = 'text-black',
  initialImagePosition = 'left',
  initialImageUrl = '',
}) => {
  const [bgColor, setBgColor] = useState<string>(initialBgColor);
  const [textBgColor, setTextBgColor] = useState<string>(initialTextBgColor);
  const [textColor, setTextColor] = useState<string>(initialTextColor);
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>(initialImagePosition);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(initialImageUrl);

  // Handler for image file input changes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
    }
  };

  return (
    <div className={`p-4 rounded-md shadow-md ${bgColor} max-w-md mx-auto`}>
      {/* Header area */}
      <div className="flex justify-between items-center mb-4">
        {imagePosition === 'left' && uploadedImageUrl && (
          <div className="w-8 h-8">
            <Image src={uploadedImageUrl} alt="Uploaded" width={32} height={32} />
          </div>
        )}
        <span className="font-bold">{heading}</span>
        <span className="font-bold">{questionNumber}</span>
        {imagePosition === 'right' && uploadedImageUrl && (
          <div className="w-8 h-8">
            <Image src={uploadedImageUrl} alt="Uploaded" width={32} height={32} />
          </div>
        )}
      </div>

      {/* Main content: question & options */}
      <div className={`p-4 rounded ${textBgColor} ${textColor}`}>
        <p className="font-semibold mb-2">{question}</p>
        <ul className="space-y-1">
          {options.map((opt, idx) => (
            <li key={idx}>{`${String.fromCharCode(97 + idx)}) ${opt}`}</li>
          ))}
        </ul>
      </div>

      {/* Customization controls */}
      <div className="mt-4 space-y-3">
        <div>
          <Label>Background Color</Label>
          <Select value={bgColor} onValueChange={(val) => setBgColor(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Background Color" />
            </SelectTrigger>
            <SelectContent>
              {bgColorOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Text Background Color</Label>
          <Select value={textBgColor} onValueChange={(val) => setTextBgColor(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Text BG Color" />
            </SelectTrigger>
            <SelectContent>
              {textBgColorOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Text Color</Label>
          <Select value={textColor} onValueChange={(val) => setTextColor(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Text Color" />
            </SelectTrigger>
            <SelectContent>
              {textColorOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Image Position</Label>
          <Select value={imagePosition} onValueChange={(val: 'left' | 'right') => setImagePosition(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Image Position" />
            </SelectTrigger>
            <SelectContent>
              {imagePositionOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Upload Image</Label>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>
    </div>
  );
};

export default CustomizablePrintCard;
