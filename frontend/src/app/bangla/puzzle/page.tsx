'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomSingleWordPuzzle from '@/components/bangla/CustomSingleWordPuzzle';
import BanglaMultiWordPuzzleEasy from '@/components/bangla/BanglaMultiWordPuzzleEasy';
import BanglaMultiWordPuzzleGeneratorMedium from '@/components/bangla/BanglaMultiWordPuzzleGeneratorMedium';
import BanglaMultiWordPuzzleGeneratorHard from '@/components/bangla/BanglaMultiWordPuzzleGeneratorHard';
import BanglaMultiWordPuzzleGeneratorStone from '@/components/bangla/BanglaMultiWordPuzzleGeneratorStone';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

type PuzzleType =
  | 'single-word'
  | 'multi-word-easy'
  | 'multi-word-medium'
  | 'multi-word-hard'
  | 'multi-word-stone';

const PuzzlePage = () => {
  const [studentName, setStudentName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('single-word');
  const [words, setWords] = useState<string>('');

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handlePuzzleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPuzzleType(e.target.value as PuzzleType);
  };

  const handleWordsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setWords(e.target.value);
  };

  const renderPuzzleComponent = () => {
    return (
      <div>
        {/* Student Info Header - visible in both screen and print */}
        {(studentName || date) && (
          <div
            id="student-info-header"
            className="mb-4 text-center p-4 bg-white rounded-lg shadow-sm"
          >
            {studentName && (
              <p className="text-lg font-semibold mb-2">Name: {studentName}</p>
            )}
            {date && (
              <p className="text-lg font-semibold">
                Date: {new Date(date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        {(() => {
          switch (puzzleType) {
            case 'single-word':
              return (
                <CustomSingleWordPuzzle
                  words={words}
                  studentName={studentName}
                  date={date}
                  studentClass={studentClass}
                />
              );
            case 'multi-word-easy':
              return (
                <BanglaMultiWordPuzzleEasy
                  words={words}
                  studentName={studentName}
                  date={date}
                  studentClass={studentClass}
                />
              );
            case 'multi-word-medium':
              return (
                <BanglaMultiWordPuzzleGeneratorMedium
                  words={words}
                  studentName={studentName}
                  date={date}
                  studentClass={studentClass}
                />
              );
            case 'multi-word-hard':
              return (
                <BanglaMultiWordPuzzleGeneratorHard
                  words={words}
                  studentName={studentName}
                  date={date}
                  studentClass={studentClass}
                />
              );
            case 'multi-word-stone':
              return (
                <BanglaMultiWordPuzzleGeneratorStone
                  words={words}
                  studentName={studentName}
                  date={date}
                  studentClass={studentClass}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Puzzle Generator</CardTitle>
          <CardDescription>
            Create puzzles with student information and customize your puzzle
            type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Name Input */}
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              type="text"
              placeholder="Enter student name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Class Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="studentClass">Class</Label>
            <select
              id="studentClass"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Class</option>
              <option value="Nursery">Nursery</option>
              <option value="KG">KG</option>
              <option value="One">Class One</option>
              <option value="Two">Class Two</option>
              <option value="Three">Class Three</option>
              <option value="Four">Class Four</option>
              <option value="Five">Class Five</option>
            </select>
          </div>

          {/* Puzzle Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="puzzleType">Puzzle Type</Label>
            <select
              id="puzzleType"
              value={puzzleType}
              onChange={handlePuzzleTypeChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="single-word">Single Word Puzzle</option>
              <option value="multi-word-easy">Multi Word Puzzle Easy</option>
              <option value="multi-word-medium">
                Multi Word Puzzle Medium
              </option>
              <option value="multi-word-hard">Multi Word Puzzle Hard</option>
              <option value="multi-word-stone">Multi Word Puzzle Stone</option>
            </select>
          </div>

          {/* Words Input Field */}
          <div className="space-y-2">
            <Label htmlFor="words">Words</Label>
            <textarea
              id="words"
              placeholder={
                puzzleType === 'single-word'
                  ? 'Enter words, one per line (any number of words)'
                  : 'Enter words, one per line (up to 20 words)'
              }
              value={words}
              onChange={handleWordsChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              rows={5}
            />
            {puzzleType === 'single-word' && (
              <p className="text-sm text-gray-500">
                Words entered:{' '}
                {words.split('\n').filter((w) => w.trim()).length}
                {words.split('\n').filter((w) => w.trim()).length > 0 && (
                  <span className="ml-2">
                    (
                    {Math.ceil(
                      words.split('\n').filter((w) => w.trim()).length / 2
                    )}{' '}
                    page
                    {Math.ceil(
                      words.split('\n').filter((w) => w.trim()).length / 2
                    ) > 1
                      ? 's'
                      : ''}{' '}
                    puzzle +{' '}
                    {Math.ceil(
                      words.split('\n').filter((w) => w.trim()).length / 2
                    )}{' '}
                    page
                    {Math.ceil(
                      words.split('\n').filter((w) => w.trim()).length / 2
                    ) > 1
                      ? 's'
                      : ''}{' '}
                    answer)
                  </span>
                )}
              </p>
            )}
            {puzzleType !== 'single-word' && (
              <p className="text-sm text-gray-500">
                Words added: {words.split('\n').filter((w) => w.trim()).length}{' '}
                / 20
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Puzzle Component Area */}
      <div className="max-w-4xl mx-auto">{renderPuzzleComponent()}</div>
    </div>
  );
};

export default PuzzlePage;
