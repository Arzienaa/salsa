import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Sparkles, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { dreamSynth } from '../utils/audio';

interface VoiceMessageProps {
  onNext: () => void;
}

const TRANSCRIPT_TIMINGS = [
  { time: 0, text: "Memutar suara rahasia Fadzlan untuk Salsaa..." },
  { time: 6, text: "Setiap detak dan nadanya dibuat tulus untukmu, sayang..." },
  { time: 14, text: "Terima kasih sudah bertahan dengan aku selama ini..." },
  { time: 22, text: "Maaf yaa kalau aku kadang bikin kamu kesal atau kecewa..." },
  { time: 30, text: "Tapi rasa sayangku ke kamu itu sangat tulus, selalu..." },
  { time: 38, text: "Selamat ulang tahun yang ke-17, cantiikkuuhh... 💐✨" }
];

const VOICE_AUDIO_URL = "/audio/voice-for-salsa.mp3";

export function VoiceMessage({ onNext }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(50); 
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [audioBars, setAudioBars] = useState<number[]>(new Array(24).fill(15));
  const [audioExists, setAudioExists] = useState<boolean>(false);
  const [checkingAudio, setCheckingAudio] = useState<boolean>(true);

  const simulationIntervalRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if the custom audio file exists
  useEffect(() => {
    fetch(VOICE_AUDIO_URL, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          setAudioExists(true);
        } else {
          setAudioExists(false);
        }
      })
      .catch(() => {
        setAudioExists(false);
      })
      .finally(() => {
        setCheckingAudio(false);
      });
  }, []);

  const startVoiceAudio = () => {
    dreamSynth.init();
    dreamSynth.start();
    dreamSynth.setCozyMode(true);
    
    if (audioExists && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Audio playback error:", err);
      });
    }
  };

  const stopVoiceAudio = () => {
    dreamSynth.setCozyMode(false);
    if (audioExists && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleTogglePlay = () => {
    dreamSynth.triggerTwinkleFeedback();
    
    if (isPlaying) {
      setIsPlaying(false);
      stopVoiceAudio();
    } else {
      setIsPlaying(true);
      startVoiceAudio();
    }
  };

  // Synchronize dancing visualizer bars and warm synth sparkles
  useEffect(() => {
    if (isPlaying) {
      simulationIntervalRef.current = setInterval(() => {
        setAudioBars(
          new Array(24).fill(0).map(() => Math.floor(Math.random() * 45) + 12)
        );
        // Soft background ambient tones
        if (Math.random() > 0.85) {
          const warmHarmonics = [220.00, 261.63, 293.66, 329.63, 392.00];
          const randomNote = warmHarmonics[Math.floor(Math.random() * warmHarmonics.length)];
          dreamSynth.playTwinkleNote(randomNote, dreamSynth.ctx?.currentTime || 0, 3.5, 0.05);
        }
      }, 120);
    } else {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      setAudioBars(new Array(24).fill(15));
    }

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [isPlaying]);

  // Sync transcripts based on current progress time
  useEffect(() => {
    const activeIndex = TRANSCRIPT_TIMINGS.reduce((acc, curr, index) => {
      if (progress >= curr.time) {
        return index;
      }
      return acc;
    }, 0);
    setTranscriptIndex(activeIndex);
  }, [progress]);

  // Sync volume level to HTML5 audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // HTML5 Audio Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    stopVoiceAudio();
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(Math.ceil(audioRef.current.duration) || 50);
    }
  };

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setProgress(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Format seconds to text
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-4xl px-6 py-12 flex flex-col items-center justify-center min-h-screen relative z-10 text-orange-50">
      
      {/* Hidden audio tag for background playback if exists */}
      {audioExists && (
        <audio
          ref={audioRef}
          src={VOICE_AUDIO_URL}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
        />
      )}

      {/* Title block */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <span className="text-xs tracking-[0.2em] uppercase font-mono text-orange-300/80 mb-2 block">
          Happy Birthday Sayang
        </span>
        <h1 className="text-4xl md:text-5xl font-sans font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-100 to-rose-200">
          🎙 Fadzlan&apos;s Voice
        </h1>
        <p className="text-sm md:text-base text-orange-200/60 mt-3 font-light max-w-lg mx-auto">
          A personalized audio message recorded especially for Salsa&apos;s seventeenth birthday.
        </p>
      </motion.div>

      {/* Main player box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-lg p-8 rounded-3xl bg-slate-900/40 border border-orange-500/10 backdrop-blur-xl relative shadow-[0_20px_50px_rgba(251,146,60,0.05)] overflow-hidden flex flex-col items-center"
      >
        {/* Decorative glowing orbs */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {checkingAudio ? (
          <div className="h-64 flex flex-col items-center justify-center text-orange-300/60 font-mono text-xs gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-orange-400 border-orange-500/20 animate-spin" />
            <span>Harmonizing channels...</span>
          </div>
        ) : !audioExists ? (
          /* Graceful missing placeholder display */
          <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 text-orange-300/80 animate-pulse">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-serif text-orange-100 mb-2 font-medium">
              Voice for Salsa is not available yet.
            </h3>
            <p className="text-xs text-orange-200/50 leading-relaxed font-sans max-w-xs">
              Audio files are still being aligned. Press below to explore the other chapters of this surprise.
            </p>
          </div>
        ) : (
          /* Fully operational audio player */
          <>
            {/* Pulsating play container */}
            <div className="relative w-40 h-40 mb-8 flex items-center justify-center cursor-pointer select-none">
              <AnimatePresence>
                {isPlaying && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2.0, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border-2 border-orange-400/30 blur-sm pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0.5 }}
                      animate={{ scale: 1.7, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2.0, ease: 'easeOut', delay: 0.7 }}
                      className="absolute inset-0 rounded-full border border-rose-400/20 blur-md pointer-events-none"
                    />
                  </>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTogglePlay}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 shadow-2xl ${
                  isPlaying
                    ? 'bg-gradient-to-tr from-orange-400 to-rose-500 text-slate-950 shadow-orange-500/30 scale-105'
                    : 'bg-slate-800/80 border border-white/10 text-orange-200 hover:text-white shadow-black/40 hover:border-orange-500/30'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10" />
                ) : (
                  <Play className="w-10 h-10 ml-1.5" />
                )}
              </motion.button>
            </div>

            {/* Dancing Waveform bars */}
            <div className="w-full flex items-end justify-center gap-[4px] h-12 mb-6 px-4">
              {audioBars.map((barHeight, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: barHeight }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className={`w-[6px] rounded-full ${
                    isPlaying 
                      ? 'bg-gradient-to-t from-orange-400 to-rose-400 opacity-80' 
                      : 'bg-white/10'
                  }`}
                  style={{ height: `${barHeight}px` }}
                />
              ))}
            </div>

            {/* Timers */}
            <div className="w-full flex justify-between text-[10px] font-mono text-orange-200/40 mb-2 px-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Modern sliders for Seek Bar */}
            <div className="w-full mb-6 relative group">
              <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                onChange={handleSeekBarChange}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-400 focus:outline-none transition-all"
              />
              <div
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-rose-500 rounded-lg pointer-events-none"
                style={{ width: `${(progress / duration) * 100}%` }}
              />
            </div>

            {/* Audio Volume Controller */}
            <div className="w-full flex items-center gap-3 bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-white/5 mb-8">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-orange-300/80 hover:text-orange-200 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-orange-300/80 focus:outline-none"
              />
            </div>

            {/* Transcripts Subtitles area */}
            <div className="w-full min-h-[80px] flex items-center justify-center text-center px-4 relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={transcriptIndex}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4 }}
                  className="text-sm md:text-base font-light text-orange-100/90 leading-relaxed italic"
                >
                  &ldquo;{TRANSCRIPT_TIMINGS[transcriptIndex]?.text}&rdquo;
                </motion.p>
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>

      {/* Helpful developer instructions note requested */}
      <div className="mt-8 text-center max-w-sm px-4">
        <p className="text-[10px] font-mono text-orange-200/30 leading-relaxed">
          Hi cantik <code className="text-orange-300/50">dengerin voice nya yaaa!! okay okay?.
        </p>
      </div>

      {/* Primary Navigation button to move on */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-10"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            dreamSynth.triggerTwinkleFeedback();
            onNext();
          }}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500/20 to-rose-500/20 hover:from-orange-500/30 hover:to-rose-500/30 border border-orange-500/30 text-orange-100 font-sans tracking-wide text-sm flex items-center gap-2.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] cursor-pointer"
        >
          <span>Reveal the Star Observatory</span>
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
      
    </div>
  );
}

export default VoiceMessage;
