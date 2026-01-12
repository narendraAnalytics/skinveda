# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skinveda** is a React Native mobile application built with Expo that provides personalized skincare guidance through AI-powered face analysis. The tagline is "From face scan to skin wisdom" - positioning as "Your Personal skincare companion."

- **Framework**: Expo ~54.0.30 with Expo Router for file-based routing
- **Runtime**: React 19.1.0, React Native 0.81.5
- **Authentication**: Clerk v2.19.14 with OAuth support (Google, GitHub, LinkedIn)
- **Backend**: Node.js/Express with TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM 0.45.1
- **AI Engine**: Google Gemini API (gemini-3-flash-preview for analysis, gemini-2.5-flash-preview-tts for voice)
- **Package**: `com.saasaideveloper.skinveda`

## Development Commands

### Frontend (Expo)

```bash
# Start development server
npm start
npx expo start

# Run on specific platforms
npm run android          # Android emulator
npm run ios             # iOS simulator
npm run web             # Web browser

# Code quality
npm run lint            # ESLint check

# Reset to blank template
npm run reset-project   # Moves current code to app-example/
```

### Backend (Express)

```bash
cd backend

# Development (hot reload)
npm run dev

# Production build
npm run build           # Compile TypeScript to dist/
npm start              # Run compiled JavaScript

# Database migrations (Drizzle ORM)
npx drizzle-kit generate   # Generate migrations from schema changes
npx drizzle-kit push       # Push schema to database
npx drizzle-kit studio     # Open Drizzle Studio (database GUI)

# One-time setup (already done)
npm install
```

## Architecture Overview

### Dual-Codebase Structure

The project is split into two separate codebases:

1. **Frontend** (root directory): React Native/Expo mobile app
2. **Backend** (`backend/` directory): Express API server

Both share similar type definitions but maintain independent package.json files.

### File-Based Routing (Expo Router)

```
app/
├── _layout.tsx              # Root layout with ClerkProvider
├── index.tsx                # Landing page with video background
├── profile.tsx              # User profile view
├── history.tsx              # Analysis history list screen
├── analysis/
│   └── [id].tsx             # Dynamic route: View saved analysis by ID
├── (auth)/                  # Auth route group (hidden from URL)
│   ├── _layout.tsx          # Redirect logic for authenticated users
│   ├── sign-in.tsx          # Email/password + OAuth sign in
│   └── sign-up.tsx          # Registration with email verification
└── (wizard)/                # Multi-step skin analysis wizard
    ├── _layout.tsx          # WizardProvider wrapper, auth guard
    ├── welcome.tsx          # Step 1: Introduction
    ├── profile-name.tsx     # Step 2: Name input
    ├── profile-bio.tsx      # Step 3: Age + Gender
    ├── skin-details.tsx     # Step 4: Skin type + sensitivity
    ├── concerns-health.tsx  # Step 5: Concerns + health data
    ├── photo-capture.tsx    # Step 6: Camera/upload
    └── dashboard.tsx        # Step 7: AI analysis results
```

**Key Routing Patterns:**

- Root `_layout.tsx` wraps entire app with `<ClerkProvider>`
- Auth group `(auth)/_layout.tsx` redirects authenticated users to home (`/`)
- Wizard group `(wizard)/_layout.tsx` redirects unauthenticated users to sign-in and wraps wizard in `<WizardProvider>`
- Home screen (`index.tsx`) shows "Glow Guide" button to start wizard at `/wizard/welcome`
- Profile screen (`profile.tsx`) displays user information and connected OAuth accounts
- History screen (`history.tsx`) lists all saved analyses for the user (max 20, auto-pruned)
- Dynamic route `analysis/[id].tsx` displays full details of a specific saved analysis

### Backend API Architecture

**Location:** `backend/src/`

```
backend/
├── src/
│   ├── server.ts                    # Express app entry point
│   ├── types/index.ts               # Shared type definitions
│   ├── middleware/auth.ts           # Clerk JWT verification
│   ├── services/
│   │   ├── geminiService.ts         # AI analysis & TTS
│   │   └── dbService.ts             # Database operations (Drizzle)
│   ├── db/
│   │   ├── index.ts                 # Database connection
│   │   └── schema.ts                # Drizzle schema definitions
│   ├── controllers/
│   │   ├── analysisController.ts    # POST /api/analyze
│   │   ├── analysesController.ts    # GET/DELETE /api/analyses
│   │   └── ttsController.ts         # POST /api/tts
│   └── routes/api.ts                # Route definitions
├── drizzle/                         # Generated migrations
├── drizzle.config.ts                # Drizzle Kit configuration
├── package.json
├── tsconfig.json
└── .env                             # GEMINI_API_KEY, CLERK_SECRET_KEY, DATABASE_URL, PORT
```

