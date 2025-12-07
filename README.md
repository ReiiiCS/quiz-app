# Quiz Application

A full-stack quiz application demonstrating end-to-end functionality using **Hono** (backend) and **Next.js + TailwindCSS** (frontend). The application supports multiple question types (text, radio, checkbox) with comprehensive validation and error handling.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account (for backend deployment)
- Vercel account (for frontend deployment, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

#### Backend (Hono)

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:8787` (default Wrangler port).

#### Frontend (Next.js)

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`.

**Important**: Make sure to set the `NEXT_PUBLIC_API_URL` environment variable in the frontend to point to your backend URL. For local development, create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### Build

#### Backend

```bash
cd backend
npm run typecheck  # Type checking
npm run deploy     # Deploy to Cloudflare Workers
```

#### Frontend

```bash
cd frontend
npm run build      # Production build
npm start          # Run production server
```

## 📁 Architecture

### Backend (Hono on Cloudflare Workers)

- **Runtime**: Edge (Cloudflare Workers)
- **Framework**: Hono v4
- **Language**: TypeScript
- **Deployment**: Cloudflare Workers

**Key Features**:
- Edge runtime for low latency
- CORS enabled for cross-origin requests
- Comprehensive request validation
- Graceful error handling

**API Endpoints**:
- `GET /api/quiz` - Returns 8-12 quiz questions
- `POST /api/grade` - Accepts answers and returns grading results
- `GET /health` - Health check endpoint

### Frontend (Next.js)

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Deployment**: Vercel

**Key Features**:
- App Router for modern React patterns
- Client-side state management
- Loading and error states
- Responsive design with TailwindCSS

**Components**:
- `Quiz` - Main quiz container
- `QuestionCard` - Individual question display
- `Results` - Results display with detailed feedback
- `LoadingSpinner` - Loading state indicator
- `ErrorMessage` - Error state display

## 🔍 Validation Approach

### Backend Validation

1. **Request Body Validation**:
   - Validates that `answers` is an array
   - Ensures each answer has `id` and `value` fields
   - Returns 400 status for invalid payloads

2. **Response Validation**:
   - Validates quiz data structure before returning
   - Ensures questions have required fields based on type

3. **Grading Logic**:
   - Validates question existence before grading
   - Handles different question types appropriately:
     - **Text**: Case-insensitive comparison with trimmed whitespace
     - **Radio**: Exact index match
     - **Checkbox**: Array comparison (order-independent)

### Frontend Validation

1. **Data Fetching**:
   - Validates response structure
   - Handles network errors gracefully
   - Displays user-friendly error messages

2. **Form Validation**:
   - Ensures all questions are answered before submission
   - Provides clear feedback for missing answers

## 📚 Libraries Used and Rationale

### Backend

- **Hono** (`^4.0.0`): Fast, lightweight web framework optimized for edge runtimes. Perfect for Cloudflare Workers with excellent TypeScript support.
- **@cloudflare/workers-types**: TypeScript definitions for Cloudflare Workers runtime.
- **wrangler**: Official CLI tool for Cloudflare Workers development and deployment.

### Frontend

- **Next.js** (`14.1.0`): React framework with App Router for modern development patterns, built-in optimizations, and excellent developer experience.
- **TailwindCSS** (`^3.3.0`): Utility-first CSS framework for rapid UI development with consistent design system.
- **TypeScript**: Type safety and improved developer experience across the entire stack.

## ⚖️ Trade-offs and Shortcuts

### Trade-offs

1. **No Database**: Using mock data stored in memory. This simplifies deployment but limits scalability and persistence.

2. **Client-side State**: All quiz state is managed client-side. For production, consider server-side state management for better scalability.

3. **CORS Configuration**: Currently allows all origins (`*`). In production, restrict to specific domains.

4. **Error Handling**: Basic error handling implemented. Production apps should include logging, monitoring, and more detailed error tracking.

5. **No Authentication**: Quiz is publicly accessible. Add authentication if you need user-specific features.

### Shortcuts

1. **Mock Data**: Questions are hardcoded in `backend/src/data/quizData.ts`. In production, use a database.

2. **Simple Grading**: Text answers use simple case-insensitive comparison. Could be enhanced with fuzzy matching or partial credit.

3. **No Persistence**: Quiz results are not saved. Add database storage for analytics and user history.

4. **Single Environment**: No separate staging/production configurations. Use environment variables for different API endpoints.

## 🚢 Deployment

For detailed step-by-step deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Summary

**Backend (Cloudflare Workers)**:
```bash
cd backend
npx wrangler login
npm run deploy
```

**Frontend (Vercel)**:
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-worker.workers.dev`
4. Deploy

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://quiz-api.your-subdomain.workers.dev`

## 🧪 Testing

### Manual Testing

1. **Backend**:
   ```bash
   cd backend
   npm run dev
   # Test endpoints with curl or Postman
   curl http://localhost:8787/api/quiz
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   # Open http://localhost:3000 in browser
   ```

### Type Checking

```bash
# Backend
cd backend
npm run typecheck

# Frontend
cd frontend
npm run build  # Includes type checking
```

## 📝 Project Structure

```
quiz/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── quizData.ts      # Mock quiz questions
│   │   ├── utils/
│   │   │   └── grader.ts        # Grading logic
│   │   └── index.ts             # Hono app and routes
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml            # Cloudflare Workers config
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Quiz.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── Results.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx             # Main page
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── vercel.json              # Vercel deployment config
│
└── README.md
```

## 🎯 Features

- ✅ Multiple question types (text, radio, checkbox)
- ✅ Real-time answer validation
- ✅ Comprehensive error handling
- ✅ Loading states
- ✅ Beautiful, responsive UI with TailwindCSS
- ✅ Detailed results with correct/incorrect feedback
- ✅ CORS support for cross-origin requests
- ✅ Type-safe with TypeScript
- ✅ Edge-optimized backend

## 🔮 Future Enhancements

- [ ] Add unit tests for grading logic
- [ ] Implement deterministic question shuffling
- [ ] Add timer functionality
- [ ] Persist results to database
- [ ] Add user authentication
- [ ] Implement question categories
- [ ] Add progress tracking
- [ ] Support for images in questions



