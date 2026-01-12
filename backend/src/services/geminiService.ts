
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';
import { AnalysisResult, UserProfile } from "../types";

export class SkinAnalysisService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  async analyzeSkin(profile: UserProfile, imageBase64: string): Promise<AnalysisResult> {
    const prompt = `
      Act as an expert Holistic Dermatologist and Ayurvedic Skin Specialist with 30 years of experience.
      Analyze this user's skin based on their photo, profile information, and wearable health data.

      User Profile & Health Data: ${JSON.stringify(profile)}

      CRITICAL INSTRUCTION:
      If healthData shows low sleep (<7 hours), prioritize eye care and anti-inflammatory juices.
      If heart rate or stress conditions are high, focus on Vata-balancing meditation.
      If steps are low, suggest more circulation-boosting body exercises.

      Your goal is to provide a "Live Doctor" experience. Provide a comprehensive skin analysis and a personalized holistic prescription.
      
      CRITICAL: All generated text (summary, recommendations, exercises, etc.) MUST be in the following language: ${profile.language || 'en'}.
      Even if the input data is in English, the output JSON values MUST be in ${profile.language || 'en'}.

      Include specific sections for:
      1. Clinical skin metrics (hydration, acne, etc.).
      2. Diet: Specific rejuvenating juices, foods to prioritize (Eat), and trigger foods to bypass (Avoid).
      3. Physical Activity: Targeted face exercises for skin elasticity/drainage and full-body exercises for circulation.
      4. Stress Management: Practical techniques to lower cortisol levels which impact skin.
      5. Traditional Yoga & Meditation.

      Return the data strictly in JSON format following the provided schema.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            eyeAge: { type: Type.NUMBER },
            skinAge: { type: Type.NUMBER },
            hydration: { type: Type.NUMBER },
            redness: { type: Type.NUMBER },
            pigmentation: { type: Type.NUMBER },
            lines: { type: Type.NUMBER },
            acne: { type: Type.NUMBER },
            translucency: { type: Type.NUMBER },
            uniformness: { type: Type.NUMBER },
            pores: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.OBJECT,
              properties: {
                yoga: { type: Type.ARRAY, items: { type: Type.STRING } },
                meditation: { type: Type.ARRAY, items: { type: Type.STRING } },
                naturalRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
                diet: {
                  type: Type.OBJECT,
                  properties: {
                    juices: { type: Type.ARRAY, items: { type: Type.STRING } },
                    eat: { type: Type.ARRAY, items: { type: Type.STRING } },
                    avoid: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["juices", "eat", "avoid"]
                },
                exercises: {
                  type: Type.OBJECT,
                  properties: {
                    face: { type: Type.ARRAY, items: { type: Type.STRING } },
                    body: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["face", "body"]
                },
                stressManagement: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["yoga", "meditation", "naturalRemedies", "diet", "exercises", "stressManagement"]
            }
          },
          required: [
            "overallScore", "eyeAge", "skinAge", "hydration", "redness",
            "pigmentation", "lines", "acne", "translucency", "uniformness",
            "pores", "summary", "recommendations"
          ]
        }
      }
    });

    return JSON.parse(response.text || '{}') as AnalysisResult;
  }

  async getTTS(text: string, language: string = 'en'): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak naturally in ${language}: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    if (!audioData) return '';

    return this.pcmToWav(audioData);
  }

  private pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
    const pcmBuffer = Buffer.from(pcmBase64, 'base64');
    const dataSize = pcmBuffer.length;
    const header = Buffer.alloc(44);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(1, 22); // Mono
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28); // Byte rate (sampleRate * bitsPerSample/8 * channels)
    header.writeUInt16LE(2, 32); // Block align (bitsPerSample/8 * channels)
    header.writeUInt16LE(16, 34); // Bits per sample
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return Buffer.concat([header, pcmBuffer]).toString('base64');
  }

  async transcribeAudio(audioBase64: string, mimeType: string = 'audio/wav', language: string = 'en'): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [
          { text: `Transcribe this audio clearly in ${language}. Format any spoken numbers as digits (e.g., "36" instead of "thirty six"). Return only the spoken text without any formatting or extra words.` },
          { inlineData: { mimeType, data: audioBase64 } }
        ]
      }]
    });

    return response.text?.trim() || '';
  }
}