**API Endpoints:**

- `GET /health` - Health check (no auth required)
- `POST /api/analyze` - Skin analysis (requires Clerk auth token)
  - Body: `{ profile: UserProfile, imageBase64: string }`
  - Returns: `{ success: true, data: AnalysisResult, analysisId: string }`
  - Automatically saves analysis to database
- `GET /api/analyses` - List all saved analyses for user (requires auth)
  - Returns: `{ success: true, data: AnalysisListItem[] }`
  - Sorted by creation date (newest first)
- `GET /api/analyses/:id` - Get single analysis by ID (requires auth)
  - Returns: `{ success: true, data: StoredAnalysis }`
  - Includes full profile + analysis details
- `DELETE /api/analyses/:id` - Delete analysis (requires auth)
  - Returns: `{ success: true, message: string }`
- `POST /api/tts` - Text-to-speech (requires Clerk auth token)
  - Body: `{ text: string }`
  - Returns: `{ audioBase64: string }`

**CORS Configuration:**

- Allows all origins in development (`origin: true`)
- Supports mobile development on local network (localhost:8081, localhost:19006)
- 10MB JSON body limit for base64 images

### Authentication System (Clerk)

**Setup:**

- Clerk provider initialized in `app/_layout.tsx` with token caching via `expo-secure-store`
- Backend validates JWT tokens using `@clerk/clerk-sdk-node` middleware
- Environment variables:
  - Frontend: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Backend: `CLERK_SECRET_KEY`
- Deep linking scheme: `skinveda` (for OAuth redirects)

**Supported Authentication Methods:**

1. Email/password with email verification code
2. OAuth providers: Google, GitHub, LinkedIn OIDC

**Critical OAuth Implementation Detail:**

When users sign up via OAuth, Clerk may require additional fields (like username). The custom implementation in `app/(auth)/sign-up.tsx` handles this:

```typescript
// Lines 117-142: completeOAuthSignUp function
// IMPORTANT: After collecting missing fields, call update() directly
const result = await oauthSignUpData.update({ username: oauthUsername });

// Check result.status === 'complete'
// DO NOT call prepareEmailAddressVerification or attemptEmailAddressVerification
// OAuth providers already verify email - additional verification calls will fail
```

**Authentication Hooks:**

- `useUser()` from `@clerk/clerk-expo` - Access user data and `isSignedIn` state
- `useAuth()` from `@clerk/clerk-expo` - Access `signOut()` and `getToken()` methods

**Layout Redirect Patterns:**

```typescript
// app/(auth)/_layout.tsx - Redirect authenticated users home
const { isSignedIn } = useAuth();
useEffect(() => {
  if (isSignedIn) router.replace('/');
}, [isSignedIn]);

// app/(wizard)/_layout.tsx - Redirect unauthenticated users to sign-in
if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
```

### Database Layer (Neon + Drizzle ORM)

**Database Schema** (`backend/src/db/schema.ts`):

- Single table: `skin_analyses`
- Primary key: UUID (auto-generated)
- Indexed on: `userId` + `createdAt` (descending)
- Stores: User profile snapshot + analysis metrics + recommendations

**DatabaseService** (`backend/src/services/dbService.ts`):

Key methods:
- `saveAnalysis(userId, profile, analysis)` - Insert new analysis, auto-enforce 20-limit
- `getUserAnalyses(userId)` - List all analyses (newest first)
- `getAnalysisById(id, userId)` - Fetch single analysis with full details
- `deleteAnalysis(id, userId)` - Delete specific analysis
- `enforceUserLimit(userId)` - Private: Auto-delete oldest analyses when count > 20

**Important Behavior:**

- Each user is limited to 20 saved analyses
- When 21st analysis is saved, oldest is automatically deleted
- All queries validate userId to prevent unauthorized access

**Connection:**

- Uses `@neondatabase/serverless` for Neon PostgreSQL
- Connection string from `DATABASE_URL` environment variable
- Drizzle ORM handles query building and type safety

### State Management

**WizardContext** (`contexts/WizardContext.tsx`):

- Central state for 7-step wizard flow
- Persists to AsyncStorage on every change
- Restores state on app restart (wizard progress preserved)

**State Shape:**

```typescript
{
  profile: UserProfile,          // Name, age, gender, skin type, concerns, health
  capturedImage: string | null,  // Base64 image from camera
  analysis: AnalysisResult | null, // AI analysis results
  currentStep: number,           // Current wizard step (0-6)
}
```

