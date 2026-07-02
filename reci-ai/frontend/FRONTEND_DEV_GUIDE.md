# RECI Frontend Development Guide

## Overview

RECI (Redrob Explainable Candidate Intelligence) is a professional recruitment platform that transforms AI engine outputs into an intuitive recruiter experience with explainable candidate ranking.

## Project Structure

```
src/
├── pages/                          # Page-level components
│   ├── Home/                      # Landing page and session management
│   ├── Upload/                    # Job and candidate file uploads
│   ├── JobReview/                 # AI job understanding review
│   ├── Processing/                # Real-time ranking pipeline progress
│   ├── Workspace/                 # Main recruiter dashboard
│   ├── CandidateDetail/           # Detailed candidate profile
│   ├── Compare/                   # Side-by-side candidate comparison
│   └── Insights/                  # Analytics and export
├── components/
│   ├── layout/                    # Layout wrapper (Header, Navbar, Sidebar, Footer)
│   ├── common/                    # Reusable UI primitives
│   │   ├── Button
│   │   ├── Card
│   │   ├── Badge
│   │   ├── Modal
│   │   ├── Toast
│   │   ├── Spinner
│   │   ├── SkeletonLoader
│   │   ├── ProgressBar
│   │   └── EmptyState
│   ├── cards/                     # Complex card components
│   │   ├── CandidateCard          # Candidate list item
│   │   └── SessionCard            # Session list item
│   ├── panels/                    # Specialized panels
│   │   ├── ScorePanel             # FitScore, ScoreBreakdown, SkillChip
│   │   └── EvidencePanel          # Evidence, Timeline, ProcessingProgress
│   └── forms/                     # Form components (for future use)
├── hooks/
│   └── api/                       # React Query hooks for API
│       ├── sessions.ts            # Session management
│       ├── jobs.ts                # Job upload & review
│       ├── candidates.ts          # Candidate queries & ranking
│       └── insights.ts            # Analytics & export
├── types/
│   └── index.ts                   # TypeScript interfaces & types
├── utils/
│   └── formatters.ts              # Formatting & utility functions
├── api/                           # API client (axios setup)
├── assets/                        # Static assets
├── App.tsx                        # Main app router
└── main.tsx                       # React entry point
```

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7
- **State Management**: React Query (TanStack Query v5)
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000` (configurable via `.env`)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL in .env if backend is on different port
```

### Development

```bash
# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Key Features Implemented

### 1. Home Page (`/`)
- Landing page with application branding
- Quick stats (active sessions, system health)
- Create new hiring session
- Recent sessions list with quick actions

### 2. Upload Page (`/upload/:sessionId`)
- Drag-and-drop file upload support
- Job description upload (DOCX, JSON, PDF)
- Candidate dataset upload (CSV, JSON, XLSX)
- Upload progress indicators
- Error handling and validation

### 3. Job Review Page (`/job-review/:sessionId`)
- Display AI-understood job information
- Editable job details (optional recruiter customization)
- Required and preferred skills display
- Key information summary
- Confirm or edit before processing

### 4. Processing Page (`/processing/:sessionId`)
- Real-time processing pipeline visualization
- Step-by-step progress tracking
- Estimated time remaining
- Success/error handling

### 5. Workspace/Dashboard (`/workspace/:sessionId`)
- Ranked candidate list (sortable, searchable)
- Candidate cards with quick stats
- Multi-select for comparison
- Advanced filtering options
- Responsive grid layout

### 6. Candidate Detail (`/candidate/:sessionId/:candidateId`)
- Detailed candidate profile
- Fit score breakdown with expandable sections
- Experience and education timeline
- Skills with evidence and verification
- Behavior summary
- Career trajectory analysis
- Tab-based navigation (Overview, Experience, Skills, Evidence)

### 7. Compare Candidates (`/compare/:sessionId/:candidateId1/:candidateId2`)
- Side-by-side comparison view
- Key metric differences highlighting
- Winner indicator for each metric
- Experience, skills, and education comparison
- Responsive layout

### 8. Insights & Analytics (`/insights/:sessionId`)
- Key recruiting metrics (candidate count, avg fit, processing time)
- Score distribution charts
- Experience level breakdown
- Top skills analysis
- Trust score distribution
- Behavior traits visualization
- Multiple export formats (JSON, CSV, PDF)

## Component Usage Examples

### Basic Components

```tsx
import { Button, Card, Badge, Spinner, EmptyState } from '@/components/common';

// Button
<Button onClick={handleClick} loading={isLoading}>Click me</Button>
<Button variant="danger" size="sm">Delete</Button>

// Card
<Card hoverable className="p-6">Content</Card>

// Badge
<Badge variant="success">Active</Badge>

// Spinner
<Spinner size="md" />

// EmptyState
<EmptyState
  icon="📋"
  title="No data"
  description="Create something new"
  action={<Button>Create</Button>}
/>
```

### Scoring & Panels

```tsx
import { FitScore, ScoreBreakdown, SkillChip } from '@/components/panels/ScorePanel';
import { EvidencePanel, DecisionTimeline } from '@/components/panels/EvidencePanel';

// Fit Score Circles
<FitScore score={85} size="lg" label="Technical" />

// Breakdown with expandable sections
<ScoreBreakdown breakdown={fitBreakdown} />

// Skill chips
<SkillChip skill="React" proficiency="expert" verified />

