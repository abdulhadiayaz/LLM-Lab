# LLM LAB Server

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env.local`:

```env
DATABASE_URL="file:./data/database.db"
PORT=80
NODE_ENV=local
GEMINI_API_KEY="your-gemini-api-key-here"
```

3. Create the data directory (if it doesn't exist):

```bash
mkdir -p data
```

4. Generate Prisma client and run migrations:

```bash
npm run gen-client
npx prisma migrate dev --name init
```

The SQLite database will be created at `./data/database.db` on your server.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```
