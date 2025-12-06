# Gig Board UI Components

This directory contains the complete UI implementation for the Gig Economy Micro-Job Board feature.

## Components

### GigDashboard
Main container component that manages the overall gig board experience.

**Features:**
- Navigation between Job Board and My Gigs views
- Modal management for job posting and detail views
- Real-time updates coordination

**Usage:**
```tsx
import { GigDashboard } from './components/gig';

function App() {
  return <GigDashboard />;
}
```

### GigBoard
Displays available gig jobs with search and filtering capabilities.

**Features:**
- Job listing cards with category badges
- Search functionality
- Advanced filters (category, payment type, status)
- Real-time job updates via Socket.io
- Responsive grid layout

**Props:**
- `onJobClick: (job: GigJob) => void` - Callback when a job is clicked
- `onCreateJob: () => void` - Callback to open job posting form

### JobPostingForm
Modal form for creating new gig job postings.

**Features:**
- Multi-step form with validation
- Skill selector with proficiency levels
- Location picker with current location support
- Payment configuration (fixed, hourly, negotiable)
- Duration and deadline settings
- Escrow option

**Props:**
- `onClose: () => void` - Callback to close the form
- `onSuccess: () => void` - Callback when job is successfully created

### JobDetailView
Detailed view of a gig job with application and management features.

**Features:**
- Complete job information display
- Application submission for workers
- Applicant list with match scores (for job owners)
- AI-suggested workers display
- Worker selection functionality
- Job completion workflow
- Mutual rating system
- Real-time status updates

**Props:**
- `job: GigJob` - The job to display
- `onClose: () => void` - Callback to close the detail view
- `onUpdate: () => void` - Callback when job is updated

### MyGigs
Dashboard for managing user's posted jobs, applications, and assignments.

**Features:**
- Three-tab interface (Posted Jobs, Applications, Assigned Jobs)
- Statistics overview
- Status tracking
- Real-time updates

**Props:**
- `onJobClick: (job: GigJob) => void` - Callback when a job is clicked

## Services

### gigService
Frontend service for interacting with the gig API.

**Methods:**
- `createGigJob(jobData)` - Create a new job posting
- `getGigJobById(jobId)` - Get job details
- `updateGigJob(jobId, updates)` - Update a job
- `deleteGigJob(jobId)` - Delete a job
- `searchGigJobs(filters, limit, skip)` - Search and filter jobs
- `applyForJob(jobId, message)` - Apply to a job
- `selectWorker(jobId, workerId)` - Select a worker for a job
- `completeJob(jobId)` - Mark job as completed
- `rateJob(jobId, rating, review, raterRole)` - Rate a completed job
- `getUserPostedJobs(status?)` - Get user's posted jobs
- `getUserApplications()` - Get user's applications
- `getUserAssignedJobs(status?)` - Get jobs assigned to user

## Real-Time Updates

The components use Socket.io for real-time updates:

**Events:**
- `gig:job_created` - New job posted
- `gig:job_updated` - Job details updated
- `gig:job_deleted` - Job deleted
- `gig:application_received` - New application received
- `gig:worker_selected` - Worker selected for job
- `gig:job_completed` - Job marked as completed

## Workflow

### Posting a Job
1. User clicks "Post a Job" button
2. JobPostingForm modal opens
3. User fills in job details, skills, location, payment, duration
4. Form validates and submits to API
5. Real-time event notifies all connected clients
6. Job appears in GigBoard

### Applying for a Job
1. User browses jobs in GigBoard
2. Clicks on a job to view details
3. JobDetailView opens with full information
4. User clicks "Apply for this Job"
5. Submits application message
6. AI calculates match score
7. Job owner receives notification

### Selecting a Worker
1. Job owner views applicants in JobDetailView
2. Reviews match scores and application messages
3. Clicks "Select" on chosen applicant
4. Job status changes to "in_progress"
5. Selected worker receives notification

### Completing a Job
1. Either poster or worker marks job as completed
2. Job status changes to "completed"
3. Both parties can submit ratings and reviews
4. Ratings are stored and displayed

## AI Matching

The backend automatically runs AI matching when a job is posted:
- Analyzes required skills and proficiency levels
- Searches for users with matching skills
- Calculates match scores (0-100%)
- Considers location proximity
- Suggests top 10 matches (minimum 60% score)

## Styling

Components use Tailwind CSS with a consistent design system:
- Dark theme with purple/pink gradients
- Glassmorphism effects
- Smooth transitions and hover states
- Responsive layouts
- Category-specific color coding

## Requirements Validation

This implementation satisfies the following requirements:

**Requirement 3.1:** Job posting with details, skills, location, and payment ✓
**Requirement 3.2:** AI-powered job-to-worker matching ✓
**Requirement 3.3:** Application submission and communication tracking ✓
**Requirement 3.4:** Mutual rating and reputation updates ✓
**Requirement 3.5:** Real-time updates for job status changes ✓

## Future Enhancements

Potential improvements:
- In-app messaging between poster and applicants
- Payment integration with escrow
- Job templates for recurring tasks
- Advanced search with saved filters
- Mobile-optimized views
- Push notifications for job updates
- Dispute resolution workflow