// Evidence display
<EvidencePanel evidence={candidateEvidence} />

// Decision timeline
<DecisionTimeline steps={processingSteps} />
```

### React Query Hooks

```tsx
import {
  useSession,
  useSessions,
  useCreateSession,
} from '@/hooks/api/sessions';
import {
  useCandidates,
  useCandidateDetail,
  useSearchCandidates,
  useRankCandidates,
} from '@/hooks/api/candidates';
import { useInsights, useExportResults } from '@/hooks/api/insights';

// Queries
const { data, isLoading, error } = useCandidates(sessionId);

// Mutations
const createSession = useCreateSession();
await createSession.mutateAsync('Senior Developer');
```

## API Integration

### Session Flow
```
POST /api/v1/sessions                          Create new session
GET  /api/v1/sessions                          Get all sessions
GET  /api/v1/sessions/{sessionId}              Get session details
DELETE /api/v1/sessions/{sessionId}            Delete session
GET  /api/v1/sessions/{sessionId}/processing-status  Get processing status
```

### Job Endpoints
```
POST   /api/v1/uploads/job-description         Upload job description
GET    /api/v1/jobs/{sessionId}                Get job understanding
PUT    /api/v1/jobs/{sessionId}                Update job understanding
POST   /api/v1/jobs/{sessionId}/confirm        Confirm job and start ranking
```

### Candidate Endpoints
```
POST   /api/v1/uploads/candidate-dataset       Upload candidate data
GET    /api/v1/candidates/{sessionId}          Get all candidates
GET    /api/v1/candidates/{sessionId}/{candidateId}  Get candidate details
GET    /api/v1/candidates/{sessionId}/search   Search/filter candidates
POST   /api/v1/ranking/{sessionId}             Start ranking process
GET    /api/v1/candidates/{sessionId}/compare  Compare two candidates
GET    /api/v1/candidates/{sessionId}/{candidateId}/fit-breakdown  Get fit details
```

### Analytics & Export
```
GET  /api/v1/insights/{sessionId}              Get recruiting insights
POST /api/v1/export/{sessionId}                Export results (JSON/CSV/PDF)
```

## Utility Functions

All utility functions are in `src/utils/formatters.ts`:

```tsx
import {
  formatScore,
  formatPercentage,
  formatDate,
  formatDuration,
  formatExperience,
  getScoreColor,
  getRecommendationLabel,
  getTrustScoreLabel,
  calculateAverage,
  isValidEmail,
  truncate,
  toTitleCase,
  downloadJson,
  downloadCsv,
} from '@/utils/formatters';
```

## Styling Approach

### Tailwind Configuration
- Utility-first CSS framework
- Custom color palette aligned with RECI branding
- Responsive design (mobile-first)
- Dark mode support (if enabled in tailwind.config.js)

### Component Styling Patterns
- Use Tailwind utilities directly
- Reusable className composites for consistency
- Framer Motion for animations
- CSS-in-JS only when necessary

### Responsive Breakpoints
```
sm: 640px   (tablets)
md: 768px   (small desktops)
lg: 1024px  (desktops)
xl: 1280px  (large screens)
```

## State Management Strategy

### React Query
- Handles all server state (API responses)
- Automatic caching and refetching
- Background updates
- Optimistic updates for mutations

### Local State
- Component-level `useState` for UI state (modals, tabs, forms)
- Search/filter state in components
- Selection state for multi-select

### Global State
- Query client as centralized cache
- No Redux (kept simple)

## Performance Optimizations

- Code splitting via Vite
- Lazy loading of pages
- Memoization of expensive components
- Virtualization for large candidate lists (future)
- Image optimization
- Bundle size monitoring

## Error Handling

- API errors caught and displayed as toasts
- Graceful fallbacks for missing data
- Network error recovery
- User-friendly error messages

## Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Focus management for modals

## Testing (Future)

Tests should be created for:
- File upload flows
- Search and filtering
- Candidate detail views
- Export functionality
- Comparison logic

```bash
# Example test commands (future)
npm run test                  # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

## Environment Variables

```
VITE_API_URL              # Backend API URL (default: http://localhost:8000)
VITE_LOG_LEVEL           # Logging level (default: info)
```

Create `.env.local` for local development overrides:
```
VITE_API_URL=http://localhost:8000
```

## Deployment

### Production Build
```bash
npm run build
# Output in dist/
```

### Docker (Future)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Common Issues & Solutions

### API Connection Errors
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check CORS settings in backend

### Styling Issues
- Ensure Tailwind CSS is properly imported in `src/index.css`
- Clear build cache: `rm -rf dist/ && npm run build`

### Build Failures
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `tsc --noEmit`

## Code Standards

- Use functional components and hooks
- Prefer composition over inheritance
- Export components from barrel files (index.ts)
- Use TypeScript strict mode
- Add JSDoc comments for complex functions
- Keep components under 300 lines
- Use const for components, let/const for variables
- Destructure props in function signature

## Git Workflow

```bash
# Feature branch
git checkout -b feature/new-component

# Commit with descriptive messages
git commit -m "feat: add new candidate filter component"

# Push and create PR
git push origin feature/new-component
```

## Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Recharts](https://recharts.org)

## Support

For issues or questions:
1. Check existing documentation
2. Review component storybook (future)
3. Ask in team channels
4. Create GitHub issues

## License

Proprietary - Redrob Explainable Candidate Intelligence (RECI)
