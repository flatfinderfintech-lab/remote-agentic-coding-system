# Idea Bucket AI

AI-powered idea bucket for inventors - part of the Prototype Cafe platform.

## Overview

Idea Bucket AI helps inventors capture fragmented inspirations and partial ideas, then uses AI to automatically match related fragments and synthesize them into complete, viable concepts.

### Core Features

1. **Idea Capture** - Quickly add ideas with text descriptions and optional images
2. **AI Processing** - Automatic generation of titles, summaries, and tags
3. **Concept Clustering** - Background matching engine groups related ideas
4. **Spec Kit Generation** - Transform accepted clusters into structured specification drafts

## Technology Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite (easily swappable to Supabase)
- **AI Integration**: Abstracted in `lib/aiIdeaBucket.ts` (currently mocked, ready for real LLM integration)

## Project Structure

```
apps/idea-bucket/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── ideas/             # Idea management pages
│   ├── clusters/          # Cluster review pages
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Dashboard homepage
├── components/            # Reusable React components
├── lib/                   # Core business logic
│   ├── aiIdeaBucket.ts   # AI abstraction layer (MOCK)
│   ├── db.ts             # Database operations
│   └── prisma.ts         # Prisma client singleton
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Database schema
└── package.json          # Dependencies and scripts
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/idea-bucket
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` if needed. Default configuration uses SQLite:

```env
DATABASE_URL="file:./prisma/dev.db"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
# npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Capturing Ideas

1. Click "+ Add Idea" in the navigation
2. Enter a description of your invention idea
3. Optionally add an image URL (e.g., photo of napkin sketch)
4. Click "Save Idea"
5. AI will automatically process the idea in the background

### Viewing Ideas

- Navigate to "My Ideas" to see all captured ideas
- Each card shows the AI-generated title, summary, and tags
- Cards with a spinner are still being processed

### Generating Concept Clusters

1. Navigate to "Concept Clusters"
2. Click "🤖 Generate Clusters"
3. AI will group related ideas into concept clusters
4. Review proposed clusters and accept or reject them

### Creating Spec Kit Drafts

1. Find an accepted concept cluster
2. Click "Generate Spec Kit Draft"
3. AI generates a structured specification including:
   - Problem statement
   - Target user
   - Solution description
   - Core features
   - Differentiation
   - Source idea IDs

## AI Integration

The AI layer is currently **mocked** for development. All AI functions are in `lib/aiIdeaBucket.ts`.

### Integrating Real AI

To integrate with a real LLM provider (OpenAI, Anthropic Claude, etc.):

1. Add API credentials to `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   # or
   ANTHROPIC_API_KEY="sk-ant-..."
   ```

2. Update `lib/aiIdeaBucket.ts`:
   - Replace mock implementations in `summarizeIdea()`
   - Replace mock implementations in `proposeConceptClusters()`
   - Replace mock implementations in `generateSpecKitDraft()`

3. Example integration with OpenAI:
   ```typescript
   import OpenAI from 'openai';

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });

   export async function summarizeIdea(description: string, imageUrl?: string): Promise<IdeaSummary> {
     const response = await openai.chat.completions.create({
       model: 'gpt-4',
       messages: [
         {
           role: 'system',
           content: 'You are an AI assistant helping inventors organize their ideas. Generate a title, summary, and tags for the given idea.'
         },
         {
           role: 'user',
           content: description
         }
       ],
     });

     // Parse response and return IdeaSummary
   }
   ```

## Database Schema

### IdeaCard
- User-provided description and optional image
- AI-generated title, summary, and tags
- Processing status flag

### ConceptCluster
- AI-generated name and summary
- Status: pending, accepted, or rejected
- Many-to-many relationship with IdeaCards

### SpecKitDraft
- One-to-one relationship with ConceptCluster
- Structured JSON fields for product specification

## API Routes

- `POST /api/ideas` - Create new idea card
- `POST /api/clusters/generate` - Generate concept clusters
- `POST /api/clusters/update-status` - Accept/reject cluster
- `POST /api/clusters/generate-spec` - Generate spec kit draft

## Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables (DATABASE_URL, AI API keys)
4. Deploy

### Database for Production

For production, consider migrating from SQLite to PostgreSQL or Supabase:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env` with production database URL
3. Run migrations: `npx prisma migrate deploy`

## Integration with Prototype Cafe

This app is designed to be part of a larger Turborepo monorepo:

```
prototype-cafe/
├── apps/
│   ├── idea-bucket/        # This app
│   ├── idea-to-spec-ai/    # Next integration point
│   └── ...
├── packages/
│   └── ...
└── turbo.json
```

Spec Kit Drafts generated here will be handed off to "Idea → Spec AI" for further development.

## Future Enhancements

- [ ] Real-time AI processing with WebSockets
- [ ] Image upload to cloud storage (S3, Cloudinary)
- [ ] Advanced clustering algorithms (embeddings, semantic search)
- [ ] Collaboration features (share clusters, comment on ideas)
- [ ] Export spec kits to PDF or notion
- [ ] Integration with Prototype Cafe platform auth

## License

MIT

## Support

For issues or questions, contact the Prototype Cafe team or open an issue in the repository.
