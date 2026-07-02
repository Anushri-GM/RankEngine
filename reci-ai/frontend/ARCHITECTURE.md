# RECI Frontend - Architecture & Component Hierarchy

## Page Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOME PAGE (/)                              │
│                    Welcome & Session Mgmt                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Create New Session Dialog      │
        │  (Modal: Enter Job Title)      │
        └───────────────────┬────────────┘
                            │
                            ▼
    ┌──────────────────────────────────────────┐
    │    UPLOAD PAGE (/upload/:sessionId)      │
    │  - Job Description Upload (DOCX/JSON)    │
    │  - Candidate Dataset Upload (CSV/XLSX)   │
    │  - Drag & Drop Support                   │
    │  - Upload Progress                       │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │  JOB REVIEW PAGE (/job-review/:sessionId)│
    │  - AI Job Understanding                  │
    │  - Edit/Confirm Job Details              │
    │  - Required/Preferred Skills             │
    │  - Key Requirements                      │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │ PROCESSING PAGE (/processing/:sessionId) │
    │  - Real-time Pipeline Progress           │
    │  - Step-by-Step Execution                │
    │  - Estimated Time                        │
    │  - Auto-redirect on complete             │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │ WORKSPACE PAGE (/workspace/:sessionId)   │
    │  - Candidate List (Ranked)               │
    │  - Search & Filter                       │
    │  - Multi-select Compare                  │
    │  - Quick Actions                         │
    └──────┬────────┬─────────────────┬────────┘
           │        │                 │
           │        │                 │
    ┌──────▼──┐   ┌─▼────────┐   ┌───▼─────────────────┐
    │ View    │   │ Compare  │   │ Export/Insights     │
    │Details  │   │ Selected │   │ (/insights/:sId)    │
    │(/cand...│   │ Pair     │   │ - Analytics         │
    │)        │   │          │   │ - Export Options    │
    └─────────┘   └──────────┘   └─────────────────────┘
          │
          ▼
    ┌──────────────────────────────────┐
    │ CANDIDATE DETAIL PAGE            │
    │ (/candidate/:sessionId/:candId)  │
    │  - Fit Score Breakdown           │
    │  - Experience & Skills           │
    │  - Evidence & Verification       │
    │  - Career Timeline               │
    │  - Tabbed Interface              │
    └──────────────────────────────────┘
```

## Component Hierarchy

```
App (Router)
├── HomePage
│   ├── SessionCard (list)
│   │   ├── Button (Open/Export/Delete)
│   │   └── Badge (Status)
│   └── CreateSessionForm
│       └── Button
│
├── UploadPage
│   ├── Card
│   │   ├── DropZone (Job Description)
│   │   │   ├── Input[file]
│   │   │   └── Button (Browse)
│   │   └── DropZone (Candidate Data)
│   │       ├── Input[file]
│   │       └── Button (Browse)
│   ├── ProgressBar
│   └── Toast (Errors)
│
├── JobReviewPage
│   ├── Card
│   │   ├── RoleTitle Input
│   │   ├── SkillChip (list)
│   │   ├── KeyInfo Section
│   │   └── Responsibilities (list)
│   └── Button (Confirm/Edit)
│
├── ProcessingPage
│   └── Card
│       └── ProcessingProgress
│           ├── ProgressBar (main)
│           ├── StepIndicators
│           ├── EstimatedTime
│           └── StatusIcon
│
├── WorkspacePage
│   ├── SearchBar
│   ├── Filters
│   │   ├── Sort Dropdown
│   │   └── Order Toggle
│   ├── CompareBar (conditional)
│   │   └── CompareButton
│   └── CandidateCard (grid)
│       ├── FitScore
│       ├── Scores Summary
│       ├── Badge (Recommendation)
│       └── Buttons (View/Compare)
│
├── CandidateDetailPage
│   ├── Header
│   │   ├── BackButton
│   │   ├── Candidate Name & Location
│   │   └── FitScore x3 (circle)
│   ├── Tabs (navigation)
│   │   ├── Overview Tab
│   │   │   ├── ScoreBreakdown
│   │   │   │   ├── FitComponent (expandable) x6
│   │   │   │   └── FitFactor (nested)
│   │   │   └── QuickStats
│   │   │
│   │   ├── Experience Tab
│   │   │   └── Card (per experience)
│   │   │       ├── Title/Company
│   │   │       ├── Duration
│   │   │       ├── Description
│   │   │       └── SkillChip (list)
│   │   │
│   │   ├── Skills Tab
│   │   │   ├── MatchedSkills
│   │   │   │   └── Card (per skill)
│   │   │   │       ├── SkillName
│   │   │   │       ├── Evidence (nested)
│   │   │   │       └── VerificationBadge
│   │   │   └── MissingSkills
│   │   │       └── SkillChip (list)
│   │   │
│   │   └── Evidence Tab
│   │       └── EvidencePanel
│   │           ├── Section (per category)
│   │           └── EvidenceItem (card)
│   │               ├── Icon (status)
│   │               ├── Title/Description
│   │               ├── Source Badge
│   │               └── VerifiedBadge
│
├── ComparePage
│   ├── Header
│   │   ├── BackButton
│   │   └── CompareCandidates x2
│   │       └── FitScore (large)
│   ├── ComparisonMetrics
│   │   └── Metric Row x5
│   │       ├── Label
│   │       ├── Score1
│   │       ├── Indicator (arrow/tie)
│   │       └── Score2
│   └── ComparisonSections x3
│       ├── Experience Comparison
│       ├── Skills Comparison
│       └── Education Comparison
│
└── InsightsPage
    ├── ExportSection
    │   ├── FormatSelector
    │   └── ExportButton
    ├── KeyMetrics x4
    │   └── Card (each)
    ├── ScoreDistributionChart
    │   └── BarChart
    ├── ExperienceChart
    │   └── PieChart
    ├── TopSkillsList
    │   └── SkillRow (progress bar)
    ├── TrustDistribution
    │   └── Card (each score range)
    └── BehaviorChart
        └── BarChart
