import { Hono } from 'hono';
import { quizData } from './data/quizData';
import { gradeQuiz } from './utils/grader';

type Env = {
  // Add any environment variables here if needed
};

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', async (c, next) => {
  const allowedOrigins = [
    'https://quiz-app-byx6-bgs5200f6-rey-gabriel-l-literals-projects.vercel.app',
    'https://quiz-app-*.vercel.app', // Allow all Vercel preview deployments
    'http://localhost:3000', // Local development
  ];
  
  const origin = c.req.header('Origin') || '';
  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      // Simple wildcard matching for Vercel preview URLs
      return origin.includes('vercel.app');
    }
    return origin === allowed;
  });
  
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0];
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
  }
  
  await next();
  
  c.header('Access-Control-Allow-Origin', allowedOrigin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
});

// GET /api/quiz - Returns quiz questions
app.get('/api/quiz', (c) => {
  try {
    // Return 8-12 questions (we'll use all available questions)
    const questions = quizData.slice(0, 12);
    
    return c.json({
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return c.json(
      { error: 'Failed to fetch quiz data' },
      500
    );
  }
});

// POST /api/grade - Grades quiz answers
app.post('/api/grade', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request body
    if (!body || !Array.isArray(body.answers)) {
      return c.json(
        { error: 'Invalid payload. Expected { "answers": [...] }' },
        400
      );
    }

    const { answers } = body;
    
    // Validate each answer has required fields
    for (const answer of answers) {
      if (typeof answer.id === 'undefined' || typeof answer.value === 'undefined') {
        return c.json(
          { error: 'Each answer must have "id" and "value" fields' },
          400
        );
      }
    }

    const result = gradeQuiz(answers, quizData);
    
    return c.json(result);
  } catch (error) {
    console.error('Error grading quiz:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return c.json(
        { error: 'Invalid JSON payload' },
        400
      );
    }
    
    return c.json(
      { error: 'Failed to grade quiz' },
      500
    );
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;