**Key Methods:**

- `updateProfile(updates)` - Merge partial updates into profile
- `setCapturedImage(image)` - Store captured photo
- `setAnalysis(result)` - Store AI analysis
- `resetWizard()` - Clear all state and AsyncStorage

### API Client Pattern

**ApiClient** (`services/apiClient.ts`):

- Singleton class injected with Clerk's `getToken()` method
- Automatically attaches `Authorization: Bearer <token>` header
- Used via `useApiClient()` hook in components

```typescript
const apiClient = useApiClient();

// Call analysis (saves to database automatically)
const result = await apiClient.analyzeSkin(profile, imageBase64);

// Get analysis history
const analyses = await apiClient.getAnalyses();

// Get single analysis by ID
const analysis = await apiClient.getAnalysisById(id);

// Delete analysis
await apiClient.deleteAnalysis(id);

// Get TTS audio
const audioBase64 = await apiClient.getTTS("Hello world");
```

### Component Organization

```
components/
├── OAuthButton.tsx              # Reusable OAuth provider button
├── ProfileInfoRow.tsx           # Profile screen info display
├── themed-text.tsx              # Theme-aware text wrapper
├── themed-view.tsx              # Theme-aware view wrapper
├── ui/
│   └── icon-symbol.tsx          # Platform-specific SF Symbols
└── wizard/                      # Wizard-specific components
    ├── ProgressBar.tsx          # Step progress indicator
    ├── StepContainer.tsx        # Consistent wizard screen layout
    ├── SelectionButton.tsx      # Multi-choice selection button
    ├── CameraView.tsx           # Camera with face guide overlay
    ├── MetricBar.tsx            # Horizontal metric bar (0-100)
    ├── MetricCard.tsx           # Score card with icon
    └── RecommendationCard.tsx   # Collapsible recommendation section

contexts/
└── WizardContext.tsx            # Wizard state management

services/
└── apiClient.ts                 # Backend API client

types/
└── wizard.ts                    # Frontend type definitions

hooks/
├── use-color-scheme.ts          # Color scheme detection (native)
├── use-color-scheme.web.ts      # Color scheme detection (web)
└── use-theme-color.ts           # Theme color utilities

constants/
├── theme.ts                     # Design system colors & fonts
└── wizardOptions.ts             # Wizard dropdown options & text
```

## Design System

### Color Palette

```typescript
// Primary brand colors
Primary: '#E8B4B8'              // Rose/mauve (main theme)
SignOut: '#FF6B6B'              // Coral red (sign-out button)
Dark: '#1a1a1a'                 // Dark backgrounds
Light: '#ffffff'                // Light backgrounds

// Wizard-specific colors (constants/theme.ts)
WizardColors.primary: '#E8B4B8'
WizardColors.emerald[500]: '#10B981'  // Success/metrics
WizardColors.slate[800]: '#1E293B'    // Card backgrounds
WizardColors.overlay: 'rgba(0, 0, 0, 0.4)'
WizardColors.cardBg: 'rgba(255, 255, 255, 0.1)'

// Transparency patterns
'rgba(255, 255, 255, 0.25)'    // Button backgrounds
'rgba(255, 255, 255, 0.3)'     // Mute button background
'rgba(0, 0, 0, 0.4)'           // Video overlay
'rgba(232, 180, 184, 0.5)'     // Placeholder text
```

### UI Patterns

**Button Styling:**

- Border: 2px solid with theme color
- Border radius: 20-25px
- Shadow: Colored shadow matching border (shadowColor + elevation)
- Semi-transparent background

**Landing Page (app/index.tsx):**

- Full-screen video background (`public/video/video.mp4`)
- Muted by default with toggle button (top-right)
- Logo positioned top-left
- Profile button (top-left, near logo) - only when signed in
- Welcome message OR "Glow Guide" CTA button (bottom center)
- Sign-out button below welcome message (bright coral color) - only when signed in
- Tap screen to toggle navigation bar visibility

**Auth Screens:**

