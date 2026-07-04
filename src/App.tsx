import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BirthdayConfig } from './types';
import { DEFAULT_BIRTHDAY_DATA } from './defaultData';
import { dreamSynth } from './utils/audio';

// Components
import { MagicalCanvas } from './components/MagicalCanvas';
import { OpeningExperience } from './components/OpeningExperience';
import { VoiceMessage } from './components/VoiceMessage';
import { SkyObservatory } from './components/SkyObservatory';
import { DreamLibrary } from './components/DreamLibrary';
import { MemoryForest } from './components/MemoryForest';
import { LanternFinale } from './components/LanternFinale';

// Icons
import { Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [scene, setScene] = useState<number>(0);
  const [config] = useState<BirthdayConfig>(DEFAULT_BIRTHDAY_DATA);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const toggleSound = () => {
    dreamSynth.init();
    const muted = dreamSynth.toggleMute();
    setIsMuted(muted);
  };

  // Auto-boot audio synthesizer on interaction if it suspended
  useEffect(() => {
    const handleGesture = () => {
      if (scene > 0) {
        dreamSynth.start();
      }
    };
    window.addEventListener('click', handleGesture);
    return () => window.removeEventListener('click', handleGesture);
  }, [scene]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-orange-50 overflow-x-hidden font-sans">
      
      {/* 60fps HTML5 Canvas Particle Engine backdrop overlay */}
      <MagicalCanvas scene={scene === 5 ? 7 : scene === 4 ? 6 : scene === 3 ? 3 : scene} />

      {/* Persistent global sound controller */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSound}
          className="w-10 h-10 rounded-full glass-card border border-white/10 flex items-center justify-center text-orange-200/80 hover:text-orange-100 cursor-pointer shadow-lg backdrop-blur-md"
          title={isMuted ? 'Unmute cozy chords' : 'Mute music'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="animate-pulse" style={{ animationDuration: '3s' }} />}
        </motion.button>
      </div>

      {/* Primary Story Clearing container with cinematic page-crossfade transitions */}
      <main className="relative w-full min-h-screen z-10 flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="w-full min-h-screen flex flex-col justify-center items-center"
          >
            {scene === 0 && (
              <OpeningExperience
                recipientName={config.recipientName}
                onStart={() => setScene(1)}
              />
            )}

            {scene === 1 && (
              <VoiceMessage
                onNext={() => setScene(2)}
              />
            )}

            {scene === 2 && (
              <SkyObservatory
                stars={config.stars}
                onNext={() => setScene(3)}
              />
            )}

            {scene === 3 && (
              <DreamLibrary
                cakes={config.cakes}
                onNext={() => setScene(4)}
              />
            )}

            {scene === 4 && (
              <MemoryForest
                memories={config.memories}
                letterText={config.letterText}
                senderName={config.senderName}
                onNext={() => setScene(5)}
              />
            )}

            {scene === 5 && (
              <LanternFinale
                recipientName={config.recipientName}
                onRestart={() => setScene(0)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
