import { useState, useCallback, useRef } from 'react';

const WORKLET_PROCESSOR_CODE = `
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.silenceThreshold = 0.01;
    this.silenceDuration = 1500; // ms
    this.lastActiveTime = Date.now();
    this.isSilent = true;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0];
      
      // Calculate volume
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);

      if (rms > this.silenceThreshold) {
        this.lastActiveTime = Date.now();
        if (this.isSilent) {
          this.isSilent = false;
          this.port.postMessage({ type: 'speech_start' });
        }
      } else if (!this.isSilent && (Date.now() - this.lastActiveTime > this.silenceDuration)) {
        this.isSilent = true;
        this.port.postMessage({ type: 'speech_end' });
      }

      // Convert Float32 to Int16
      const int16Data = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage({ type: 'audio_data', buffer: int16Data.buffer }, [int16Data.buffer]);
    }
    return true;
  }
}
registerProcessor('audio-processor', AudioProcessor);
`;

export function useAudioStream() {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const playoutContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startRecording = useCallback(async (onAudioChunk: (buffer: ArrayBuffer) => void, onSilence?: () => void) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000
      });
      audioContextRef.current = audioContext;

      const blob = new Blob([WORKLET_PROCESSOR_CODE], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await audioContext.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = new AudioWorkletNode(audioContext, 'audio-processor');
      processorRef.current = processor;

      processor.port.onmessage = (event) => {
        const { type, buffer } = event.data;
        
        if (type === 'audio_data' && buffer) {
          onAudioChunk(buffer);
        } else if (type === 'speech_end') {
          onSilence?.();
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    processorRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    setIsRecording(false);
  }, []);

  const playAudioChunk = useCallback((base64Data: string) => {
    if (!playoutContextRef.current) {
      playoutContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
      });
      nextStartTimeRef.current = playoutContextRef.current.currentTime;
    }

    const context = playoutContextRef.current;
    
    // Decode base64
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert Int16 to Float32
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }

    const audioBuffer = context.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);

    const startTime = Math.max(context.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
  }, []);

  const stopPlayout = useCallback(() => {
      playoutContextRef.current?.close();
      playoutContextRef.current = null;
      nextStartTimeRef.current = 0;
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    playAudioChunk,
    stopPlayout
  };
}
