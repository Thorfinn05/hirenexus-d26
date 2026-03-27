"use server"

import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

function writeWavHeader(pcmBuffer: Buffer, sampleRate: number) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); 
  header.writeUInt16LE(1, 20); 
  header.writeUInt16LE(1, 22); 
  header.writeUInt32LE(sampleRate, 24); 
  header.writeUInt32LE(sampleRate * 2, 28); 
  header.writeUInt16LE(2, 32); 
  header.writeUInt16LE(16, 34); 
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);
  return Buffer.concat([header, pcmBuffer]);
}

export async function transcribeAudio(base64Audio: string) {
  try {
    // Convert base64 to Buffer and add WAV header
    const rawBuffer = Buffer.from(base64Audio, 'base64');
    const wavBuffer = writeWavHeader(rawBuffer, 16000);
    
    const transcription = await groq.audio.transcriptions.create({
      file: await (async () => {
          const blob = new Blob([wavBuffer], { type: 'audio/wav' });
          return new File([blob], 'audio.wav', { type: 'audio/wav' });
      })(),
      model: "whisper-large-v3-turbo",
      language: "en",
    });

    return { text: transcription.text };
  } catch (err) {
    console.error("Transcription error:", err);
    throw new Error("Failed to transcribe audio");
  }
}

export async function generateInterviewResponse(transcript: string, systemInstruction: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: transcript }] }],
      systemInstruction: systemInstruction,
    });

    return { text: result.response.text() };
  } catch (err) {
    console.error("LLM error:", err);
    throw new Error("Failed to generate AI response");
  }
}
