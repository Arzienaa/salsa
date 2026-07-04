import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RotateCcw } from 'lucide-react';
import { dreamSynth } from '../utils/audio';

interface LanternFinaleProps {
  recipientName: string;
  onRestart: () => void;
}

interface SkyLantern {
  x: number;
  y: number;
  vy: number;
  size: number;
  alpha: number;
  swayAmount: number;
  swaySpeed: number;
  seed: number;
  targetX: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface LetterSpark {
  centerX: number;
  centerY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  x: number;
  y: number;
  progress: number;
  speed: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  seed: number;
  twinkleSpeed: number;
}

interface Rocket {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vy: number;
  color: string;
  char?: string;
  isLetter: boolean;
  spacing?: number;
}

// 5x7 dot matrix definitions for letters in "HAPPY BIRTHDAY SAYANG"
const LETTER_PATTERNS: Record<string, string[]> = {
  H: [
    "10001",
    "10001",
    "10001",
    "11111",
    "10001",
    "10001",
    "10001"
  ],
  A: [
    "01110",
    "10001",
    "10001",
    "11111",
    "10001",
    "10001",
    "10001"
  ],
  P: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10000",
    "10000",
    "10000"
  ],
  Y: [
    "10001",
    "10001",
    "01010",
    "00100",
    "00100",
    "00100",
    "00100"
  ],
  B: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10001",
    "10001",
    "11110"
  ],
  I: [
    "01110",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "01110"
  ],
  R: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10010",
    "10001",
    "10001"
  ],
  T: [
    "11111",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100"
  ],
  D: [
    "11100",
    "10010",
    "10001",
    "10001",
    "10001",
    "10010",
    "11100"
  ],
  S: [
    "01111",
    "10000",
    "10000",
    "01110",
    "00001",
    "00001",
    "11110"
  ],
  N: [
    "10001",
    "11001",
    "10101",
    "10011",
    "10001",
    "10001",
    "10001"
  ],
  G: [
    "01110",
    "10001",
    "10000",
    "10011",
    "10001",
    "10001",
    "01110"
  ],
  ' ': [
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00000"
  ]
};

