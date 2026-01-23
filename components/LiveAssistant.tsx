
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // 拖拽相关状态
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('nebula_assistant_pos');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 80, y: window.innerHeight - 180 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 基础编解码函数
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  // 拖拽逻辑实现
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isActive) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragOffset.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    // 限制在屏幕范围内
    const newX = Math.max(20, Math.min(window.innerWidth - 80, clientX - dragOffset.current.x));
    const newY = Math.max(20, Math.min(window.innerHeight - 80, clientY - dragOffset.current.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // 边缘吸附逻辑
    const threshold = window.innerWidth / 2;
    const finalX = position.x > threshold ? window.innerWidth - 80 : 20;
    const finalPos = { x: finalX, y: position.y };
    
    setPosition(finalPos);
    localStorage.setItem('nebula_assistant_pos', JSON.stringify(finalPos));
  }, [isDragging, position]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      let values = 0;
      for (let i = 0; i < dataArray.length; i++) values += dataArray[i];
      setAudioLevel(values / dataArray.length);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const startSession = async () => {
    if (isDragging) return; // 防止拖拽误触
    setIsConnecting(true);
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      alert("星核凭证缺失。");
      setIsConnecting(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);
    }

    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          const source = inputAudioContext.createMediaStreamSource(stream);
          analyserRef.current = inputAudioContext.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);
          updateAudioLevel();

          const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) setTranscript(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).trim());
          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && audioContextRef.current && outputNodeRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNodeRef.current);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => cleanup(),
        onerror: () => cleanup(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: '你是一个名为“星核助理”的私人助理。语气专业、干练且具有科幻色彩。必须使用中文回答。',
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const cleanup = () => {
    setIsActive(false);
    setTranscript('');
    setAudioLevel(0);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    cleanup();
  };

  return (
    <>
      <div 
        ref={buttonRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className={`fixed z-[100] touch-none transition-transform duration-300 ease-out
          ${isActive ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
          ${isDragging ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}
        `}
        style={{ 
          left: position.x, 
          top: position.y,
          transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
        }}
      >
        <button 
          onClick={isActive ? stopSession : startSession}
          className={`relative w-15 h-15 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] active:scale-90 transition-all overflow-hidden border border-white/10 glass-panel
            ${isConnecting ? 'bg-slate-800' : 'bg-primary/90'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
          {!isConnecting && (
            <div className="absolute inset-0 bg-primary animate-pulse opacity-20"></div>
          )}
          <span className={`material-symbols-outlined text-[28px] text-white font-bold relative z-10 ${isConnecting ? 'animate-spin' : ''}`}>
            {isConnecting ? 'sync' : 'mic'}
          </span>
        </button>
      </div>

      {isActive && (
        <div className="fixed inset-0 z-[110] bg-background-base/95 backdrop-blur-3xl animate-in fade-in flex flex-col items-center justify-center p-8">
           <div className="w-48 h-48 mb-12 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 transition-transform duration-100" style={{ transform: `scale(${1 + audioLevel / 100})` }}></div>
              <div className="absolute inset-4 rounded-full bg-primary/20 transition-transform duration-150" style={{ transform: `scale(${1 + audioLevel / 150})` }}></div>
              <div className="absolute inset-10 bg-primary rounded-full shadow-[0_0_40px_rgba(0,217,230,0.6)] flex items-center justify-center text-white">
                 <span className="material-symbols-outlined text-5xl animate-pulse">graphic_eq</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
              <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">星核助理 正在聆听</p>
           </div>

           <div className="glass-panel p-8 w-full max-w-md text-center border-primary/20 bg-slate-900/50 rounded-[32px] shadow-2xl">
              <p className="text-slate-200 font-bold text-lg leading-relaxed min-h-[1.8em]">
                {transcript || "请下达您的指令..."}
              </p>
           </div>
           
           <button 
             onClick={stopSession} 
             className="mt-16 px-8 py-3 glass-panel rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-primary hover:border-primary/40 transition-all active:scale-95"
           >
              终止 助理进程
           </button>
        </div>
      )}
    </>
  );
};

export default LiveAssistant;
