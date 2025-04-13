'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface MatchingImage {
  _id: string;
  question: string;
  answer: string; 
  image: string;
}

interface SelectedQuestionData {
  question: MatchingImage;
}

type SelectedQuestionMap = Record<string, SelectedQuestionData>;

const MatchingImage = () => {
  const [questions, setQuestions] = useState<MatchingImage[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api';
  
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestionMap>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${baseUrl}/matching-image?page=${currentPage}&limit=${limit}`);
        const data = await res.json();
        setQuestions(data.questions);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch matching questions:', error);
      }
    };
    fetchQuestions();
  }, [currentPage, baseUrl]);

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    const question = questions.find(q => q._id === questionId);
    if (question) {
      setSelectedQuestions({ [questionId]: { question: { ...question } } });
    }
  };

  const handleAnswerChange = (questionId: string, e: ChangeEvent<HTMLInputElement>) => {
    const newAnswer = e.target.value;
    if (selectedQuestionId === questionId) {
      setSelectedQuestions(prev => ({
        ...prev,
        [questionId]: {
          question: {
            ...prev[questionId].question,
            answer: newAnswer,
          },
        },
      }));
    }
  };

  const handlePrintSelected = () => {
    if (!selectedQuestionId) {
      alert('Please select a question for printing.');
      return;
    }
    const selectedData = selectedQuestions[selectedQuestionId];
    if (!selectedData) {
      alert('Selected question not found.');
      return;
    }
    const { question } = selectedData;
    const tailwindCdn = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css';
    const htmlContent = `
      <html>
        <head>
          <title>Print Matching Question</title>
          <link href="${tailwindCdn}" rel="stylesheet" />
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            .print-container { height: 297mm; width: 210mm; display: flex; flex-direction: column; page-break-inside: avoid; break-inside: avoid; }
            .title { padding: 10mm; text-align: center; font-size: 24px; font-weight: bold; }
            .image-container { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            .image-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="title">
              Find ${question.answer} matches
            </div>
            <div class="image-container">
              <img src="${question.image}" alt="Matching Question Image" />
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
      setTimeout(() => { printWindow.close(); }, 1000);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Matching Quiz</h1>
      {questions.length === 0 ? (
        <p>Loading matching questions...</p>
      ) : (
        <form className="space-y-6">
          {questions.map((q, index) => (
            <div key={q._id} className="p-4 border rounded flex items-center space-x-4">
              <div className="flex-shrink-0"><span className="font-bold">{index + 1}.</span></div>
              <div className="flex-shrink-0">
                <Image src={q.image} alt={`Matching ${index + 1}`} height={40} width={40} className="w-40 h-40 object-cover border" />
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <Input type="radio" name="selectedMatching" checked={selectedQuestionId === q._id} onChange={() => handleSelectQuestion(q._id)} className="mr-2" />
                  <span>Select for Print</span>
                </label>
                <div className="flex items-center space-x-1">
                  <Label htmlFor={`matching-answer-${q._id}`}>Matches:</Label>
                  <Input
                    id={`matching-answer-${q._id}`}
                    type="number"
                    value={selectedQuestionId === q._id ? selectedQuestions[q._id]?.question.answer || q.answer : q.answer}
                    disabled={selectedQuestionId !== q._id}
                    onChange={(e) => handleAnswerChange(q._id, e)}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          ))}
        </form>
      )}
      <div className="mt-6">
        <Button type="button" onClick={handlePrintSelected} className="bg-green-500 text-white px-4 py-2 rounded">Print Selected Matching</Button>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <Button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50">Previous</Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50">Next</Button>
      </div>
    </div>
  );
};

export default MatchingImage;