export const LanternFinale: React.FC<LanternFinaleProps> = ({ recipientName, onRestart }) => {
  const fireworksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMounted = useRef(true);

  // Trigger audio climaxtic chimes on mount
  useEffect(() => {
    isMounted.current = true;
    dreamSynth.init();
    dreamSynth.start();
    dreamSynth.setCozyMode(false); // Enable full dynamic climax range

    setTimeout(() => {
      if (isMounted.current) {
        dreamSynth.playBirthdayArpeggio();
      }
    }, 1000);

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fireworks, Sky Lanterns & Letter Explosion Physics Loop
  useEffect(() => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const normalSparks: Spark[] = [];
    const letterSparks: LetterSpark[] = [];
    const rockets: Rocket[] = [];
    const lanterns: SkyLantern[] = [];

    const fireworkColors = [
      'rgba(244, 63, 94, 1)',   // Soft rose pink
      'rgba(245, 158, 11, 1)',  // Radiant golden orange
      'rgba(20, 184, 166, 1)',  // Warm celestial teal
      'rgba(168, 85, 247, 1)',  // Royal violet purple
      'rgba(236, 72, 153, 1)'   // Love pink
    ];

    // Initialize sky lanterns
    const maxLanterns = 35;
    for (let i = 0; i < maxLanterns; i++) {
      lanterns.push({
        x: Math.random() * width,
        y: Math.random() * height + height * 0.3, // Spreading initially across the lower screen
        vy: -Math.random() * 0.5 - 0.3,           // Slower, comforting gentle rise
        size: Math.random() * 7 + 5,
        alpha: Math.random() * 0.4 + 0.5,
        swayAmount: Math.random() * 12 + 4,
        swaySpeed: Math.random() * 0.008 + 0.003,
        seed: Math.random() * 100,
        targetX: Math.random() * width
      });
    }

    // Helper: Launch standard random background firework
    const createRandomFirework = (targetX?: number, targetY?: number) => {
      const x = targetX || Math.random() * width;
      const tY = targetY || Math.random() * (height * 0.4) + height * 0.15;
      const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

      rockets.push({
        x,
        y: height + 10,
        targetX: x,
        targetY: tY,
        vy: -Math.random() * 3 - 5,
        color,
        isLetter: false
      });
    };

    // Helper: Explode normal firework
    const explodeNormal = (x: number, y: number, color: string) => {
      dreamSynth.triggerTwinkleFeedback();
      const sparkCount = 35;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 1.2;
        normalSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: Math.random() * 1.8 + 0.8,
          alpha: 1,
          decay: Math.random() * 0.012 + 0.008
        });
      }
    };

    // Helper: Explode into precise letter shapes
    const explodeLetter = (centerX: number, centerY: number, char: string, color: string, spacing: number) => {
      const pattern = LETTER_PATTERNS[char];
      if (!pattern) {
        explodeNormal(centerX, centerY, color);
        return;
      }

      dreamSynth.triggerTwinkleFeedback();

      // Traverse 5x7 matrix
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (pattern[r][c] === '1') {
            const offsetX = (c - 2) * spacing;
            const offsetY = (r - 3) * spacing;

            letterSparks.push({
              centerX,
              centerY,
              targetOffsetX: offsetX,
              targetOffsetY: offsetY,
              x: centerX,
              y: centerY,
              progress: 0,
              speed: Math.random() * 0.015 + 0.02, // Smooth interpolation speed
              color,
              alpha: 1.0,
              decay: Math.random() * 0.003 + 0.004, // Slower decay to let letters linger elegantly
              size: Math.random() * 1.5 + 1.2,
              seed: Math.random() * 100,
              twinkleSpeed: Math.random() * 0.4 + 0.7
            });
          }
        }
      }
    };

    // Helper: Sequence scheduler to spell out words beautifully
    const launchWordSequence = (word: string, posY: number, color: string) => {
      const N = word.length;
      // Responsive spacing: ensures letter word maps perfectly on any screen size
      const spacing = Math.max(5, Math.min(11, Math.floor(width / (N * 8.5))));
      const letterWidth = 5 * spacing;
      const letterGap = 2 * spacing;
      const totalWordWidth = N * letterWidth + (N - 1) * letterGap;
      const startX = (width - totalWordWidth) / 2 + 2.5 * spacing;

      for (let i = 0; i < N; i++) {
        const char = word[i];
        if (char === ' ') continue;

        const targetX = startX + i * 7 * spacing;
        const targetY = posY + (Math.random() * 16 - 8); // Slight organic alignment offset

        setTimeout(() => {
          if (!isMounted.current) return;

          rockets.push({
            x: targetX + (Math.random() * 8 - 4),
            y: height + 15,
            targetX,
            targetY,
            vy: -Math.random() * 2 - 6,
            color,
            char,
            isLetter: true,
            spacing
          });

          // Play a gentle atmospheric click chime on launching
          dreamSynth.triggerTwinkleFeedback();
        }, i * 380); // Staggered delays generate a gorgeous sweeping effect
      }
    };

    // Sequence coordinator loop: triggers entire "HAPPY" "BIRTHDAY" "SAYANG" sequentially
    const runGrandFinaleSequence = () => {
      if (!isMounted.current) return;

      // 1. HAPPY (Pink rose)
      launchWordSequence("HAPPY", height * 0.28, "rgba(244, 63, 94, 1)");

      // 2. BIRTHDAY (Golden orange) after 3.2 seconds
      setTimeout(() => {
        if (isMounted.current) {
          launchWordSequence("BIRTHDAY", height * 0.46, "rgba(245, 158, 11, 1)");
        }
      }, 3200);

      // 3. SAYANG (Violet lavender) after 7.2 seconds
      setTimeout(() => {
        if (isMounted.current) {
          launchWordSequence("SAYANG", height * 0.64, "rgba(168, 85, 247, 1)");
        }
      }, 7200);
    };

    // Run immediately on entry and schedule on an infinite 15-second loop
    const initialDelay = setTimeout(runGrandFinaleSequence, 800);
    const loopInterval = setInterval(runGrandFinaleSequence, 15000);

    let animationId: number;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // 1. Render Sky Lanterns
      lanterns.forEach((l) => {
        l.y += l.vy;
        l.x = l.targetX + Math.sin(frameCount * l.swaySpeed + l.seed) * l.swayAmount;

        // Reset when lantern floats out of boundaries
        if (l.y < -40) {
          l.y = height + Math.random() * 100 + 20;
          l.targetX = Math.random() * width;
          l.vy = -Math.random() * 0.5 - 0.3;
          l.size = Math.random() * 7 + 5;
          l.alpha = Math.random() * 0.4 + 0.5;
        }

        // Draw Sky Lantern with glowing paper body
        ctx.save();
        ctx.globalAlpha = l.alpha;

        // Radial outer glowing flame aura
        const glowRad = l.size * 2.2;
        const radGrad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, glowRad);
        radGrad.addColorStop(0, 'rgba(255, 253, 230, 1)');
        radGrad.addColorStop(0.2, 'rgba(253, 224, 71, 0.75)'); // bright gold
        radGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.45)');  // orange aura
        radGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(l.x, l.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Main cylindrical lantern paper frame
        ctx.fillStyle = 'rgba(254, 215, 170, 0.85)'; // Peach-yellow soft paper
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
        ctx.lineWidth = 0.8;

        const w = l.size;
        const h = l.size * 1.35;
        const rx = l.x - w / 2;
        const ry = l.y - h / 2;

        ctx.beginPath();
        ctx.moveTo(rx + 1.5, ry);
        ctx.lineTo(rx + w - 1.5, ry);
        ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + 1.5);
        ctx.lineTo(rx + w - 0.5, ry + h - 1.5);
        ctx.lineTo(rx + 0.5, ry + h - 1.5);
        ctx.lineTo(rx, ry + 1.5);
        ctx.quadraticCurveTo(rx, ry, rx + 1.5, ry);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing candle flame sitting at bottom base
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(l.x, ry + h - 2.5, w * 0.22, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 2. Render Random Ambient Fireworks to keep the festival sky continuously alive
      if (Math.random() < 0.008 && rockets.filter(r => !r.isLetter).length < 2) {
        createRandomFirework();
      }

      // 3. Update & Draw Active Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy += 0.04; // Deceleration glide upwards

        // Draw rocket bright path core
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Soft visual spark trail trailing rocket engine
        ctx.strokeStyle = r.color.replace('1)', '0.35)');
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y - r.vy * 1.4);
        ctx.stroke();

        // Trigger burst on reaching apex altitude
        if (r.vy >= -0.2 || r.y <= r.targetY) {
          if (r.isLetter && r.char) {
            explodeLetter(r.targetX, r.targetY, r.char, r.color, r.spacing || 8);
          } else {
            explodeNormal(r.targetX, r.targetY, r.color);
          }
          rockets.splice(i, 1);
        }
      }

      // 4. Update & Draw Normal Fireworks Sparks
      for (let i = normalSparks.length - 1; i >= 0; i--) {
        const s = normalSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.038; // Mild gravity pull
        s.vx *= 0.975; // Atmospheric friction
        s.alpha -= s.decay;

        if (s.alpha > 0) {
          ctx.fillStyle = s.color.replace('1)', `${s.alpha})`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          normalSparks.splice(i, 1);
        }
      }

      // 5. Update & Draw Constellation Word Sparks (Forms "HAPPY BIRTHDAY SAYANG")
      for (let i = letterSparks.length - 1; i >= 0; i--) {
        const s = letterSparks[i];

        if (s.progress < 1.0) {
          s.progress += s.speed;
          // Cubic ease-out expansion provides pristine formation alignment without physical drift distortion
          const t = 1 - Math.pow(1 - s.progress, 3);
          s.x = s.centerX + s.targetOffsetX * t;
          s.y = s.centerY + s.targetOffsetY * t;
        } else {
          // Linger behavior: gentle cosmic sway and featherweight gravity fall
          s.x += Math.sin(frameCount * 0.04 + s.seed) * 0.12;
          s.y += 0.08;
          s.alpha -= s.decay;
        }

        if (s.alpha > 0) {
          // Double layered high-performance glow engine (avoids slow ctx.shadowBlur)
          ctx.fillStyle = s.color.replace('1)', `${s.alpha * 0.28})`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.8, 0, Math.PI * 2);
          ctx.fill();

          // Core stellar particle (includes soft twinkle animation)
          if (Math.sin(frameCount * 0.08 * s.twinkleSpeed) > -0.45) {
            ctx.fillStyle = s.color.replace('1)', `${s.alpha})`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          letterSparks.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Responsive adaptation on window resizing
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Click anywhere to launch user responsive fireworks
    const handleClick = (e: MouseEvent) => {
      createRandomFirework(e.clientX, e.clientY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(initialDelay);
      clearInterval(loopInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between py-12 px-4 md:px-8 z-10 select-none overflow-hidden bg-slate-950">
      
      {/* High-Performance Atmospheric Celestial Canvas */}
      <canvas
        ref={fireworksCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
      />

      {/* 1. Header: Elegant Minimalist Constellation Crest */}
      <div className="flex flex-col items-center mt-4 z-10 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-300/20 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(244,63,94,0.18)]"
        >
          <Heart size={18} fill="#f43f5e" stroke="none" className="animate-pulse" />
        </motion.div>
        <span className="font-sans text-[10px] tracking-[0.45em] uppercase text-rose-200/50 font-bold text-center">
          The Sky of Eternal Wishes
        </span>
      </div>

      {/* 2. Middle Spacer to allow the fireworks to float freely un-obstructed */}
      <div className="flex-1" />

      {/* 3. Action Restart Controls */}
      <div className="flex flex-col items-center gap-4 mb-6 z-20">
        <span className="text-[10px] font-sans text-orange-200/40 uppercase tracking-[0.25em] animate-pulse">
          ✨ Tap the sky to launch spark chimes ✨
        </span>
        <motion.button
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          onClick={() => {
            dreamSynth.triggerTwinkleFeedback();
            onRestart();
          }}
          className="px-6 py-3 rounded-full bg-slate-900/75 hover:bg-slate-900/90 border border-white/10 hover:border-white/20 text-orange-200/80 hover:text-white font-sans text-xs tracking-[0.22em] uppercase font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={12} />
          Replay Our Story
        </motion.button>
      </div>

    </div>
  );
};

export default LanternFinale;
