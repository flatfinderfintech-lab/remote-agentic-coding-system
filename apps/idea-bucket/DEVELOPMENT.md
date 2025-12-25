# Development Guide - Idea Bucket AI

## Architecture Overview

This Next.js application follows a clean separation of concerns:

### Server Components vs Client Components

- **Server Components** (default in App Router):
  - All page components (`app/*/page.tsx`)
  - Directly access database via `lib/db.ts`
  - No interactivity, no useState/useEffect
  - Better performance, smaller bundle

- **Client Components** (`'use client'` directive):
  - Forms and interactive UI (`components/*.tsx`)
  - Event handlers, state management
  - Cannot directly access database
  - Communicate via API routes

### Data Flow

```
User Action (Client Component)
    ↓
API Route (/app/api/*/route.ts)
    ↓
Database Operation (lib/db.ts)
    ↓
AI Processing (lib/aiIdeaBucket.ts)
    ↓
Prisma Client (lib/prisma.ts)
    ↓
SQLite Database (prisma/dev.db)
```

## Key Design Decisions

### 1. AI Abstraction Layer

All AI operations are centralized in `lib/aiIdeaBucket.ts`:

- **Purpose**: Easy swapping of AI providers
- **Current**: Mock implementations with `simulateAIDelay()`
- **Production**: Replace with OpenAI, Anthropic, or custom models
- **Interface**: TypeScript types ensure consistent contract

### 2. Async AI Processing

Ideas are processed asynchronously:

```typescript
// In API route
const idea = await createIdeaCard(description, imageUrl);

// Fire and forget - don't block the response
processIdeaCard(idea.id).catch(err => console.error(err));

return NextResponse.json({ idea });
```

**Why?**
- Faster response to user
- AI processing can take 5-30 seconds
- User sees "Processing..." indicator in UI

### 3. JSON Storage for Arrays

Tags, core features, and source IDs stored as JSON strings:

```typescript
// Store
tags: JSON.stringify(['innovation', 'hardware', 'iot'])

// Retrieve
const tags = idea.tags ? JSON.parse(idea.tags) : [];
```

**Why?**
- SQLite doesn't have native array type
- Easy migration to PostgreSQL (supports JSONB)
- Simple to query and update

### 4. Prisma Singleton Pattern

Prevents multiple Prisma instances in development (Next.js hot reload):

```typescript
// lib/prisma.ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma;
```

## Database Operations

### Creating an Idea

```typescript
// 1. Create unprocessed idea
const idea = await createIdeaCard(description, imageUrl);

// 2. Process with AI (async)
const processedIdea = await processIdeaCard(idea.id);
```

### Generating Clusters

```typescript
// 1. Fetch all processed ideas
const ideas = await getAllIdeaCards();

// 2. Call AI to propose clusters
const proposals = await proposeConceptClusters(ideas);

// 3. Create cluster records and link ideas
for (const proposal of proposals) {
  await prisma.conceptCluster.create({
    data: {
      name: proposal.name,
      summary: proposal.summary,
      ideas: {
        connect: proposal.ideaIds.map(id => ({ id }))
      }
    }
  });
}
```

### Generating Spec Kits

```typescript
// 1. Get cluster with ideas
const cluster = await getConceptCluster(clusterId);

// 2. Call AI to generate spec
const specKit = await generateSpecKitDraft(
  cluster.name,
  cluster.summary,
  cluster.ideas
);

// 3. Save to database
await prisma.specKitDraft.create({
  data: {
    clusterId,
    problem: specKit.problem,
    // ... other fields
  }
});
```

## Component Patterns

### Server Component (Data Fetching)

```typescript
// app/ideas/page.tsx
export default async function IdeasPage() {
  // Direct database access
  const ideas = await getAllIdeaCards();

  return (
    <div>
      {ideas.map(idea => (
        <IdeaCardComponent key={idea.id} idea={idea} />
      ))}
    </div>
  );
}
```

### Client Component (Interactivity)

```typescript
// components/NewIdeaForm.tsx
'use client';

export default function NewIdeaForm() {
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Call API route, not database directly
    const response = await fetch('/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });

    // Refresh server component data
    router.refresh();
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Testing Strategy

### Unit Tests

Test pure functions and AI logic:

```typescript
// lib/aiIdeaBucket.test.ts
describe('summarizeIdea', () => {
  it('generates title from description', async () => {
    const result = await summarizeIdea('A smart water bottle');
    expect(result.title).toBeTruthy();
    expect(result.tags.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test database operations:

```typescript
// lib/db.test.ts
describe('createIdeaCard', () => {
  it('creates idea and processes with AI', async () => {
    const idea = await createIdeaCard('Test idea');
    expect(idea.processed).toBe(false);

    const processed = await processIdeaCard(idea.id);
    expect(processed.processed).toBe(true);
    expect(processed.title).toBeTruthy();
  });
});
```

### E2E Tests

Use Playwright or Cypress to test user flows:

```typescript
test('user can create and view idea', async ({ page }) => {
  await page.goto('/ideas/new');
  await page.fill('#description', 'My invention idea');
  await page.click('button[type="submit"]');

  await page.waitForURL('/ideas');
  await expect(page.locator('text=My invention idea')).toBeVisible();
});
```

## Performance Considerations

### Database Queries

- Use Prisma's `include` for eager loading:
  ```typescript
  const clusters = await prisma.conceptCluster.findMany({
    include: { ideas: true },  // Avoid N+1 queries
  });
  ```

- Add indexes to frequently queried fields (already in schema)

### AI Processing

- Current: Sequential processing
- Future: Batch processing with queue (Bull, BullMQ)
- Consider rate limiting for AI API calls

### Bundle Size

- Client components are bundled separately
- Keep heavy dependencies in server components only
- Use dynamic imports for large client components:
  ```typescript
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <Spinner />,
  });
  ```

## Error Handling

### API Routes

Always return proper status codes:

```typescript
try {
  const result = await someOperation();
  return NextResponse.json({ result }, { status: 200 });
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  );
}
```

### Client Components

Show user-friendly error messages:

```typescript
const [error, setError] = useState('');

try {
  await fetch('/api/ideas', { method: 'POST', ... });
} catch (err) {
  setError('Failed to save idea. Please try again.');
}

return (
  {error && (
    <div className="bg-red-50 border border-red-200 rounded p-4">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )}
);
```

## Troubleshooting

### Prisma Issues

**Cannot find Prisma Client:**
```bash
npx prisma generate
```

**Database out of sync:**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

**Type errors from Prisma:**
```bash
npx prisma generate
npm run type-check
```

### Next.js Issues

**Hot reload not working:**
- Restart dev server
- Clear `.next` folder: `rm -rf .next && npm run dev`

**Server/Client component mismatch:**
- Ensure `'use client'` directive at top of client components
- Don't import client components in server components (use composition)

### TypeScript Issues

**Missing types:**
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

**Check types without running app:**
```bash
npx tsc --noEmit
```

## Code Style

Follow Next.js and React best practices:

- Use TypeScript for all files
- Prefer server components over client components
- Use async/await over promises
- Extract reusable logic to `lib/` folder
- Keep components small and focused
- Use Tailwind utility classes over custom CSS
- Document complex functions with JSDoc comments

## Git Workflow

1. Work on feature branch: `git checkout -b feature/new-feature`
2. Commit often with clear messages
3. Push to remote: `git push -u origin feature/new-feature`
4. Create pull request for review
5. Merge to main after approval

## Deployment Checklist

- [ ] All tests pass
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] AI API keys configured
- [ ] Error monitoring set up (Sentry, LogRocket)
- [ ] Analytics configured (if needed)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
