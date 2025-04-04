'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Question {
  _id: string;
  question: string;
  options: string[];
  answer: string;
}

interface PrintCustomization {
  heading: string;
  headingPosition: 'left' | 'right';
  cardBg: string;
  textBg: string;
  textColor: string;
  imageUrl: string;
}

const defaultCustomization: PrintCustomization = {
  heading: 'Science Time',
  headingPosition: 'left',
  cardBg: 'bg-blue-200',
  textBg: 'bg-white',
  textColor: 'text-black',
  imageUrl: '',
};

type SelectedQuestionMap = Record<
  string,
  {
    question: Question;
    customization: PrintCustomization;
  }
>;

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

const ScienceQuiz = () => {
  // Quiz data and pagination
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api';

  // Answer state for current page (per question id)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [pageSubmitted, setPageSubmitted] = useState<boolean>(false);
  const [pageScore, setPageScore] = useState<number>(0);

  // Global state to hold selected questions along with customization options
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestionMap>({});

  // Fetch questions for current page
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${baseUrl}/science?page=${currentPage}&limit=${limit}`);
        const data = await res.json();
        // Assuming response is { questions, total, page, limit }
        setQuestions(data.questions);
        setTotal(data.total);
        // Reset page-specific answer state (do not clear global selection)
        setUserAnswers({});
        setPageSubmitted(false);
        setPageScore(0);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      }
    };
    fetchQuestions();
  }, [currentPage, baseUrl]);


  const handleSubmitPage = () => {
    let score = 0;
    questions.forEach(q => {
      if (userAnswers[q._id] === q.answer) {
        score++;
      }
    });
    setPageScore(score);
    setPageSubmitted(true);
  };

  // Toggle selection for printing along with default customization
  const handleTogglePrint = (q: Question) => {
    setSelectedQuestions(prev => {
      const newSelection = { ...prev };
      if (newSelection[q._id]) {
        delete newSelection[q._id];
      } else {
        newSelection[q._id] = {
          question: q,
          customization: { ...defaultCustomization },
        };
      }
      return newSelection;
    });
  };

  // Update customization for a given question id
  const updateCustomization = (
    questionId: string,
    field: keyof PrintCustomization,
    value: string
  ) => {
    setSelectedQuestions(prev => {
      if (!prev[questionId]) return prev;
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          customization: {
            ...prev[questionId].customization,
            [field]: value,
          },
        },
      };
    });
  };

  // Handle image upload for customization (for a given question id)
  const handleCustomizationImageUpload = (
    questionId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateCustomization(questionId, 'imageUrl', url);
    }
  };

  const handlePrintSelected = () => {
    const selected = Object.values(selectedQuestions);
    if (selected.length === 0) {
      alert('No questions selected for printing.');
      return;
    }
  
    // Use a CDN link to Tailwind CSS.
    const tailwindCdn = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css';
    // Alternatively, if you're using Tailwind v3, you might use:
    // const tailwindCdn = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/3.2.4/tailwind.min.css';
  
    const htmlContent = `
      <html>
        <head>
          <title>Print Selected Questions</title>
          <link href="${tailwindCdn}" rel="stylesheet" />
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 0.5cm;
              }
              body * {
                visibility: hidden;
              }
              #printable-area,
              #printable-area * {
                visibility: visible;
              }
              #printable-area {
                position: absolute;
                inset: 0;
                width: 100vw;
                height: 100vh;
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
          </style>
        </head>
        <body>
          <div id="printable-area">
            ${selected
              .map(
                (sel, idx) => {
                  const { customization, question } = sel;
                  return `
                    <div class="card ${customization.cardBg} p-4 rounded-t-2xl rounded-b-[200px] rounded-l-md rounded-r-[150px] mb-4 shadow-2xl">
                      <div class="header flex justify-between items-center mb-2">
                        ${
                          customization.headingPosition === 'left' && customization.imageUrl
                            ? `<img src="${customization.imageUrl}" alt="Icon" width="32" height="32" class="mr-2" />`
                            : ''
                        }
                        <span class="font-bold">${customization.heading}</span>
                        <span class="font-bold">${idx + 1}</span>
                        ${
                          customization.headingPosition === 'right' && customization.imageUrl
                            ? `<img src="${customization.imageUrl}" alt="Icon" width="32" height="32" class="ml-2" />`
                            : ''
                        }
                      </div>
                      <div class="content ${customization.textBg} p-3 rounded" style="color: inherit;">
                        <p class="font-semibold">${question.question}</p>
                         <ol>
                          ${question.options
                            .map((opt, i) => `<li>${String.fromCharCode(97 + i)}) ${opt}</li>`)
                            .join('')}
                        </ol>
                      </div>
                    </div>
                  `;
                }
              )
              .join('')}
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
    <>
      {/* Global print styles fallback */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            inset: 0;
            width: 100vw;
            height: 100vh;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold mb-4">Science Quiz</h1>
        {questions.length === 0 ? (
          <p>Loading questions...</p>
        ) : (
          <form className="space-y-6">
            {questions.map((q, index) => (
              <div key={q._id} className="p-4 border rounded space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">
                    {index + 1}. {q.question}
                  </p>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!selectedQuestions[q._id]}
                      onChange={() => handleTogglePrint(q)}
                      className="mr-2"
                    />
                    Print
                  </label>
                </div>
                <div className="mt-2 space-y-2">
                {q.options.map((option, idx) => (
  <p key={idx} className="flex items-center">
    {`${String.fromCharCode(97 + idx)}) ${option}`}
  </p>
))}

                </div>
                {pageSubmitted && (
                  <p className="mt-2">
                    {userAnswers[q._id] === q.answer ? (
                      <span className="text-green-600">Correct</span>
                    ) : (
                      <span className="text-red-600">
                        Incorrect. Correct answer: {q.answer}
                      </span>
                    )}
                  </p>
                )}
                {/* Render customization panel if question is selected for print */}
                {selectedQuestions[q._id] && (
                  <div className="p-4 border mt-2 rounded space-y-3">
                    <h2 className="font-bold">Customize Print Card</h2>
                    <div>
                      <Label>Heading</Label>
                      <Input
                        type="text"
                        value={selectedQuestions[q._id].customization.heading}
                        onChange={(e) =>
                          updateCustomization(q._id, 'heading', e.target.value)
                        }
                        placeholder="Enter heading text"
                      />
                    </div>
                    <div>
                      <Label>Heading Position</Label>
                      <Select
                        value={selectedQuestions[q._id].customization.headingPosition}
                        onValueChange={(val: 'left' | 'right') =>
                          updateCustomization(q._id, 'headingPosition', val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {imagePositionOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Card Background Color</Label>
                      <Select
                        value={selectedQuestions[q._id].customization.cardBg}
                        onValueChange={(val) => updateCustomization(q._id, 'cardBg', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select background" />
                        </SelectTrigger>
                        <SelectContent>
                          {bgColorOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Text Background Color</Label>
                      <Select
                        value={selectedQuestions[q._id].customization.textBg}
                        onValueChange={(val) => updateCustomization(q._id, 'textBg', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select text background" />
                        </SelectTrigger>
                        <SelectContent>
                          {textBgColorOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Text Color</Label>
                      <Select
                        value={selectedQuestions[q._id].customization.textColor}
                        onValueChange={(val) => updateCustomization(q._id, 'textColor', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select text color" />
                        </SelectTrigger>
                        <SelectContent>
                          {textColorOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Upload Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCustomizationImageUpload(q._id, e)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
        
          </form>
        )}
        {/* Print Selected Questions Button */}
        <div className="mt-6">
          <Button
            type="button"
            onClick={handlePrintSelected}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Print Selected Questions
          </Button>
        </div>
        {/* Pagination Controls */}
        <div className="mt-6 flex justify-between items-center">
          <Button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
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
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default ScienceQuiz;
