Step 1: Clean existing installation

# For PowerShell

  Remove-Item -Recurse -Force node_modules, package-lock.json

# OR if using Git Bash/Command Prompt

  rmdir /s /q node_modules
  del package-lock.json

  Step 2: Clean npm cache

  npm cache clean --force

  Step 3: Reinstall with correct React version

  npm install --legacy-peer-deps

  Step 4: Verify the fix worked

  npm ls react react-dom

  You should see:

- react@18.3.1 (no "invalid" warnings)
- react-dom@18.3.1

  ---
  That's it! After these commands:

- TypeScript errors will stay resolved
- APK builds will work without the React version error
- Your app code works exactly the same as before

  Let me know once you've run these commands and I'll help verify everything is working correctly!

----------------------------------------------------------------

# Skinveda Documentation

**Your Personal Skincare Companion**
*From face scan to skin wisdom*

Skinveda is a modern React Native mobile application built with Expo, designed to provide personalized skincare guidance through a premium, AI-driven experience.

---

## 🛠 Tech Stack

- **Core**: React Native, Expo (SDK 54), TypeScript
- **Routing**: Expo Router (File-based routing)
- **Authentication**: [Clerk](https://clerk.com/) (Custom UI/Flows)
- **Styling**: React Native StyleSheet, Themed components
- **Media**: Expo-AV (Video/Audio)
- **AI**: [Google Gemini](https://ai.google.dev/) (Skin Analysis, TTS, Live Voice)
- **Storage**: Expo Secure Store (Token management)

---

## 📂 Folder Structure

```text
skinveda/
├── app/                  # Expo Router Pages
│   ├── _layout.tsx       # Root layout, ClerkProvider, Stack definition
│   ├── index.tsx         # Landing page with video background
│   ├── (auth)/           # Authentication route group
│   │   ├── _layout.tsx   # Auth guard (redirects if signed in)
│   │   ├── sign-in.tsx   # Custom Sign-in flow
│   │   └── sign-up.tsx   # Custom Sign-up flow with OAuth modal
│   ├── (wizard)/         # 7-Step Skin Analysis Wizard
│   │   ├── _layout.tsx   # Wizard layout with WizardProvider
│   │   ├── welcome.tsx   # Step 1: Introduction
│   │   ├── profile-name.tsx # Step 2: Name
│   │   ├── profile-bio.tsx  # Step 3: Age/Gender
│   │   ├── skin-details.tsx # Step 4: Skin Type
│   │   ├── concerns-health.tsx # Step 5: Health Data
│   │   ├── photo-capture.tsx # Step 6: Camera Capture
│   │   └── dashboard.tsx    # Step 7: Results & Recommendations
│   └── profile.tsx       # User profile screen
├── backend/              # Node.js / Express Backend
│   ├── src/
│   │   ├── controllers/  # API Logic (Analysis, TTS)
│   │   ├── services/     # AI Engine (Gemini)
│   │   ├── routes/       # API Endpoints
│   │   └── server.ts     # Main Express entry point
├── components/           # Reusable UI Components
│   ├── ui/               # Primary UI primitives
│   ├── wizard/           # Wizard-specific components
│   ├── OAuthButton.tsx   # Generic button for social auth
│   └── themed-text.tsx   # Theme-aware typography
├── contexts/             # State Management (WizardContext)
├── services/             # Frontend API client
├── constants/            # Design system, Colors, Layout constants
├── hooks/                # Custom React hooks (Theme, Color scheme)
├── assets/               # Local images and fonts
├── public/               # Static assets
└── .env                  # Environment variables
```

---

## 🔐 Authentication (Clerk Implementation)

The app uses a fully customized Clerk implementation for a seamless, branded user experience.

### ⚙️ Initialization

The `ClerkProvider` is configured in `app/_layout.tsx` with a custom `tokenCache` using `expo-secure-store` for persistent user sessions.

### 🛡 Auth Guard

Navigation is protected in `app/(auth)/_layout.tsx`. Signed-in users are automatically redirected away from auth screens to the root home page (`/`).

### 📝 Custom Flows

#### **Sign-In (`app/(auth)/sign-in.tsx`)**

- Supports both email/password and social logins.
- Uses `useSignIn` hook for the logic and `useOAuth` for social providers.

#### **Sign-Up & OAuth (`app/(auth)/sign-up.tsx`)**

Skinveda implements a unique flow for social logins to ensure complete user profiles:

1. **Standard Sign-Up**: Traditional email/password with verification code.
2. **OAuth Strategy**: Supports **Google**, **GitHub**, and **LinkedIn (OIDC)**.
3. **The Username Modal**:
   - Clerk's standard OAuth flow often lacks a required username.
   - If `oauthFlow.startOAuthFlow` returns a `signUp` object without completion, the app triggers a **Custom Modal**.
   - This modal forces the user to choose a username before calling `signUp.update()` to finalize the account.

---

## 🚀 Development

### Essential Commands

- `npm start`: Launch the Expo development server.
- `npm run android`: Run on an Android emulator.
- `npm run ios`: Run on an iOS simulator.

### Environment Setup

Create a `.env` file in the root with:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 💎 Design System

- **Primary Color**: `#E8B4B8` (Soft Mauve/Rose)
- **Background**: `#1a1a1a` (Modern Dark Theme)
- **Interactive**: Glassmorphism effects with semi-transparent backgrounds and themed borders.

---

## 🧩 Shared Components

The following reusable components are located in the `components/` directory and ensure consistency across the application.

### 🔘 `OAuthButton`

A specialized button for social authentication.

- **Props**: `provider` ('google', 'github', 'linkedin'), `onPress`, `disabled`, `loading`.
- **Features**: Automatic icon selection and thematic coloring based on the provider.

### 🎨 Themed Components (`ThemedText` & `ThemedView`)

Used for maintaining a consistent dark/light theme experience.

- These components use the `useThemeColor` hook to pick colors from `constants/theme.ts`.
- **ThemedText Types**: `title`, `subtitle`, `defaultSemiBold`, `link`, and `default`.

### 📄 `ProfileInfoRow`

Used in the user profile/settings screens to display user data in a clean, consistent row.

- **Props**: `icon` (MaterialCommunityIcons), `label`, `value`.

### 🔗 `ExternalLink`

A utility component for cross-platform linking.

- **Features**: Opens links in an in-app browser on native devices (Android/iOS) while maintaining standard link behavior on Web.

---

## 📦 AI Dependencies

To enable the AI features from the `workingcode` module, install the following:

```bash
npm install @google/genai
```

---

## 🤖 AI & Multimodal Integration

Skinveda integrates advanced AI capabilities from the `workingcode` directory to provide a "Live Doctor" experience.

### 🧠 Core AI Services

#### **Skin Analysis & Transcription (`services/geminiService.ts`)**

- **Engine**: `gemini-3-flash-preview`
- **Capabilities**:
  - **Multimodal Analysis**: Processes user profiles and Base64 face images to provide clinical skin metrics.
  - **Holistic Prescription**: Generates personalized advice for diet (juices/foods), exercise (face yoga/body), stress management, and Vedic meditation.
  - **Transcription**: Provides accurate audio-to-text conversion for hands-free profile completion (Name, Age, etc.).
- **TTS Engine**: `gemini-2.5-flash-preview-tts` (Voice: `Kore`)

#### **Voice Assistance Implementation**

- **Component**: `VoiceInputButton.tsx`
- **MIME Type**: `audio/m4a` (Native Expo-AV recording format)
- **Features**: Automatic numeric extraction for the age field (converts "twenty-five" to "25").

### 🛠 Troubleshooting: Voice Fixes (2026 Update)

During the migration to `expo-audio`, several critical blockers were resolved to ensure reliable Speech-to-Text:

1. **Recorder Initialization**: Added `await audioRecorder.prepareToRecordAsync()` before calling `record()`. In `expo-audio`, the recorder must be explicitly prepared to allocate resources and set the output file URI.
2. **FileSystem Compatibility**: In newer Expo environments, the `readAsStringAsync` method is deprecated in the main entry point. Fixed by using the legacy import: `import * as FileSystem from 'expo-file-system/legacy'`.
3. **Audio Mode Configuration**: Used the top-level `setAudioModeAsync` from `expo-audio` to correctly configure recording permissions and background playback:
   ```typescript
   await setAudioModeAsync({
     playsInSilentMode: true,
     allowsRecording: true,
   });
   ```
4. **State Management**: Implemented a local `isRecording` state as the source of truth for the UI (pulsing indicator, "Listening" text), as hook-based status sync can occasionally lag behind the native recorder state.
5. **MIME Type Alignment**: Hardcoded `audio/m4a` to match Expo's native recording format, ensuring the Gemini backend handles the encoding correctly without bitstream errors.

### 📋 Integration Flow

1. **Data Synchronization**:
    - The app attempts to sync from **Apple HealthKit** or **Google Fit** (Sleep, Steps, BPM).
    - **Manual Override**: Users can manually adjust these values if wearables are unavailable.
2. **Photo Capture**: Integrated UI with guidance for high-quality facial capture.
3. **Deep Reasoning**: AI analyzes the combined data (Wearables + Image + Profile).
4. **Dashboard**: Displays clinical scores (Acne, Hydration, Lines, etc.) and the holistic routine.

---

Made the language field optional in the UserProfile type definition to prevent errors without requiring database changes.

Multi-language Support Implementation
I have successfully implemented multi-language support in the Skinveda application. Users can now select their preferred language during the welcome step, and the entire app experience—including UI text, voice input, and AI analysis results—will be presented in that language.

Key Changes

1. Language Selection UI
Integrated a language selection grid on the
welcome.tsx
 screen.
Supported languages: English, Hindi, Telugu, Marathi, and Kannada.
The selected language is persisted in the
UserProfile
 within the
WizardContext
.
2. Localization Infrastructure
Created
translations.ts
 containing all app strings for supported languages.
Added a
t()
 (translation) helper function to
WizardContext.tsx
.
Updated the
UserProfile
 interface to include the language field.
3. Wizard Screen Updates
Updated all wizard steps to use the translation helper:

welcome.tsx
profile-name.tsx
profile-bio.tsx
skin-details.tsx
concerns-health.tsx
photo-capture.tsx
4. Language-Aware AI Integration
Skin Analysis: The backend
geminiService.ts
 now includes the user's language in the prompt, forcing Gemini to return the analysis summary and recommendations in that language.
Text-to-Speech (TTS): The dashboard now automatically reads out the analysis summary in the selected language using the updated
getTTS
 method.
Audio Transcription: The
VoiceInputButton.tsx
 now passes the user's language to the backend, enabling accurate transcription of non-English speech.
