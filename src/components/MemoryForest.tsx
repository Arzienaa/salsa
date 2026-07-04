import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryItem } from '../types';
import { dreamSynth } from '../utils/audio';
import { Image, Heart, ChevronRight, X, Sparkles } from 'lucide-react';

interface MemoryForestProps {
  memories: MemoryItem[];
  letterText: string;
  senderName: string;
  onNext: () => void;
}

export const MemoryForest: React.FC<MemoryForestProps> = ({ memories, letterText, senderName, onNext }) => {
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [exploredIds, setExploredIds] = useState<string[]>([]);
  const [showLetter, setShowLetter] = useState(false);

  const handleTreeClick = (memory: MemoryItem) => {
    dreamSynth.triggerTwinkleFeedback();
    setSelectedMemory(memory);
    
    if (!exploredIds.includes(memory.id)) {
      setExploredIds((prev) => [...prev, memory.id]);
    }
  };

  const handleCloseModal = () => {
    setSelectedMemory(null);
  };

  // SVG shapes for our three beautiful custom trees
  const treeLeafStyles = [
    "M 50,0 Q 15,40 50,110 Q 85,40 50,0 Z", // Organic teardrop leaf
    "M 50,10 Q 20,40 50,90 Q 80,40 50,10 Z",  // Elegant slender willow leaf
    "M 50,0 C 20,20 20,70 50,110 C 80,70 80,20 50,0 Z" // Round cloud canopy
  ];

  const allExplored = exploredIds.length >= memories.length;

  // Automatically trigger letter when all are explored and polaroid modal is closed
  useEffect(() => {
    if (allExplored && !selectedMemory) {
      const timer = setTimeout(() => {
        setShowLetter(true);
        // Play soft celestial chords for the climactic reading scene
        dreamSynth.setCozyMode(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allExplored, selectedMemory]);

  return (
    <div className={`relative w-full min-h-screen flex flex-col justify-between items-center py-12 px-4 z-10 select-none transition-all duration-1000 ${
      allExplored ? 'bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.08)_0%,transparent_70%)]' : ''
    }`}>
      
      {/* Dynamic Header */}
      {!showLetter && (
        <div className="text-center max-w-lg mt-8 z-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="font-sans text-xs tracking-[0.2em] text-teal-300 uppercase mb-2"
          >
            Salsaa&apos;s Memory Forest
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-3xl md:text-4xl text-orange-100 font-light tracking-wide mb-3 text-glow"
          >
            🌸 Three Memory Trees
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.4 }}
            className="font-sans text-xs md:text-sm text-teal-200/60 italic leading-relaxed"
          >
            In the deepest clearing of the magical forest stand three ancient trees, waiting for your touch. Explore each memory tree to make the woods glow with light.
          </motion.p>
        </div>
      )}

      {/* Main Forest Clearing Container - balanced grid for 3 trees */}
      {!showLetter && (
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-10 my-10 items-end justify-center z-10 px-6">
          {memories.map((memory, index) => {
            const isExplored = exploredIds.includes(memory.id);
            const leafPath = treeLeafStyles[index % treeLeafStyles.length];
            
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 1 }}
                className="flex flex-col items-center group cursor-pointer animate-none"
                onClick={() => handleTreeClick(memory)}
              >
                {/* Floating Tree Graphic */}
                <div className="relative w-40 h-64 flex flex-col items-center justify-end">
                  
                  {/* Glowing Aura backdrop */}
                  <motion.div
                    animate={{
                      scale: isExplored ? [1, 1.2, 1] : [1, 1.35, 1],
                      opacity: isExplored ? [0.2, 0.4, 0.2] : [0.35, 0.7, 0.35],
                    }}
                    transition={{
                      duration: 3 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute bottom-16 w-32 h-32 rounded-full blur-3xl bg-gradient-to-r ${
                      isExplored ? 'from-emerald-400/25 to-teal-500/15' : 'from-pink-400/30 to-rose-400/20'
                    }`}
                  />

                  {/* Tree SVG drawing */}
                  <motion.svg
                    width="140"
                    height="210"
                    viewBox="0 0 100 150"
                    className="relative z-10 transition-all duration-500 transform group-hover:scale-105"
                    animate={{
                      rotate: [index % 2 === 0 ? -1 : 1, index % 2 === 0 ? 1 : -1, index % 2 === 0 ? -1 : 1],
                    }}
                    transition={{
                      duration: 5 + index,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <defs>
                      <linearGradient id={`treeGrad-${memory.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isExplored ? '#2dd4bf' : '#fda4af'} />
                        <stop offset="100%" stopColor={isExplored ? '#059669' : '#f43f5e'} />
                      </linearGradient>
                    </defs>

                    {/* Leaf silhouettes */}
                    <g transform="translate(0, -10)">
                      <path d={leafPath} fill={`url(#treeGrad-${memory.id})`} opacity="0.85" transform="translate(0, 15) scale(0.9)" />
                      <path d={leafPath} fill={`url(#treeGrad-${memory.id})`} opacity="0.95" transform="translate(15, 25) scale(0.7) rotate(20 50 50)" />
                      <path d={leafPath} fill={`url(#treeGrad-${memory.id})`} opacity="0.95" transform="translate(-15, 25) scale(0.7) rotate(-20 50 50)" />
                    </g>

                    {/* Wooden Trunk lines */}
                    <path d="M 50,90 Q 50,130 50,140 Q 40,142 35,145 L 65,145 Q 60,142 50,140" fill="none" stroke="#451a03" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 50,90 Q 60,70 65,65" fill="none" stroke="#451a03" strokeWidth="2.5" />
                    <path d="M 50,95 Q 40,80 32,75" fill="none" stroke="#451a03" strokeWidth="2" />

                    {/* Fruit chimes sparkles */}
                    <circle cx="50" cy="45" r="3.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '3.5s' }} />
                    <circle cx="50" cy="45" r="4.5" fill={isExplored ? '#2dd4bf' : '#fbcfe8'} />

                    <circle cx="33" cy="67" r="3.5" fill={isExplored ? '#34d399' : '#fda4af'} />
                    <circle cx="67" cy="59" r="3.5" fill={isExplored ? '#14b8a6' : '#fda4af'} />
                    <circle cx="52" cy="78" r="3" fill={isExplored ? '#059669' : '#fbcfe8'} />
                  </motion.svg>

                  {/* Ground Platform glow */}
                  <div className={`w-20 h-2.5 rounded-full blur-[2px] ${isExplored ? 'bg-emerald-500/20' : 'bg-pink-500/30'} mt-2 transition-all duration-500`} />
                </div>

                {/* Memory Label */}
                <div className="mt-4 text-center">
                  <p className="font-serif text-sm font-semibold text-orange-100 group-hover:text-teal-300 transition-colors">
                    {memory.title}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Image size={11} className="text-teal-400" />
                    <span className="font-sans text-[9px] uppercase tracking-widest text-teal-200/50">
                      {isExplored ? 'UNVEILED' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cinematic display of final letter directly on screen */}
      <AnimatePresence>
        {showLetter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="w-full max-w-2xl bg-slate-900/60 border border-teal-500/25 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-[0_0_60px_rgba(45,212,191,0.15)] text-left flex flex-col relative overflow-hidden my-auto max-h-[80vh] z-30 select-text"
          >
            {/* Soft backdrop glows */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

            {/* Letter Header */}
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/10 select-none">
              <Heart className="text-rose-400 fill-rose-500 animate-pulse" size={18} />
              <span className="font-sans text-xs tracking-[0.25em] text-teal-300 uppercase font-semibold">
                Salsa&apos;s 17th Birthday Message
              </span>
            </div>

            {/* Letter content scroll block */}
            <div className="overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-teal-500/20 hover:scrollbar-thumb-teal-500/40 flex-1 font-serif text-base md:text-[17px] text-orange-50/90 leading-relaxed italic space-y-4 whitespace-pre-line">
              {letterText}
            </div>

            {/* Letter Footer */}
            <div className="mt-8 pt-5 border-t border-white/10 flex justify-between items-center select-none">
              <span className="text-[10px] font-mono text-orange-200/30">
                loveuusomuchh
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  dreamSynth.triggerTwinkleFeedback();
                  onNext();
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-500/20 to-orange-500/20 hover:from-teal-500/30 hover:to-orange-500/30 border border-teal-300/30 hover:border-teal-300/50 shadow-[0_0_20px_rgba(45,212,191,0.2)] font-serif text-xs tracking-wider text-orange-100 font-semibold cursor-pointer flex items-center gap-2 transition-all"
              >
                Continue to Final Celebration
                <ChevronRight size={14} className="text-teal-300" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exploratory Progress guide under the trees */}
      {!showLetter && (
        <div className="text-center z-10 select-none mb-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-teal-300/40 flex items-center justify-center gap-1.5">
            <span>EXPLORATION PROGRESS</span>
            <span>({exploredIds.length} / {memories.length})</span>
          </p>
        </div>
      )}

      {/* Polaroid Modal Card */}
      <AnimatePresence>
        {selectedMemory && (
          <div className="fixed inset-0 w-full h-screen z-50 flex items-center justify-center p-4 select-none">
            
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Polaroid Photo Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30, rotate: 3 }}
              transition={{ type: "spring", damping: 22, stiffness: 160 }}
              className="relative w-full max-w-sm bg-stone-50 text-slate-800 rounded-sm p-4 pb-8 shadow-2xl flex flex-col items-center border border-stone-200 z-20"
            >
              {/* Polaroid hanging clip line */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-orange-400/20 rounded shadow-inner border border-orange-500/10" />

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-950/5 hover:bg-slate-950/10 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>

              {/* Polaroid Heart Banner */}
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-rose-500 font-mono font-bold mb-3 mt-1">
                <Heart size={10} fill="#f43f5e" stroke="none" className="animate-pulse" />
                <span>Memories with Salsaa</span>
              </div>

              {/* Real high quality picture frame */}
              <div className="bg-stone-900 p-2.5 rounded-sm shadow-inner w-full aspect-square overflow-hidden flex items-center justify-center relative border border-stone-200">
                <img
                  src={selectedMemory.mediaUrl}
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover rounded-sm filter brightness-95 hover:brightness-100 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Handwritten Captions */}
              <div className="w-full text-center mt-5 px-2">
                <h3 className="font-serif text-slate-900 font-semibold text-lg tracking-wide mb-2.5">
                  {selectedMemory.title}
                </h3>
                
                {/* Heartfelt Fadzlan quote */}
                <p className="font-serif italic text-sm text-slate-700 leading-relaxed font-light border-t border-dashed border-slate-200 pt-3">
                  &ldquo;{selectedMemory.description}&rdquo;
                </p>
              </div>

              {/* Soft visual sparkle embellishment */}
              <div className="absolute bottom-2 right-3 opacity-30">
                <Sparkles size={14} className="text-amber-500" />
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default MemoryForest;
