# SkinVeda: AI-Powered Holistic Skincare Assistant

SkinVeda is a cutting-edge mobile-first web application that merges ancient Vedic wisdom with modern artificial intelligence. It provides users with a personalized "Live Doctor" experience, analyzing skin health through multimodal AI and offering holistic prescriptions including diet, exercise, and stress management.

## 🌟 Key Features

- **Multimodal Skin Analysis**: Analyzes facial photos to provide metrics on hydration, acne, lines, pigmentation, and biological skin age.
- **Real-time Voice Assistant**: A persistent, low-latency voice interface powered by the Gemini Live API for hands-free onboarding.
- **Flexible Wearable Data Sync**: Connects to Apple HealthKit and Google Fit to fetch sleep, steps, and heart-rate data. 
- **Manual Data Override**: Users can manually adjust or enter health metrics (Steps, Sleep, BPM) if wearable data is unavailable or incorrect.
- **Holistic Prescription**: Personalized advice covering:
  - **Diet**: Specific juices, foods to eat, and foods to avoid.
  - **Exercise**: Targeted face yoga and full-body circulation moves.
  - **Mindfulness**: Stress management techniques and Vedic meditation.
- **Natural Remedies**: Custom Ayurvedic-inspired solutions for identified skin concerns.

## 🧠 AI Models & Architecture

SkinVeda utilizes the latest Google Gemini models to provide a sophisticated, human-like experience.

### 1. Skin Analysis Engine (`gemini-3-flash-preview`)
- **Role**: Primary reasoning engine for image and profile analysis.
- **Capability**: Processes multimodal input (User Profile JSON + Base64 Face Image).
- **Wearable Logic**: Dynamically adjusts recommendations (e.g., more hydration if sleep < 7h).
- **Tools**: Uses `googleSearch` grounding to ensure recommendations for natural remedies and dietary advice are backed by current health data.

### 2. Live Conversational API (`gemini-2.5-flash-native-audio-preview-12-2025`)
- **Role**: Powers the floating `VoiceAssistant`.
- **Capability**: Handles real-time, low-latency audio streaming (inbound and outbound).

### 3. Text-to-Speech (`gemini-2.5-flash-preview-tts`)
- **Role**: Provides narrative guidance during step transitions.

## 📋 Application Flow

1. **Welcome**: Introduction to the Vedic journey.
2. **Profile Onboarding**: Collection of basic info.
3. **Skin Profiling**: User selects skin type and sensitivity levels.
4. **Lifestyle & Optional Sync**: Sync wearable data OR enter manually (Steps, Sleep, BPM).
5. **Photo Capture**: Integrated camera UI with face guides.
6. **Deep Analysis**: AI processes data using multimodal reasoning.
7. **Prescription**: Interactive dashboard showing clinical scores and a detailed holistic routine.

## 🚀 Future Enhancements for Market Leadership

- **Longitudinal Progress Tracking**: AI-powered "Skin Journey" gallery.
- **Smart Ingredient Scanner**: Scan product labels for harmful chemicals.
- **AR-Guided Face Yoga**: Real-time overlays for perfect exercise form.
- **Tele-Ayurveda Integration**: Direct connection with certified practitioners.

## 🔐 Security & Privacy

- **On-Device Capture**: Image processing is handled via secure API endpoints.
- **No Persistence**: User data is processed in-session for immediate feedback.
- **API Security**: Secure environment-based API key management.