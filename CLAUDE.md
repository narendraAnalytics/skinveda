# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skinveda** is a React Native mobile application built with Expo that provides personalized skincare guidance. The tagline is "From face scan to skin wisdom" - positioning as "Your Personal skincare companion."

- **Framework**: Expo ~54.0.30 with Expo Router for file-based routing
- **Runtime**: React 19.1.0, React Native 0.81.5
- **Authentication**: Clerk v2.19.14 with OAuth support (Google, GitHub, LinkedIn)
- **Package**: `com.saasaideveloper.skinveda`

## Development Commands

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

## Architecture Overview

### File-Based Routing (Expo Router)

The app uses file-based routing with the following structure:

```
app/
├── _layout.tsx           # Root layout with ClerkProvider
├── index.tsx             # Landing/home screen
└── (auth)/               # Auth route group (hidden from URL)
    ├── _layout.tsx       # Redirect logic for authenticated users
    ├── sign-in.tsx       # Email/password + OAuth sign in
    └── sign-up.tsx       # Registration with email verification
```

**Key Routing Patterns:**
- Root `_layout.tsx` wraps entire app with `<ClerkProvider>` for authentication
- Auth group `(auth)/_layout.tsx` redirects authenticated users to home (`/`)
- Home screen (`index.tsx`) shows different UI based on `isSignedIn` state

### Authentication System (Clerk)

**Setup:**
- Clerk provider initialized in `app/_layout.tsx` with token caching via `expo-secure-store`
- Environment variable required: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
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
- `useAuth()` from `@clerk/clerk-expo` - Access `signOut()` method

**Layout Redirect Pattern:**
```typescript
// app/(auth)/_layout.tsx
const { isSignedIn } = useAuth();

useEffect(() => {
  if (isSignedIn) {
    router.replace('/');  // Redirect authenticated users to home
  }
}, [isSignedIn]);
```

### Component Organization

```
components/
├── OAuthButton.tsx         # Reusable OAuth provider button
├── themed-text.tsx         # Theme-aware text wrapper
├── themed-view.tsx         # Theme-aware view wrapper
└── ui/                     # UI primitives (icon-symbol)

hooks/
├── use-color-scheme.ts     # Color scheme detection (native)
├── use-color-scheme.web.ts # Color scheme detection (web)
└── use-theme-color.ts      # Theme color utilities

constants/
└── theme.ts                # Design system colors
```

## Design System

### Color Palette

```typescript
// Primary colors
Primary: '#E8B4B8'              // Rose/mauve (main theme)
SignOut: '#FF6B6B'              // Coral red (sign-out button)
Dark: '#1a1a1a'                 // Dark backgrounds
Light: '#ffffff'                // Light backgrounds

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
- Welcome message OR "Glow Guide" CTA button (bottom center)
- Sign-out button below welcome message (bright coral color)
- Tap screen to toggle navigation bar visibility

**Auth Screens:**
- Dark background (#1a1a1a)
- Semi-transparent input fields with pink borders
- Email verification flow for standard sign-up
- OAuth buttons with provider icons (Google, GitHub, LinkedIn)
- Modal for collecting username from OAuth users

## Environment Setup

### Required Environment Variables

```bash
# .env file (required)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Optional (for future backend)
EXPO_PUBLIC_API_URL=
```

### OAuth Configuration

OAuth redirect URLs must use the custom scheme:
```typescript
redirectUrl: Linking.createURL('/(auth)/sign-up', { scheme: 'skinveda' })
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo-router` | File-based routing |
| `@clerk/clerk-expo` | Authentication |
| `expo-secure-store` | Secure token caching |
| `expo-av` | Video/audio playback |
| `expo-web-browser` | OAuth web flow |
| `@expo/vector-icons` | Icon library (MaterialCommunityIcons, FontAwesome5) |
| `react-native-gesture-handler` | Gesture detection |
| `react-native-reanimated` | Animations |

## Critical Implementation Notes

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

## File Structure

```
skinveda/
├── app/                      # Expo Router pages
│   ├── _layout.tsx          # ClerkProvider wrapper
│   ├── index.tsx            # Landing page
│   ├── (auth)/              # Authentication routes
│   │   ├── _layout.tsx      # Auth guard with redirect
│   │   ├── sign-in.tsx      # Sign in page
│   │   └── sign-up.tsx      # Sign up with OAuth modal
│   └── (tabs)/              # Future: Tab navigation (if needed)
├── components/              # Reusable components
├── constants/               # Theme and config
├── hooks/                   # Custom React hooks
├── public/                  # Static assets
│   ├── images/             # Logo, icons, splash
│   └── video/              # Landing video
├── .env                     # Environment variables
├── .env.example            # Environment template
├── app.json                # Expo configuration
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript config
```

## TypeScript Configuration

- **Strict mode enabled** - Full type safety enforced
- **Path alias**: `@/*` maps to root directory
- **Base config**: Extends `expo/tsconfig.base`

## Platform-Specific Notes

### Android
- Edge-to-edge rendering enabled
- Adaptive icons configured
- Predictive back gesture disabled
- Navigation bar hidden on landing page

### iOS
- Supports tablet layout
- Standard status bar behavior

### Web
- Static output build
- Color scheme detection via `use-color-scheme.web.ts`

## Common Patterns

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/profile.tsx`)
2. Export default component
3. File name becomes route (e.g., `/profile`)
4. Use `(groups)` for layout-specific routes

### Adding Authentication Guard

```typescript
// In layout file
const { isSignedIn } = useAuth();

if (!isSignedIn) {
  return <Redirect href="/sign-in" />;
}
```

### Accessing User Data

```typescript
const { user, isSignedIn, isLoaded } = useUser();

if (!isLoaded) return <LoadingScreen />;
if (!isSignedIn) return <SignInPrompt />;

// Access user.username, user.firstName, user.emailAddress, etc.
```

### Theme-Aware Components

```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

const backgroundColor = useThemeColor({}, 'background');
```

## Testing & Quality

- **Linting**: ESLint with `eslint-config-expo`
- **Type checking**: TypeScript strict mode
- **No test framework configured yet** - To be added

## Future Development Notes

- API integration ready (placeholder: `EXPO_PUBLIC_API_URL`)
- Backend endpoints to be implemented
- Consider adding analytics/error tracking
- Placeholder for face scan feature (core value proposition)