```

## Common UI Components (src/components/common)

```
├── Button
│   Props: variant, size, loading, disabled, className, ...rest
│   Variants: primary, secondary, danger, ghost
│   Sizes: sm, md, lg
│
├── Card
│   Props: hoverable, className, children
│   Features: Shadow, hover effect, border
│
├── Badge
│   Props: variant, size, className, children
│   Variants: primary, success, warning, danger, info
│   Sizes: sm, md, lg
│
├── Modal
│   Props: isOpen, title, children, onClose, size
│   Features: Backdrop, animations, close button
│
├── Toast
│   Props: type, message, onClose
│   Types: success, error, info, warning
│   Auto-dismiss after 5s
│
├── Spinner
│   Props: size, className
│   Sizes: sm, md, lg
│
├── SkeletonLoader
│   Props: className, count
│   Use for loading states
│
├── ProgressBar
│   Props: progress, color, animated
│   Colors: blue, green, orange, red
│
└── EmptyState
    Props: icon, title, description, action
    Use for empty data states
```

## Specialized Components

### Score Panel (src/components/panels/ScorePanel.tsx)
```
├── FitScore
│   - Circular progress visualization
│   - Animated SVG circle
│   - Configurable size and label
│
├── ScoreBreakdown
│   - Expandable sections for each fit component
│   - Contributing factors display
│   - Percentage indicators
│
└── SkillChip
    - Inline skill display with proficiency
    - Verification badge
    - Optional remove button
```

### Evidence Panel (src/components/panels/EvidencePanel.tsx)
```
├── EvidencePanel
│   - Category-based evidence grouping
│   - Verified/unverified indicators
│   - Source attribution
│
├── DecisionTimeline
│   - Step-by-step pipeline visualization
│   - Status icons (pending/processing/done/error)
│   - Duration for each step
│   - Total processing time
│
└── ProcessingProgress
    - Current step display
    - Main progress bar (percentage)
    - Step indicators grid
    - Estimated time remaining
```

### Card Components (src/components/cards)
```
├── CandidateCard
│   - Overall and trust scores
│   - Technical/career/behavior scores
│   - Recommendation badge
│   - Rank display
│   - View/Compare buttons
│   - Selection checkbox state
│
└── SessionCard
    - Role title and session ID
    - Status badge
    - Created date
    - Candidate count
    - Open/Export/Delete buttons
