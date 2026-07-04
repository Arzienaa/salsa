import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dreamSynth } from '../utils/audio';

interface OpeningExperienceProps {
  onStart: () => void;
  recipientName: string;
}

export const OpeningExperience: React.FC<OpeningExperienceProps> = ({ onStart, recipientName }) => {
  const [hasTapped, setHasTapped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLanternTap = async () => {
    if (hasTapped) return;
    setHasTapped(true);

    // Play initial chime & boot the synthesiser
    try {
      dreamSynth.init();
      await dreamSynth.start();
      dreamSynth.triggerTwinkleFeedback();
    } catch (e) {
      console.warn("Audio Context failed to boot initially. Safe fallback:", e);
    }

    // Give a short delay for the transition animation to bloom beautifully
    setTimeout(() => {
      onStart();
    }, 1200);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden z-10 px-4 select-none">
      <AnimatePresence>
        {!hasTapped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            {/* Ambient greeting */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.5, duration: 1.5 }}
              className="font-serif text-2xl md:text-3xl tracking-wider text-orange-200 mb-2 text-center"
            >
              Happy Birthday
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1.8 }}
              className="font-serif text-4xl md:text-6xl text-orange-100 font-semibold tracking-wide text-center mb-16 text-glow"
            >
              {recipientName}
            </motion.h1>

            {/* Glowing Lantern button container */}
            <div className="relative flex items-center justify-center h-64 w-64">
              {/* Outer Golden Aura Pulsating */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.15, 0.45, 0.15],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-48 h-48 rounded-full bg-amber-400/20 blur-3xl"
              />

              {/* Lantern button */}
              <motion.button
                id="glowing_lantern_landing"
                onClick={handleLanternTap}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-20 cursor-pointer focus:outline-none flex flex-col items-center"
              >
                {/* SVG Lantern */}
                <motion.svg
                  width="100"
                  height="140"
                  viewBox="0 0 100 140"
                  className="drop-shadow-[0_0_25px_rgba(251,146,60,0.8)]"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Top hanger and wood caps */}
                  <path d="M 50,10 L 50,22" stroke="#78350f" strokeWidth="2.5" />
                  <rect x="35" y="22" width="30" height="4" rx="1.5" fill="#5c2007" />
                  
                  {/* Lantern Paper Body */}
                  <rect x="25" y="26" width="50" height="70" rx="4" fill="#ffedd5" stroke="#78350f" strokeWidth="1.5" />
                  
                  {/* Glowing core */}
                  <circle cx="50" cy="65" r="16" fill="#facc15" opacity="0.9" />
                  <circle cx="50" cy="65" r="28" fill="#f97316" opacity="0.4" className="animate-pulse" />

                  {/* Wood bottom structure */}
                  <rect x="25" y="96" width="50" height="4" rx="1.5" fill="#5c2007" />
                  <line x1="30" y1="26" x2="30" y2="96" stroke="#78350f" strokeWidth="1" opacity="0.3" />
                  <line x1="70" y1="26" x2="70" y2="96" stroke="#78350f" strokeWidth="1" opacity="0.3" />

                  {/* Decorative tassel hanging from bottom */}
                  <path d="M 50,100 L 50,120" stroke="#f43f5e" strokeWidth="1.5" />
                  <path d="M 47,120 L 53,120 L 50,132 Z" fill="#e11d48" />
                </motion.svg>
              </motion.button>
            </div>

            {/* Instruction Sentence */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1.0 : 0.6 }}
              className="font-serif italic text-lg md:text-xl text-orange-200 mt-12 tracking-wide text-center h-8"
              animate-duration="1.5"
            >
              "Every light holds a memory..."
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-xs font-sans tracking-[0.15em] text-orange-300/60 mt-4 uppercase"
            >
              Tap the Lantern to Begin
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen flash on transition */}
      <AnimatePresence>
        {hasTapped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.3, 1] }}
            className="fixed inset-0 bg-orange-100 z-50 pointer-events-none mix-blend-screen"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
