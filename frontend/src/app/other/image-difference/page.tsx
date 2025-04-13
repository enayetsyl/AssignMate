'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface ImageDifferenceQuestion {
  _id: string;
  question: string;
  answer: string; // expected to be a number (as string) indicating the number of differences
  image: string;
}

interface SelectedQuestionData {
  question: ImageDifferenceQuestion;
}

type SelectedQuestionMap = Record<string, SelectedQuestionData>;

const ImageDifferenceQuiz = () => {
  // Quiz data and pagination
  const [questions, setQuestions] = useState<ImageDifferenceQuestion[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api';

  // For image difference, allow only a single selection.
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestionMap>({});

  // Fetch image difference questions for the current page
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${baseUrl}/image-differences?page=${currentPage}&limit=${limit}`);
        const data = await res.json();
        // Assuming the response returns an object with { questions, total, ... }
        setQuestions(data.questions);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch image differences:', error);
      }
    };
    fetchQuestions();
  }, [currentPage, baseUrl]);

  // When a user selects a question for print, update both selectedQuestionId and mapping.
  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    const question = questions.find((q) => q._id === questionId);
    if (question) {
      setSelectedQuestions({ [questionId]: { question: { ...question } } });
    }
  };

  // Handler to print the selected image in a custom print view.
  const handlePrintSelected = () => {
    if (!selectedQuestionId) {
      alert('Please select an image for printing.');
      return;
    }
    const selectedData = selectedQuestions[selectedQuestionId];
    if (!selectedData) {
      alert('Selected question not found.');
      return;
    }
    const { question } = selectedData;
    // Build print view HTML.
    // We set fixed dimensions in mm for A4 landscape (297mm x 210mm) and ensure that content does not overflow.
    const tailwindCdn = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css';
    const htmlContent = `
      <html>
        <head>
          <title>Print Image Difference</title>
          <link href="${tailwindCdn}" rel="stylesheet" />
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            /* Fixed dimensions for A4 landscape (297mm x 210mm) */
            .print-container {
              width: 297mm;
              height: 210mm;
              display: flex;
              flex-direction: column;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .title {
              padding: 10mm;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
            }
            .image-container {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .image-container img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="title">
              Find ${question.answer} differences between two images
            </div>
            <div class="image-container">
              <img src="${question.image}" alt="Image Difference" />
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Image Difference Quiz</h1>
      {questions.length === 0 ? (
        <p>Loading image differences...</p>
      ) : (
        <form className="space-y-6">
          {questions.map((q, index) => (
            <div key={q._id} className="p-4 border rounded flex items-center space-x-4">
              <div className="">
                <span className="font-bold">{index + 1}.</span>
              </div>
              <div className="">
                <Image
                  src={q.image}
                  alt={`Image Difference ${index + 1}`}
                  height={40}
                  width={40}
                  className="w-40 h-40 object-cover border"
                />
              </div>
              <div className="flex items-center justify-between gap-5">
                <label className="flex items-center justify-between gap-2">
                  <Input
                    type="radio"
                    name="selectedImage"
                    checked={selectedQuestionId === q._id}
                    onChange={() => handleSelectQuestion(q._id)}
                    className="mr-2"
                  />
                  <span>Select for Print</span>
                </label>
                <div className="flex items-center ml-20">
                  <Label htmlFor={`answer-${q._id}`}>Differences:</Label>
                  <span
                    id={`answer-${q._id}`}
                    className="w-20"
                  >{
                    selectedQuestionId === q._id
                      ? selectedQuestions[q._id]?.question.answer || q.answer
                      : q.answer
                  }</span>
                </div>
              </div>
            </div>
          ))}
        </form>
      )}
      <div className="mt-6">
        <Button
          type="button"
          onClick={handlePrintSelected}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Print Selected Image
        </Button>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <Button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ImageDifferenceQuiz;
