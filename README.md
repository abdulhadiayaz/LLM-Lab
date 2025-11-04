# LLM Lab

A comprehensive platform for systematically testing and comparing Large Language Model (LLM) outputs through parameter experimentation and quality analysis.

## Overview

LLM Lab enables us to:

- Generate multiple LLM responses with different parameter combinations
- Analyze response quality using custom metrics
- Compare responses side-by-side to identify optimal parameter settings
- Export experiment data for further analysis

The application uses Google's Gemini API to generate responses and implements a metrics system to evaluate coherence, completeness, readability, structure, and relevance.

## Tech Stack

**Frontend:**

- Next.js 15 with TypeScript
- Tailwind CSS
- React Query for state management
- Recharts for data visualization

**Backend:**

- Express.js with TypeScript
- Prisma ORM with SQLite
- Google Generative AI SDK
- Express-Zod-API for type-safe endpoints

## Quick Start

### Prerequisites

- Node.js v18 or higher
- Gemini API key from Google AI Studio

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd LLM-Lab
   npm install
   ```

2. **Backend setup:**

   ```bash
   cd llm-lab-api
   cp .env.example .env.local  # Create .env.local if needed
   # Add GEMINI_API_KEY to .env.local
   npm run gen-client
   npx prisma migrate dev
   ```

3. **Frontend setup:**

   ```bash
   cd llm-lab-client
   # Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:80 (optional)
   ```

4. **Run development servers:**

   ```bash
   # From root directory
   npm run dev  # Starts backend on port 80

   # In another terminal
   cd llm-lab-client
   npm run dev  # Starts frontend on port 3000
   ```

Visit `http://localhost:3000` to use the application.

## Features

### Experiment Management

- Create experiments with custom prompts
- Configure parameter ranges (temperature, top-p, top-k, max tokens)
- Generate all parameter combinations automatically

### Quality Metrics

- **Coherence Score**: Logical flow and sentence connectivity
- **Completeness Score**: Relevance to prompt and keyword coverage
- **Readability Score**: Flesch Reading Ease analysis
- **Structure Score**: Formatting, paragraphs, lists, and organization
- **Length Score**: Appropriateness of response length
- **Overall Score**: Weighted combination of all metrics

### Analysis Tools

- Side-by-side response comparison
- Detailed metrics visualization
- Parameter vs. quality correlation
- Export to JSON or CSV formats

## Project Structure

```
LLM-Lab/
├── llm-lab-api/          # Backend API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Gemini API & metrics
│   │   └── utils/        # Utilities
│   └── prisma/           # Database schema
├── llm-lab-client/       # Frontend Next.js app
│   ├── pages/            # Next.js pages
│   └── lib/
│       ├── components/   # React components
│       └── api.ts        # API client
└── README.md
```

## License

ISC
