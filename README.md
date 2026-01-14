# Skinveda 🌸
### **AI-Powered Holistic Skincare Companion**

Skinveda is a premium, multi-modal React Native application designed to provide personalized skincare wisdom. By combining advanced AI analysis with Ayurvedic principles, it offers users a "Live Doctor" experience directly on their mobile devices.

---

## 🚀 Key Features

- **AI Face Analysis**: Guided facial capture and deep analysis using **Google Gemini 1.5/2.0**.
- **Multi-language Support**: Fully localized experience in **Hindi, Telugu, Kannada, Marathi, and English**.
- **Voice Interaction**: Hands-free data entry and automatic transcription via **expo-audio**.
- **Holistic Recommendations**: Personalized routines including diet (juices/foods), face yoga, body exercises, and Vedic meditation.
- **Premium UI/UX**: Immersive video backgrounds, smooth haptic feedback, and a modern dark aesthetic.
- **Secure Profiles**: User-owned data silos with history tracking.

---

## 🛠 Tech Stack

### **Mobile (Frontend)**
- **Framework**: [Expo SDK 54](https://expo.dev/) (React Native)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (Type-safe file-based routing)
- **Authentication**: [Clerk](https://clerk.com/) (Social OAuth with Google/GitHub/LinkedIn + User Session management)
- **Media**: 
  - `expo-video`: High-performance background video playback.
  - `expo-audio`: Native audio recording and playback infrastructure.
- **Feedback**: `expo-haptics`: Physical vibration response for premium interactions.
- **Storage**: `expo-secure-store`: Biometric-compatible persistent storage for Auth tokens.

### **Server (Backend)**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (Type-safe SQL query builder)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (Multi-modal reasoning, Transcriptions, and TTS)

---

## 🏗 Architecture & Core Modules

### 🔐 Authentication (Clerk)
Skinveda uses a specialized Clerk implementation that ensures every social login results in a complete profile. If a username is missing from a social provider, a custom-built modal handles on-the-fly user creation before finalizing the session.

### 🗄 Database (Neon & Drizzle)
The backend leverages Neon's serverless architecture to handle a scalable PostgreSQL database. Drizzle ORM ensures that our data models (Analyses, User Profiles, Recommendations) are strictly typed across the entire stack.

### 🎙 Audio & Voice (expo-audio)
Recently migrated to the high-performance `expo-audio` library. The system handles:
- **Permissions**: Granular microphone access management.
- **Recording**: Optimized `audio/m4a` format capture.
- **Processing**: Base64 stream conversion and legacy file-system compatibility for robust cross-version reading.
---- https://docs.expo.dev/versions/latest/sdk/audio/

### 📺 Immersive Media (expo-video)
The landing page features a cinematic looping video backend rendered using the new `VideoView` API, providing a high-FPS, battery-efficient introduction to the app.

------ https://docs.expo.dev/versions/latest/sdk/video/

---

## 📂 Project Structure

```text
skinveda/
├── app/                      # Expo Router Pages
│   ├── (auth)/               # Authentication screens (Sign-in/up)
│   ├── (wizard)/             # 7-Step Analysis Wizard flow
│   ├── analysis/             # Individual analysis view
│   ├── history.tsx           # Past analysis list
│   ├── index.tsx             # Landing page with video
│   ├── profile.tsx           # User settings & profile
│   └── _layout.tsx           # Global Providers & Navigation setup
├── backend/                  # Node.js + Express Backend
│   ├── drizzle/              # Database migrations
│   ├── src/
│   │   ├── controllers/      # Route handlers (AI, Analysis, TTS)
│   │   ├── db/               # Drizzle schema & connection
│   │   ├── routes/           # API Endpoint definitions
│   │   ├── services/         # Business logic (Gemini AI, Database)
│   │   └── server.ts         # Express app entry point
│   └── drizzle.config.ts     # ORM configuration
├── components/               # UI Component Library
│   ├── ui/                   # Reusable base primitives
│   ├── wizard/               # Wizard-specific UI elements (Camera, Metrics)
│   └── OAuthButton.tsx       # Clerk social auth component
├── contexts/                 # React Contexts (WizardState, Auth)
├── services/                 # Frontend API client & utilities
├── constants/                # Design tokens & translations
├── hooks/                    # Custom React hooks
└── types/                    # Shared TypeScript interfaces
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo GO (for mobile testing)
- Backend environment variables (Gemini API Key, Neon Database URL, Clerk Keys)

### Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### Development
```bash
# Start backend
npm run dev

# Start frontend (Expo)
npx expo start
```

---

## 💎 Future Project Foundation
This repository serves as a boilerplate for **Premium AI Apps** requiring:
1. **SSO Integration**: Pre-configured Clerk + Expo flow.
2. **Serverless DB**: Instant Neon + Drizzle setup.
3. **Multi-modal AI**: Real-world implementation of Gemini (Image + Voice + Text).
4. **Localization**: Robust translation helper architecture.

---
*Created with ❤️ for the Skinveda Team.*
