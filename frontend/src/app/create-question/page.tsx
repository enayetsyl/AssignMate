'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const CreateQuestion = () => {
  // Form state
  const [questionType, setQuestionType] = useState('riddle');
  const [questionText, setQuestionText] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState('');

  // File states for image uploads
  const [flagImage, setFlagImage] = useState<File | null>(null);
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a FormData instance for file uploads
    const formData = new FormData();
    formData.append('type', questionType);
    formData.append('question', questionText);
    formData.append('answer', answer);

    // Append options for questions with choices
    if (questionType === 'riddle' || questionType === 'goodHabit' || questionType === 'science') {
      const opts = options.split(',').map((opt) => opt.trim());
      // Send options as a JSON string; your backend should parse it
      formData.append('options', JSON.stringify(opts));
    }

    // Append file uploads for flagIdentify
    if (questionType === 'flagIdentify' && flagImage) {
      formData.append('image', flagImage);
    }

    // Append file uploads for imageDifference
    if (questionType === 'imageDifference') {
      if (imageFile1) formData.append('image1', imageFile1);
      if (imageFile2) formData.append('image2', imageFile2);
      // Optionally, ensure the answer is sent as a number (if required by your backend)
      formData.set('answer', answer);
    }

    try {
      const res = await fetch(`${baseUrl}/questions`, {
        method: 'POST',
        // When sending FormData, let the browser set the Content-Type header
        body: formData,
      });
      if (res.ok) {
        alert('Question created successfully!');
        // Reset the form fields
        setQuestionText('');
        setAnswer('');
        setOptions('');
        setFlagImage(null);
        setImageFile1(null);
        setImageFile2(null);
      } else {
        alert('Error creating question');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating question');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a Question</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        {/* Question Type */}
        <div>
          <Label htmlFor="questionType">Question Type</Label>
          <select
            id="questionType"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="mt-3 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="riddle">Riddle</option>
            <option value="flagIdentify">Flag Identify</option>
            <option value="goodHabit">Good Habit</option>
            <option value="science">Science</option>
            <option value="imageDifference">Image Difference</option>
          </select>
        </div>

        {/* Question Text */}
        <div>
          <Label htmlFor="questionText">Question</Label>
          <Input
            id="questionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question"
            className='mt-3'
          />
        </div>

        {/* Options for riddle, goodHabit, and science */}
        {(questionType === 'riddle' ||
          questionType === 'goodHabit' ||
          questionType === 'science') && (
          <div>
            <Label htmlFor="options">Options (comma separated)</Label>
            <Input
              id="options"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="Option1, Option2, Option3, Option4"
              className='mt-3'
            />
          </div>
        )}

        {/* File Upload for flagIdentify */}
        {questionType === 'flagIdentify' && (
          <div>
            <Label htmlFor="flagImage">Upload Image</Label>
            <Input
              id="flagImage"
              type="file"
              className='mt-3'
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFlagImage(e.target.files[0]);
                }
              }}
            />
          </div>
        )}

        {/* File Uploads for imageDifference */}
        {questionType === 'imageDifference' && (
          <>
            <div>
              <Label htmlFor="image1">Upload Image 1</Label>
              <Input
                id="image1"
                type="file"
                accept="image/*"
                 className='mt-3'
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile1(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="image2">Upload Image 2</Label>
              <Input
                id="image2"
                type="file"
                accept="image/*"
                 className='mt-3'
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile2(e.target.files[0]);
                  }
                }}
              />
            </div>
          </>
        )}

        {/* Answer Field */}
        <div>
          <Label htmlFor="answer">Answer</Label>
          <Input
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
             className='mt-3'
            placeholder="Enter answer"
          />
        </div>

        {/* Submit Button */}
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default CreateQuestion;

