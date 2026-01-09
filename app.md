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
│   ├── _layout.tsx       # Root layout, ClerkProvider, Splash management
│   ├── index.tsx         # Landing page with video background
│   ├── (auth)/           # Authentication route group
│   │   ├── _layout.tsx   # Auth guard (redirects if signed in)
│   │   ├── sign-in.tsx   # Custom Sign-in flow
│   │   └── sign-up.tsx   # Custom Sign-up flow with OAuth modal
│   └── profile.tsx       # User profile screen
├── components/           # Reusable UI Components
│   ├── ui/               # Primary UI primitives
│   ├── OAuthButton.tsx   # Generic button for social auth
│   └── themed-text.tsx   # Theme-aware typography
├── constants/            # Design system, Colors, Layout constants
├── hooks/                # Custom React hooks (Theme, Color scheme)
├── assets/               # Local images and fonts
├── public/               # Static assets
│   └── video/            # Landing video background
└── .env                  # Environment variables (Clerk keys)
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

#### **Skin Analysis Service (`services/geminiService.ts`)**
- **Engine**: `gemini-3-flash-preview`
- **Capabilities**:
  - **Multimodal Analysis**: Processes user profiles and Base64 face images to provide clinical skin metrics.
  - **Holistic Prescription**: Generates personalized advice for diet (juices/foods), exercise (face yoga/body), stress management, and Vedic meditation.
  - **Grounding**: Uses `googleSearch` to ensure recommendations are accurate and up-to-date.
  - **TTS**: Utilizes `gemini-2.5-flash-preview-tts` for natural guidance during step transitions.

#### **Voice Assistant (`components/VoiceAssistant.tsx`)**
- **Engine**: `gemini-2.5-flash-native-audio-preview-12-2025`
- **Role**: A persistent, low-latency floating voice interface for hands-free onboarding and guidance.

### 📋 Integration Flow

1.  **Data Synchronization**: 
    - The app attempts to sync from **Apple HealthKit** or **Google Fit** (Sleep, Steps, BPM).
    - **Manual Override**: Users can manually adjust these values if wearables are unavailable.
2.  **Photo Capture**: Integrated UI with guidance for high-quality facial capture.
3.  **Deep Reasoning**: AI analyzes the combined data (Wearables + Image + Profile).
4.  **Dashboard**: Displays clinical scores (Acne, Hydration, Lines, etc.) and the holistic routine.

---