- Dark background (#1a1a1a)
- Semi-transparent input fields with pink borders
- Email verification flow for standard sign-up
- OAuth buttons with provider icons (Google, GitHub, LinkedIn)
- Modal for collecting username from OAuth users

**Wizard Screens:**

- Dark background (#1a1a1a)
- Progress bar at top (7 steps)
- StepContainer wrapper with consistent layout
- SelectionButton for multi-choice inputs
- Slide-from-right animation between steps
- Dashboard displays metrics as bars + cards with recommendations

## Environment Setup

### Frontend Environment Variables

```bash
# .env file (required)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000  # Or production URL

# Optional
EXPO_PUBLIC_API_URL=  # Legacy, not currently used
EXPO_PUBLIC_GOOGLE_CLIENT_ID=  # For OAuth setup
```

### Backend Environment Variables

```bash
# backend/.env file (required)
GEMINI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...  # Neon PostgreSQL connection string
PORT=3000  # Optional, defaults to 3000
```

### OAuth Configuration

OAuth redirect URLs must use the custom scheme:

```typescript
redirectUrl: Linking.createURL('/(auth)/sign-up', { scheme: 'skinveda' })
```

## Key Dependencies

### Frontend

| Package | Purpose |
|---------|---------|
| `expo-router` | File-based routing |
| `@clerk/clerk-expo` | Authentication |
| `expo-secure-store` | Secure token caching |
| `expo-av` | Video/audio playback (landing video, TTS) |
| `expo-camera` | Face photo capture |
| `expo-image-picker` | Alternative photo selection |
| `expo-web-browser` | OAuth web flow |
| `@expo/vector-icons` | Icon library (MaterialCommunityIcons, FontAwesome5) |
| `react-native-gesture-handler` | Gesture detection |
| `react-native-reanimated` | Animations |
| `@react-native-async-storage/async-storage` | Wizard state persistence |
| `@google/genai` | Type definitions (shared with backend) |

### Backend

| Package | Purpose |
|---------|---------|
| `express` | HTTP server framework |
| `@clerk/clerk-sdk-node` | JWT verification |
| `@google/genai` | Gemini AI SDK |
| `@neondatabase/serverless` | Neon PostgreSQL driver |
| `drizzle-orm` | TypeScript ORM for database queries |
| `drizzle-kit` | Schema migrations and studio (dev) |
| `cors` | CORS middleware |
| `dotenv` | Environment variable loading |
| `winston` | Logging |
| `zod` | Runtime validation |
| `uuid` | UUID generation |
| `typescript` | Type safety |
| `ts-node` | TypeScript execution |
| `nodemon` | Hot reload in development |

## Critical Implementation Notes

### Gemini AI Integration

**Skin Analysis** (`backend/src/services/geminiService.ts`):

- Model: `gemini-3-flash-preview`
- Input: User profile (JSON) + face photo (base64 JPEG)
- Output: Structured JSON with skin metrics (0-100) + recommendations
- Prompt: Acts as "Holistic Dermatologist and Ayurvedic Skin Specialist"
- Health data conditioning: Adjusts recommendations based on sleep, heart rate, steps
- Tools: Google Search enabled for latest dermatology research

**Response Schema:**

```typescript
{
  overallScore: number,
  eyeAge: number,
  skinAge: number,
  hydration: number,
  redness: number,
  pigmentation: number,
  lines: number,
  acne: number,
  translucency: number,
  uniformness: number,
  pores: number,
  summary: string,
  recommendations: {
    yoga: string[],
    meditation: string[],
    naturalRemedies: string[],
    diet: { juices: string[], eat: string[], avoid: string[] },
    exercises: { face: string[], body: string[] },
    stressManagement: string[]
  }
}
```

**TTS (Text-to-Speech):**

- Model: `gemini-2.5-flash-preview-tts`
- Voice: `Kore` (prebuilt voice)
- Output: Base64-encoded audio
- Used for narrating wizard steps (not yet implemented in UI)

### OAuth Sign-Up Flow

1. User clicks OAuth button → `handleOAuthSignUp()` calls `startOAuthFlow()`
2. If `createdSessionId` exists → Sign-up complete, navigate to home
3. If `signUp` object returned → Missing required fields (username)
   - Show modal (`showUsernameModal = true`)
   - Collect username in `oauthUsername` state
   - Call `completeOAuthSignUp()`
4. In `completeOAuthSignUp()`:
   - Call `oauthSignUpData.update({ username })`
   - Check `result.status === 'complete'`
   - Call `setActive({ session: result.createdSessionId })`
   - **DO NOT** call email verification methods

### Navigation Bar (Android)

```typescript
// app/index.tsx - Lines 21-24
useEffect(() => {
  NavigationBar.setVisibilityAsync('hidden');  // Immersive experience
  NavigationBar.setBehaviorAsync('overlay-swipe');
  NavigationBar.setBackgroundColorAsync('#000000');
}, []);
```

### Video Background Management

```typescript
// Muted by default, user can toggle
const [isMuted, setIsMuted] = useState(true);

// Video should loop and auto-play
<Video
  shouldPlay={true}
  isLooping={true}
  isMuted={isMuted}
  useNativeControls={false}
/>
```

### Camera Face Capture

**CameraView Component** (`components/wizard/CameraView.tsx`):

- Uses `expo-camera` for in-app capture
- Oval face guide overlay with scanning animation
- Auto-detects face positioning (not yet implemented - placeholder for ML Kit)
- Returns base64 JPEG when "Capture" button pressed
- Fallback to `expo-image-picker` if camera permissions denied

### Wizard State Persistence

**Critical Behavior:**

- All wizard state saved to AsyncStorage on every change
- When user returns to app, wizard resumes at last step
- Use `resetWizard()` to clear state (e.g., after viewing dashboard)
- State key: `'wizardState'`

### Backend Server Startup

```bash
# Development (from backend/ directory)
npm run dev  # Runs on http://0.0.0.0:3000

# Production
npm run build
npm start
```

**Network Access:**

- Server binds to `0.0.0.0` (not `localhost`) for mobile device access on local network
- Frontend connects to `EXPO_PUBLIC_BACKEND_URL` (default: `http://localhost:3000`)
- For physical device testing, set `EXPO_PUBLIC_BACKEND_URL=http://<your-ip>:3000`

## TypeScript Configuration

### Frontend

- **Strict mode enabled** - Full type safety enforced
- **Path alias**: `@/*` maps to root directory
- **Base config**: Extends `expo/tsconfig.base`
- **Typed routes**: Enabled in app.json experiments

### Backend

- **Target**: ES2020
- **Module**: CommonJS
- **Out directory**: `dist/`
- **Root directory**: `src/`
- **Strict mode**: Enabled

## Platform-Specific Notes

### Android

- Edge-to-edge rendering enabled
- Adaptive icons configured
- Predictive back gesture disabled
- Navigation bar hidden on landing page

### iOS

- Supports tablet layout
- Standard status bar behavior
- SF Symbols support via icon-symbol component

### Web

- Static output build
- Color scheme detection via `use-color-scheme.web.ts`
- Not primary target - mobile-first design

## Common Patterns

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/settings.tsx`)
2. Export default component
3. File name becomes route (e.g., `/settings`)
4. Use `(groups)` for layout-specific routes

### Adding Authentication Guard

```typescript
// In layout file
const { isSignedIn } = useAuth();

if (!isSignedIn) {
  return <Redirect href="/(auth)/sign-in" />;
}
```

### Accessing User Data

```typescript
const { user, isSignedIn, isLoaded } = useUser();

if (!isLoaded) return <LoadingScreen />;
if (!isSignedIn) return <SignInPrompt />;

// Access user.username, user.firstName, user.emailAddress, etc.
```

### Using WizardContext

```typescript
import { useWizard } from '@/contexts/WizardContext';

const { profile, updateProfile, capturedImage, analysis } = useWizard();

// Update profile
updateProfile({ name: 'John', age: '30' });

// Store image
setCapturedImage(base64String);
```

### Calling Backend API

```typescript
import { useApiClient } from '@/services/apiClient';

const apiClient = useApiClient();
const result = await apiClient.analyzeSkin(profile, imageBase64);
```

### Theme-Aware Components

```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

const backgroundColor = useThemeColor({}, 'background');
```

### Adding New Backend Endpoint

1. Define controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/api.ts`
3. Add method to ApiClient in `services/apiClient.ts`
4. Import and use in React components

### Working with Database

```typescript
import { DatabaseService } from '@/backend/src/services/dbService';

const dbService = new DatabaseService();

// Save analysis after AI processing
const analysisId = await dbService.saveAnalysis(userId, profile, analysisResult);

// Query user's history
const analyses = await dbService.getUserAnalyses(userId);

// Get specific analysis
const analysis = await dbService.getAnalysisById(id, userId);
```

### Making Database Schema Changes

1. Edit `backend/src/db/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Review generated SQL in `backend/drizzle/`
4. Push to database: `npx drizzle-kit push`
5. Update TypeScript types in `backend/src/types/index.ts`

## Testing & Quality

- **Linting**: ESLint with `eslint-config-expo`
- **Type checking**: TypeScript strict mode (frontend + backend)
- **No test framework configured yet** - To be added

## Known Issues & Future Work

- TTS voice narration not yet integrated in wizard UI (backend ready)
- Face detection overlay is placeholder (ML Kit integration needed)
- No analytics/error tracking configured
- Dashboard "Share Results" feature not implemented
- No backend deployment configuration (currently local only)
- Health data integration (wearables) not yet implemented
- Analysis images are not currently stored in database (only metrics/recommendations)
