import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CakeItem } from '../types';
import { dreamSynth } from '../utils/audio';
import { Sparkles, CheckCircle2, ChevronRight, Mic, MicOff, AlertCircle } from 'lucide-react';

interface DreamLibraryProps {
  cakes: CakeItem[];
  onNext: () => void;
}

export const DreamLibrary: React.FC<DreamLibraryProps> = ({ cakes, onNext }) => {
  const [activeCake, setActiveCake] = useState<CakeItem | null>(null);
  const [litCakes, setLitCakes] = useState<string[]>([]); // Cakes that are currently lit
  const [blownCakes, setBlownCakes] = useState<string[]>([]); // Cakes that are completed/blown out
  const [micError, setMicError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micVolume, setMicVolume] = useState(0); // For progress bar/visualizer
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Trigger custom confetti inside the cake details modal
  const triggerConfetti = () => {
    const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const newConfetti = new Array(80).fill(0).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100, // percentage width
      y: Math.random() * 100, // percentage height
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4
    }));
    setConfetti(newConfetti);
    // Auto-clean after 4 seconds
    setTimeout(() => {
      setConfetti([]);
    }, 4000);
  };

  const handleCakeClick = (cake: CakeItem) => {
    dreamSynth.triggerTwinkleFeedback();
    setActiveCake(cake);
    
    // Light the cake's candles immediately when clicked
    if (!blownCakes.includes(cake.id) && !litCakes.includes(cake.id)) {
      setLitCakes((prev) => [...prev, cake.id]);
    }
  };

  // Blow out candles action
  const handleBlowOut = (cakeId: string) => {
    if (blownCakes.includes(cakeId)) return;
    
    // Play celebratory sound arpeggio
    dreamSynth.playBirthdayArpeggio();
    
    // Update state
    setLitCakes((prev) => prev.filter((id) => id !== cakeId));
    setBlownCakes((prev) => [...prev, cakeId]);
    
    // Burst confetti!
    triggerConfetti();
  };

  // Set up microphone blow detection
  const startMicDetection = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      microphoneRef.current = source;
      source.connect(analyser);

      setIsListening(true);
      detectBlow();
    } catch (err: any) {
      console.warn("Microphone access denied or unsupported:", err);
      setMicError("Mic disabled. Please use the button fallback to blow candles!");
    }
  };

  const stopMicDetection = () => {
    setIsListening(false);
    setMicVolume(0);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  // Check volume levels to detect high frequency or amplitude "blowing"
  const detectBlow = () => {
    if (!analyserRef.current || !activeCake) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average amplitude/volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedVolume = Math.min(1, average / 128);
    setMicVolume(normalizedVolume);

    // If volume crosses blow threshold (e.g., 0.35) and cake is lit
    if (normalizedVolume > 0.35 && litCakes.includes(activeCake.id)) {
      handleBlowOut(activeCake.id);
    } else {
      animationFrameRef.current = requestAnimationFrame(detectBlow);
    }
  };

  // Toggle mic listening when modal opens/closes
  useEffect(() => {
    if (activeCake && !blownCakes.includes(activeCake.id)) {
      startMicDetection();
    } else {
      stopMicDetection();
    }
    return () => stopMicDetection();
  }, [activeCake, litCakes]);

  const allCakesBlown = blownCakes.length >= cakes.length;

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between items-center py-12 px-4 z-10 select-none text-orange-50">
      
      {/* Header */}
      <div className="text-center max-w-lg mt-8 z-20">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="font-sans text-xs tracking-[0.2em] text-pink-300 uppercase mb-2"
        >
          Scene 4 — The Birthday Cakes
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-3xl md:text-4xl text-orange-100 font-light tracking-wide mb-3"
        >
          🎂 Blow Out Your Wishes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.4 }}
          className="font-sans text-xs md:text-sm text-pink-200/60 italic leading-relaxed"
        >
          Three beautiful handcrafted cakes await you. Tap each cake, make a silent wish, and blow into your mic (or tap to blow) to unlock Fadzlan&apos;s hidden messages.
        </motion.p>
      </div>

      {/* Cakes Shelf Area */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-10 my-10 z-10">
        {cakes.map((cake, index) => {
          const isBlown = blownCakes.includes(cake.id);
          const isLit = litCakes.includes(cake.id);
          
          return (
            <motion.div
              key={cake.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="flex flex-col items-center cursor-pointer group w-64"
              onClick={() => handleCakeClick(cake)}
            >
              {/* Float Effect Wrapper */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 flex flex-col items-center p-6 bg-slate-900/30 hover:bg-slate-900/50 rounded-3xl border border-white/5 hover:border-pink-500/20 transition-colors duration-300 w-full"
              >
                {/* 3D-styled Interactive Cake Drawing */}
                <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                  
                  {/* Candle Stick & Flame */}
                  <div className="absolute top-2 flex flex-col items-center z-20">
                    {/* Flame */}
                    {isLit && !isBlown && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1, 1.1, 1],
                          y: [0, -2, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-3.5 h-6 bg-gradient-to-t from-yellow-500 via-orange-400 to-amber-200 rounded-full blur-[1px] shadow-[0_0_12px_#f59e0b]"
                      />
                    )}
                    {/* Candle stick */}
                    <div className="w-2 h-7 bg-indigo-200 border-b border-indigo-400 rounded-sm" />
                  </div>

                  {/* Cake Plate Base */}
                  <div className="absolute bottom-2 w-28 h-4 bg-slate-800 rounded-full shadow-lg border border-white/10" />

                  {/* Cake Cylinder Layer */}
                  <div className={`absolute bottom-5 w-24 h-16 bg-gradient-to-b ${cake.color} rounded-t-lg shadow-md flex items-center justify-center overflow-hidden border-t border-white/25`}>
                    
                    {/* Whipped Cream Drips */}
                    <div className="absolute top-0 left-0 right-0 h-4 rounded-b-md opacity-90" style={{ backgroundColor: cake.creamColor }} />
                    
                    {/* Tiny sprinkles */}
                    <div className="absolute inset-0 flex justify-around items-center flex-wrap p-2 opacity-60">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    </div>
                  </div>

                  {/* Rotating visual rings */}
                  <motion.div
                    animate={{ rotate: isBlown ? 360 : 0 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-white/5 rounded-full pointer-events-none"
                  />
                </div>

                {/* Cake Info and Completed badge */}
                <h3 className="font-serif text-base font-semibold text-orange-100 group-hover:text-pink-300 transition-colors text-center">
                  {cake.title}
                </h3>
                
                <p className="text-[11px] font-mono tracking-widest text-pink-200/50 uppercase mt-1 text-center">
                  {isBlown ? '✨ Wish Unlocked' : '🔥 Tap to light candle'}
                </p>

                {isBlown && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-3 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400"
                  >
                    <CheckCircle2 size={10} className="mr-1.5" />
                    COMPLETED
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Podium */}
      <div className="h-24 flex items-center justify-center z-20">
        <AnimatePresence>
          {allCakesBlown && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={onNext}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-300/30 hover:border-pink-300/50 shadow-[0_0_20px_rgba(244,63,94,0.25)] font-serif text-sm tracking-widest text-orange-100 font-semibold cursor-pointer flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Examine Glowing Envelope
              <ChevronRight size={14} className="text-orange-200" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Blow Candle Overlay Modal */}
      <AnimatePresence>
        {activeCake && (
          <div className="fixed inset-0 w-full h-screen z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCake(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Confetti canvas animation particles overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {confetti.map((part) => (
                <motion.div
                  key={part.id}
                  initial={{ x: `${part.x}%`, y: '100%', opacity: 1, rotate: 0 }}
                  animate={{
                    y: `${part.y}%`,
                    rotate: 360,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className="absolute rounded-sm"
                  style={{
                    backgroundColor: part.color,
                    width: `${part.size}px`,
                    height: `${part.size}px`,
                  }}
                />
              ))}
            </div>

            {/* Cake details dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 35 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 overflow-hidden flex flex-col items-center justify-center shadow-2xl z-20"
            >
              {/* Outer soft glowing backdrop */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

              <span className="font-mono text-[9px] tracking-[0.2em] text-pink-300 uppercase mb-2">
                MAKE A SILENT WISH
              </span>
              
              <h2 className="font-serif text-2xl text-orange-100 font-semibold mb-6 text-center">
                {activeCake.title}
              </h2>

              {/* Large Cake Graphics with flicker flame */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                {/* Candle flame */}
                {litCakes.includes(activeCake.id) && !blownCakes.includes(activeCake.id) && (
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1, 1.15, 1],
                      y: [0, -3, 0],
                      rotate: [-2, 2, -2, 0, -2]
                    }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="absolute top-2 w-5 h-8 bg-gradient-to-t from-yellow-500 via-orange-400 to-amber-100 rounded-full blur-[1px] shadow-[0_0_20px_#f59e0b] z-20"
                  />
                )}

                {/* Cake body */}
                <div className={`w-28 h-20 bg-gradient-to-b ${activeCake.color} rounded-t-xl border border-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden`}>
                  {/* Decorative frosting flowers */}
                  <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-white/70" />
                  <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-white/70" />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70" />
                  
                  {/* Drips of cream */}
                  <div className="absolute top-0 left-0 right-0 h-4 rounded-b-md opacity-90" style={{ backgroundColor: activeCake.creamColor }} />
                  
                  {/* Candle stick */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-8 bg-blue-300 rounded-sm border border-blue-400" />
                </div>
                {/* Plate */}
                <div className="absolute bottom-6 w-36 h-3 bg-slate-800 rounded-full border border-white/10" />
              </div>

              {/* Blowing Interaction Zone */}
              {!blownCakes.includes(activeCake.id) ? (
                <div className="w-full flex flex-col items-center">
                  
                  {/* Visual volume level */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4 max-w-xs relative">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-75"
                      style={{ width: `${micVolume * 100}%` }}
                    />
                    <div className="absolute top-0 right-1/3 bottom-0 w-[1px] bg-white/10" title="Trigger Point" />
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    {isListening ? (
                      <div className="flex items-center gap-2 text-xs text-pink-300 font-mono animate-pulse">
                        <Mic size={14} className="text-pink-400" />
                        <span>Listening for blow...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-orange-200/40 font-mono">
                        <MicOff size={14} />
                        <span>Mic disabled. Ready.</span>
                      </div>
                    )}
                  </div>

                  {/* Manual fallback trigger */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBlowOut(activeCake.id)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-500/30 text-xs font-mono text-orange-200 cursor-pointer"
                  >
                    💨 Tap to Blow Candles (Fallback)
                  </motion.button>
                </div>
              ) : (
                /* Wish Revealed! */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center p-5 rounded-2xl bg-slate-950/40 border border-emerald-500/10 text-emerald-100 flex flex-col items-center"
                >
                  <Sparkles className="text-yellow-300 mb-2 w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                  <p className="font-serif text-sm italic leading-relaxed text-orange-200/90">
                    &ldquo;{activeCake.wish}&rdquo;
                  </p>
                </motion.div>
              )}

              {micError && (
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-orange-300/60 font-mono">
                  <AlertCircle size={10} />
                  <span>{micError}</span>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setActiveCake(null)}
                className="mt-8 text-xs font-mono tracking-widest text-orange-200/40 hover:text-orange-200/80 cursor-pointer transition-colors"
              >
                Go Back to Cakes Shelf
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};
export default DreamLibrary;
