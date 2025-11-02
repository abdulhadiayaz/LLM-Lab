# LLM LAB Server

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/llm_lab_db"
PORT=80
NODE_ENV=local
GEMINI_API_KEY="your-gemini-api-key-here"
```

3. Generate Prisma client:

```bash
npm run gen-client
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```
