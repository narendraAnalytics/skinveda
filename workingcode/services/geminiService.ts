
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult } from "../types";

export class SkinAnalysisService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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

  async getTTS(text: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak naturally: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  }
}