```

## React Query Hooks Organization

### Session Hooks (src/hooks/api/sessions.ts)
```
useCreateSession()          → Create new hiring session
useSession(sessionId)       → Get single session details
useSessions()              → Get all sessions
useDeleteSession()         → Delete a session
useSessionProcessingStatus() → Get real-time progress
```

### Job Hooks (src/hooks/api/jobs.ts)
```
useUploadJobDescription()  → Upload job file
useUploadCandidateDataset() → Upload candidate file
useJobUnderstanding()      → Get AI job analysis
useUpdateJobUnderstanding() → Update job details
useConfirmJobUnderstanding() → Confirm and start ranking
```

### Candidate Hooks (src/hooks/api/candidates.ts)
```
useCandidates()            → Get all ranked candidates
useCandidateDetail()       → Get single candidate details
useSearchCandidates()      → Search/filter candidates
useRankCandidates()        → Trigger ranking process
useCompareCandidates()     → Get comparison data
useFitScoreBreakdown()     → Get detailed fit analysis
```

### Insights Hooks (src/hooks/api/insights.ts)
```
useInsights()              → Get recruiting analytics
useExportResults()         → Export results (JSON/CSV/PDF)
```

## Utility Functions (src/utils/formatters.ts)

### Formatting
```
formatScore()       → Format numbers to 1 decimal place
formatPercentage()  → Convert to percentage string
formatDate()        → Format date to readable string
formatDateTime()    → Format date + time
formatDuration()    → Convert milliseconds to readable time
formatExperience()  → Format years to readable string
```

### Colors & Styling
```
getScoreColor()     → Get text color for score
getScoreBgColor()   → Get background color for score
getRecommendationColor() → Get badge color for recommendation
getTrustScoreLabel()    → Get label for trust score
getProficiencyColor()   → Get color for skill proficiency
```

### Calculations
```
calculateAverage()  → Mean of array
calculateMedian()   → Median of array
calculateStdDev()   → Standard deviation
compareScores()     → Compare two scores
calculateScoreDifference() → Get difference
```

### Validation
```
isValidEmail()      → Email validation regex
isValidUrl()        → URL validation
isValidFileSize()   → Check file size limit
isValidFileType()   → Check allowed MIME types
```

### String Utilities
```
truncate()          → Truncate string with ellipsis
capitalize()        → Capitalize first letter
toTitleCase()       → Convert to Title Case
slugify()           → Convert to URL slug
```

### Export Utilities
```
downloadJson()      → Download data as JSON file
downloadCsv()       → Download data as CSV file
```

## Type System (src/types/index.ts)

Core interfaces:
- `HiringSession` - Session metadata
- `ProcessingStatus` - Real-time progress
- `JobUnderstanding` - Parsed job requirements
- `CandidateProfile` - Summary ranking data
- `CandidateDetail` - Full candidate information
- `FitScoreBreakdown` - Detailed fit analysis
- `RankingResult` - Processing output
- `SearchFilters` - Query parameters
- `RecruitingInsights` - Analytics data

## Performance Considerations

1. **Code Splitting**
   - Each page is lazy-loaded
   - Components bundled by feature

2. **Query Optimization**
   - React Query caching prevents re-fetches
   - Stale time: 60s for most queries
   - Background updates

3. **Rendering**
   - Memoization for heavy components
   - Virtual lists for large datasets (future)
   - Conditional rendering of expensive components

4. **Asset Optimization**
   - Tailwind CSS purging unused styles
   - Icon tree-shaking with Lucide
   - Image compression (future)

## Internationalization (Future)

Prepare for i18n:
- Wrap all visible strings in translation functions
- Use `useTranslation` hook
- Support multiple languages in settings

## Accessibility Checklist

- [ ] Semantic HTML elements
- [ ] ARIA labels for icons
- [ ] Keyboard navigation support
- [ ] Focus management in modals
- [ ] Color contrast (WCAG AA)
- [ ] Alt text for images
- [ ] Form error messages
- [ ] Loading and status announcements

## Security Considerations

- Input validation before submission
- CORS configuration in backend
- Auth tokens (implement in Part 5)
- XSS prevention via React defaults
- CSRF tokens for mutations
- Secure storage for sensitive data

## Testing Strategy (Future)

```
Unit Tests:
- Utility functions
- Hooks logic
- Component logic

Integration Tests:
- Page workflows
- API interactions
- Form submissions

E2E Tests:
- Full recruiter journey
- Search/filter operations
- Export functionality
```
