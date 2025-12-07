'use client';

import { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

export interface QuizQuestion {
  id: string | number;
  type: 'text' | 'checkbox' | 'radio';
  question: string;
  choices?: string[];
  correctIndex?: number;
  correctIndexes?: number[];
  correctText?: string;
}

export interface Answer {
  id: string | number;
  value: string | number | number[];
}

export interface GradingResult {
  score: number;
  total: number;
  results: Array<{
    id: string | number;
    correct: boolean;
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export default function Home() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string | number, string | number | number[]>>({});
  const [results, setResults] = useState<GradingResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/quiz`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid quiz data format');
      }
      
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string | number, value: string | number | number[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter((q) => !(q.id in answers));
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const answersArray: Answer[] = Object.entries(answers).map(([id, value]) => {
        // Object.entries always returns string keys, but question IDs may be numbers
        // Find the matching question to get the correct ID type
        const question = questions.find(q => String(q.id) === id);
        const questionId = question ? question.id : (isNaN(Number(id)) ? id : Number(id));
        return {
          id: questionId,
          value: value,
        };
      });

      const response = await fetch(`${API_BASE_URL}/api/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: answersArray }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to grade quiz: ${response.statusText}`);
      }

      const data: GradingResult = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResults(null);
    setError(null);
    fetchQuiz();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <ErrorMessage message={error} onRetry={fetchQuiz} />
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <Results
          results={results}
          questions={questions}
          answers={answers}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Quiz Application
          </h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <Quiz
            questions={questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

