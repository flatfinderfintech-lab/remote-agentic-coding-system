# User Flows - Idea Bucket AI

This document describes the four core user flows implemented in the Idea Bucket AI application.

## Flow 1: Capturing a New Idea

**Goal**: Enable inventors to quickly record new inspirations or partial ideas.

### Steps

1. User clicks "+ Add Idea" button (navigation or dashboard)
2. User is directed to `/ideas/new`
3. User fills out the form:
   - **Description** (required): Text description of the idea
   - **Image URL** (optional): Link to image (e.g., napkin sketch photo)
4. User clicks "Save Idea"
5. Client component (`NewIdeaForm`) sends POST to `/api/ideas`
6. API route creates unprocessed idea in database
7. API route triggers async AI processing (non-blocking)
8. User is redirected to `/ideas` (ideas list page)
9. New idea appears in list with "Processing..." indicator
10. Within ~30 seconds, AI processing completes and card updates with title, summary, and tags

### Acceptance Criteria ✅

- [x] New Idea Card is created and visible immediately
- [x] Card displays user-provided text and optional image
- [x] AI generates title, summary, and tags within defined timeframe
- [x] Processing status is shown to user

### Technical Flow

```
User Input (NewIdeaForm)
    ↓
POST /api/ideas
    ↓
createIdeaCard() → SQLite
    ↓
processIdeaCard() → summarizeIdea() [AI] → Update SQLite
    ↓
User sees updated card on refresh
```

## Flow 2: Viewing and Browsing Idea Cards

**Goal**: Allow inventors to review their collected ideas and fragments.

### Steps

1. User navigates to "My Ideas" (`/ideas`)
2. Server component fetches all ideas from database
3. Ideas are displayed in grid layout, sorted by newest first
4. Each card shows:
   - AI-generated title
   - 1-2 sentence summary
   - Relevant tags
   - Creation date
   - Optional image
   - Processing status (if still processing)
5. User can scroll through all their ideas

### Acceptance Criteria ✅

- [x] All saved Idea Cards are displayed
- [x] Each card includes title, summary, tags, and creation date
- [x] Display is responsive and easy to browse
- [x] Empty state shown when no ideas exist

### Technical Flow

```
User visits /ideas
    ↓
IdeasPage (Server Component)
    ↓
getAllIdeaCards() → Query SQLite
    ↓
Render grid of IdeaCardComponent
```

## Flow 3: Reviewing and Managing Concept Clusters

**Goal**: Discover and manage AI-generated groupings of related ideas.

### Steps

1. User navigates to "Concept Clusters" (`/clusters`)
2. User clicks "🤖 Generate Clusters" button
3. Client component (`GenerateClustersButton`) sends POST to `/api/clusters/generate`
4. API route fetches all processed ideas
5. AI analyzes ideas and proposes clusters (`proposeConceptClusters()`)
6. Clusters are saved to database with status "pending"
7. User sees list of proposed clusters organized by status:
   - **Pending Review**: New clusters awaiting user decision
   - **Accepted**: Clusters user has approved
   - **Rejected**: Clusters user has declined
8. For each cluster, user can:
   - View suggested name and AI-written summary
   - Expand to see underlying Idea Cards
   - Click "Accept" to approve cluster
   - Click "Reject" to decline cluster
9. Status updates are immediate and reflected in UI

### Acceptance Criteria ✅

- [x] List of AI-generated Concept Clusters is displayed
- [x] Each cluster shows suggested name and concept summary
- [x] Users can view individual Idea Cards in each cluster
- [x] Users can accept or reject clusters
- [x] Status is reflected in UI

### Technical Flow

```
User clicks "Generate Clusters"
    ↓
POST /api/clusters/generate
    ↓
getAllIdeaCards() → Get processed ideas
    ↓
proposeConceptClusters() [AI] → Analyze and group
    ↓
Create ConceptCluster records → SQLite
    ↓
Page refreshes, clusters visible

---

User clicks "Accept"
    ↓
POST /api/clusters/update-status
    ↓
updateClusterStatus() → Update SQLite
    ↓
Page refreshes, cluster moves to "Accepted" section
```

