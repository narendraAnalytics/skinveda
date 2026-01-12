
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import React, { useRef, useState } from 'react';

interface VoiceAssistantProps {
  onTranscript: (text: string) => void;
  currentQuestion: string;
  language: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onTranscript, currentQuestion, language }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = audioContextRef.current.createGain();
    outputNode.connect(audioContextRef.current.destination);

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            onTranscript(message.serverContent.outputTranscription.text);
          }

          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData && audioContextRef.current) {
            const ctx = audioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audioData), ctx);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
        },
        onclose: () => {
          setIsActive(false);
          setIsConnecting(false);
        },
        onerror: (e) => console.error('Live API Error:', e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: `You are SkinVeda's friendly voice assistant. Help the user complete their skin profile. 
        Preferred language is ${language}. Speak and respond only in ${language}.
        Current step: ${currentQuestion}. Keep it concise.`
      }
    });

    sessionRef.current = await sessionPromise;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputCtx.createMediaStreamSource(stream);
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;

      let binary = '';
      const bytes = new Uint8Array(int16.buffer);
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);

      sessionRef.current?.sendRealtimeInput({
        media: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processor);
    processor.connect(inputCtx.destination);
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isActive ? 'bg-red-500 scale-110 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
      >
        {isConnecting ? (
          <i className="fas fa-circle-notch fa-spin text-white text-xl"></i>
        ) : (
          <i className={`fas ${isActive ? 'fa-stop' : 'fa-microphone'} text-white text-xl`}></i>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
