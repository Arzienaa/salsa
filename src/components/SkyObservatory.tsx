import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StarItem } from '../types';
import { dreamSynth } from '../utils/audio';
import { Star, Sparkles, Navigation, Compass, ChevronRight } from 'lucide-react';

interface SkyObservatoryProps {
  stars: StarItem[];
  onNext: () => void;
}

export const SkyObservatory: React.FC<SkyObservatoryProps> = ({ stars, onNext }) => {
  const [activeStar, setActiveStar] = useState<StarItem | null>(null);
  const [unlockedStarIds, setUnlockedStarIds] = useState<string[]>([]);
  const [degrees, setDegrees] = useState<number>(142); // telescope rotation

  const handleStarClick = (star: StarItem) => {
    dreamSynth.triggerTwinkleFeedback();
    setActiveStar(star);
    
    // Rotate telescope slightly for organic feel
    setDegrees((prev) => (prev + (Math.random() * 8 - 4)));

    if (!unlockedStarIds.includes(star.id)) {
      setUnlockedStarIds((prev) => [...prev, star.id]);
    }
  };

  const allStarsConnected = unlockedStarIds.length >= stars.length;

  // Render SVG Constellation lines between unlocked stars sequentially
  const renderConstellationLines = () => {
    if (unlockedStarIds.length < 2) return null;

    // Build points based on the order they were defined in stars
    const lines: React.ReactNode[] = [];
    for (let i = 0; i < stars.length - 1; i++) {
      const starA = stars[i];
      const starB = stars[i + 1];

      const isAUnlocked = unlockedStarIds.includes(starA.id);
      const isBUnlocked = unlockedStarIds.includes(starB.id);

      if (isAUnlocked && isBUnlocked) {
        lines.push(
          <motion.line
            key={`line-${starA.id}-${starB.id}`}
            x1={`${starA.cx}%`}
            y1={`${starA.cy}%`}
            x2={`${starB.cx}%`}
            y2={`${starB.cy}%`}
            stroke="rgba(253, 224, 71, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
          />
        );
      }
    }
    return lines;
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between items-center py-12 px-4 z-10 select-none">
      
      {/* Dynamic Header */}
      <div className="text-center max-w-lg mt-8 z-20">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="font-sans text-xs tracking-[0.2em] text-amber-200 uppercase mb-2"
        >
          The Sky Observatory
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-2xl md:text-3xl text-orange-100 font-medium tracking-wide mb-3"
        >
          The Celestial Coordinates of Joy
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.4 }}
          className="font-sans text-xs md:text-sm text-orange-200/60 italic leading-relaxed"
        >
          Look through the giant telescope. Align the stars of our sky to write our map across the heavens.
        </motion.p>
      </div>

      {/* Telescope Viewer Frame */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] rounded-full p-1.5 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex items-center justify-center my-8 z-10 bg-slate-950/20">
        
        {/* Brass Frame Rotating Markings */}
        <motion.div
          animate={{ rotate: degrees }}
          transition={{ type: "spring", damping: 15 }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/10 pointer-events-none"
        />

        {/* Viewfinder Circular Lens Overlay */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 pointer-events-none z-20 shadow-inner">
          {/* Subtle crosshair */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-amber-500/10" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-amber-500/10" />
          
          {/* Glass glare effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-40" />
        </div>

        {/* Deep Space Sky Canvas Inside Viewfinder */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-[#020014] to-[#0d0926]">
          {/* Nebula dust effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(168,85,247,0.15)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.1)_0%,transparent_50%)]" />

          {/* SVG Constellation lines overlay */}
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
            {renderConstellationLines()}
          </svg>

          {/* Glowing Stars placed dynamically */}
          {stars.map((star) => {
            const isUnlocked = unlockedStarIds.includes(star.id);
            const isActive = activeStar?.id === star.id;

            return (
              <button
                key={star.id}
                onClick={() => handleStarClick(star)}
                style={{ left: `${star.cx}%`, top: `${star.cy}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 p-4 cursor-pointer focus:outline-none z-20 group"
              >
                {/* Outer Glow ring when active/unlocked */}
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.6, 1] : isUnlocked ? [1, 1.25, 1] : 1,
                    opacity: isUnlocked ? [0.4, 0.8, 0.4] : 0,
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${
                    isActive ? 'bg-yellow-300/30' : 'bg-amber-400/20'
                  } blur-md`}
                />

                {/* Inner glowing star element */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.4 : isUnlocked ? 1.15 : 1,
                    rotate: isUnlocked ? 45 : 0,
                  }}
                  className={`flex items-center justify-center transition-all duration-300 ${
                    isUnlocked
                      ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]'
                      : 'text-amber-100/40 group-hover:text-amber-100/70'
                  }`}
                >
                  <Star size={isActive ? 18 : 14} fill={isUnlocked ? "currentColor" : "none"} />
                </motion.div>
                
                {/* Small indicator label */}
                <span className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono uppercase tracking-widest text-amber-200/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {star.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Star Starry Card View */}
      <div className="w-full max-w-lg min-h-36 z-20 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeStar ? (
            <motion.div
              key={activeStar.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card-dark p-5 rounded-xl border border-amber-300/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between border-b border-amber-500/10 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span className="font-mono text-[10px] text-yellow-300/70 tracking-widest uppercase">
                    Alignment: {activeStar.category}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-amber-200/40 uppercase">
                  ra: {activeStar.cx}° dec: {activeStar.cy}°
                </span>
              </div>
              
              <h3 className="font-serif text-lg font-semibold text-orange-100 mb-1.5">
                {activeStar.title}
              </h3>
              <p className="font-sans text-xs md:text-sm text-orange-200/80 leading-relaxed font-light italic">
                "{activeStar.description}"
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="prompt-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="font-serif italic text-sm text-orange-200/70">
                "Click each glowing star coordinate inside the telescope lens to write our celestial melody..."
              </p>
              <div className="flex items-center justify-center gap-2 mt-2 font-mono text-[9px] uppercase tracking-widest text-amber-300/40">
                <Compass size={11} className="animate-spin" style={{ animationDuration: '8s' }} />
                Scanning Sky Grid: {unlockedStarIds.length}/{stars.length} Stars
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Constellation Complete Trigger Action */}
      <div className="h-24 flex items-center justify-center z-20 mt-4">
        <AnimatePresence>
          {allStarsConnected && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={onNext}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-rose-500/20 hover:from-yellow-500/30 hover:to-rose-500/30 border border-yellow-300/30 hover:border-yellow-300/50 shadow-[0_0_20px_rgba(251,191,36,0.25)] font-serif text-sm tracking-widest text-orange-100 font-semibold cursor-pointer flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter the Dream Library
              <ChevronRight size={14} className="text-orange-200" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