## Flow 4: Generating a Spec Kit Draft from a Concept Cluster

**Goal**: Transform a promising Concept Cluster into a structured Spec Kit Draft.

### Steps

1. User identifies an accepted cluster in `/clusters`
2. User clicks "Generate Spec Kit Draft" button
3. Client component sends POST to `/api/clusters/generate-spec`
4. API route validates cluster is accepted
5. API route fetches cluster with all associated ideas
6. AI analyzes cluster and generates spec kit (`generateSpecKitDraft()`)
7. Spec Kit Draft is saved to database with:
   - **Problem**: Problem statement
   - **Target User**: User persona
   - **Solution**: Solution description
   - **Core Features**: Array of key features
   - **Differentiation**: Unique value proposition
   - **Source Idea IDs**: References to original ideas
8. User is shown the generated spec kit (currently in alert popup)
9. Spec kit is linked to cluster for future reference

### Acceptance Criteria ✅

- [x] "Generate Spec Kit Draft" succeeds for accepted clusters
- [x] Generated draft contains all required fields
- [x] Fields are populated with relevant information from ideas
- [x] User can view the generated draft
- [x] Draft is saved to database

### Technical Flow

```
User clicks "Generate Spec Kit Draft"
    ↓
POST /api/clusters/generate-spec
    ↓
getConceptCluster(clusterId) → Get cluster + ideas
    ↓
generateSpecKitDraft() [AI] → Analyze and synthesize
    ↓
Create SpecKitDraft record → SQLite
    ↓
Return JSON spec kit to user
```

### Spec Kit Structure

```json
{
  "id": "clx...",
  "clusterId": "cly...",
  "problem": "Users face challenges in...",
  "targetUser": "Inventors, innovators...",
  "solution": "Smart Water Bottle Cluster: A cluster of 3 related ideas...",
  "coreFeatures": [
    "Feature derived from idea 1",
    "Feature derived from idea 2",
    "Integration of complementary concepts",
    "User-friendly interface"
  ],
  "differentiation": "This solution uniquely combines insights from 3 related ideas...",
  "sourceIdeaIds": ["clz...", "cla...", "clb..."],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Cross-Cutting Concerns

### AI Processing

All flows that involve AI use the abstracted layer (`lib/aiIdeaBucket.ts`):

- **Flow 1**: `summarizeIdea()` - Title, summary, tags
- **Flow 3**: `proposeConceptClusters()` - Group related ideas
- **Flow 4**: `generateSpecKitDraft()` - Product specification

### Error Handling

All flows implement error handling:

- Client components show user-friendly error messages
- API routes return proper HTTP status codes
- Failed AI operations are logged but don't block user actions

### Loading States

All async operations show loading indicators:

- Forms disable submit buttons during submission
- Spinners shown for in-progress AI processing
- "Processing..." badges on idea cards

### Real-Time Updates

Pages refresh after mutations using Next.js `router.refresh()`:

- After creating new idea
- After generating clusters
- After accepting/rejecting cluster
- After generating spec kit

## Future Enhancements

### Flow 1 Enhancements
- Direct image upload (vs URL)
- Voice-to-text description
- Browser extension for quick capture

### Flow 2 Enhancements
- Search and filter ideas
- Sort by different criteria
- Edit existing ideas
- Delete ideas

### Flow 3 Enhancements
- Manual cluster creation
- Drag-and-drop ideas between clusters
- Merge/split clusters
- Cluster insights dashboard

### Flow 4 Enhancements
- Rich text spec kit editor
- Export to PDF, Markdown, Notion
- Share spec kits with collaborators
- Version history for spec kits
- Direct handoff to "Idea → Spec AI" app
