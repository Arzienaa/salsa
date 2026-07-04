import React, { useEffect, useRef } from 'react';

interface MagicalCanvasProps {
  scene: number; // 0: Landing, 1: Forest, 2: Observatory, 3: Library, 4: Envelope, 5: Starry Night, 6: Scrapbook
}

export const MagicalCanvas: React.FC<MagicalCanvasProps> = ({ scene }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; lastX: number; lastY: number }>({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    lastX: -1000,
    lastY: -1000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle Classes
    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      blinkSpeed: number;
      phase: number;
    }

    interface Petal {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotationSpeed: number;
      alpha: number;
      color: string;
    }

    interface Lantern {
      x: number;
      y: number;
      size: number;
      speedY: number;
      swayOffset: number;
      swaySpeed: number;
      swayRange: number;
      alpha: number;
      glowSize: number;
    }

    interface Firefly {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    // Initialize arrays
    let stars: Star[] = [];
    let petals: Petal[] = [];
    let lanterns: Lantern[] = [];
    let fireflies: Firefly[] = [];

    const initParticles = () => {
      stars = [];
      petals = [];
      lanterns = [];
      fireflies = [];

      // Stars (Universal background) - Extra dense during Observatory (2) and Finale (7)
      const starCount = scene === 2 || scene === 7 ? 200 : 70;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          blinkSpeed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Petals (Scenes 0: Opening, 4: Love Letter, 7: Finale)
      if ([0, 4, 7].includes(scene)) {
        const petalCount = scene === 4 ? 40 : 20;
        for (let i = 0; i < petalCount; i++) {
          petals.push(createPetal(true));
        }
      }

      // Lanterns
      // In scene 0, a few distant floating lanterns.
      // In scene 7 (Lantern Finale Celebration), hundreds of lanterns rise!
      const lanternCount = scene === 7 ? 135 : scene === 0 ? 15 : 6;
      for (let i = 0; i < lanternCount; i++) {
        lanterns.push(createLantern(scene === 7 ? false : true)); 
      }

      // Fireflies (Scene 3: Birthday Cakes, Scene 6: Memory Forest)
      if ([3, 6].includes(scene)) {
        const fireflyCount = scene === 6 ? 40 : 18;
        for (let i = 0; i < fireflyCount; i++) {
          fireflies.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            alpha: Math.random() * 0.6 + 0.2,
            pulseSpeed: Math.random() * 0.04 + 0.01,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const createPetal = (randomY = false): Petal => {
      const colors = [
        'rgba(244, 143, 177, 0.6)', // soft pink
        'rgba(240, 98, 146, 0.5)',  // deeper rose
        'rgba(255, 205, 210, 0.6)', // blush pink
        'rgba(252, 228, 236, 0.4)', // ultra soft
      ];
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20,
        size: Math.random() * 8 + 4,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: (Math.random() - 0.3) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        alpha: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const createLantern = (randomY = false): Lantern => {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 200 + 50,
        size: Math.random() * 12 + 6,
        speedY: Math.random() * 0.4 + 0.2,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.015 + 0.005,
        swayRange: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.4,
        glowSize: Math.random() * 20 + 15,
      };
    };

    initParticles();

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    // Mouse interactive movement
    const handleMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.x = e.clientX;
      m.y = e.clientY;
      if (m.lastX !== -1000) {
        m.vx = m.x - m.lastX;
        m.vy = m.y - m.lastY;
      }
      m.lastX = m.x;
      m.lastY = m.y;
    };

    const handleMouseLeave = () => {
      const m = mouseRef.current;
      m.x = -1000;
      m.y = -1000;
      m.vx = 0;
      m.vy = 0;
      m.lastX = -1000;
      m.lastY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Render loop
    const render = () => {
      if (!ctx || !canvas) return;

      // Draw beautiful scene-specific canvas background gradients
      // This forms the core backdrop overlay
      ctx.clearRect(0, 0, width, height);

      const m = mouseRef.current;
      // Decay mouse velocity slowly
      m.vx *= 0.95;
      m.vy *= 0.95;

      // 1. Draw Background Sky Gradient based on scene
      let grad = ctx.createLinearGradient(0, 0, 0, height);
      if (scene === 0) {
        // Sunset Landing
        grad.addColorStop(0, '#1a103c'); // deep purple
        grad.addColorStop(0.5, '#441d4f'); // warm violet
        grad.addColorStop(1, '#9e5251'); // dusty sunset peach
      } else if (scene === 1) {
        // Voice Message - Romantic warm space dust
        grad.addColorStop(0, '#0d0722');
        grad.addColorStop(0.6, '#2a0e35');
        grad.addColorStop(1, '#532b45');
      } else if (scene === 2) {
        // Sky Observatory - Infinite cosmic deep
        grad.addColorStop(0, '#040314');
        grad.addColorStop(0.6, '#090826');
        grad.addColorStop(1, '#1b123a');
      } else if (scene === 3) {
        // Birthday Cakes - Cozy magical twilight with a hint of warmth
        grad.addColorStop(0, '#0b0b1a');
        grad.addColorStop(0.7, '#15122c');
        grad.addColorStop(1, '#331d2c'); // cozy wine-red tint
      } else if (scene === 4) {
        // Envelope Letter - Tender sunset blush
        grad.addColorStop(0, '#150f28');
        grad.addColorStop(0.6, '#31173d');
        grad.addColorStop(1, '#663953'); // soft rose gold
      } else if (scene === 5 || scene === 6) {
        // Forest Transition & Memory Forest - Deep magic twilight forest
        grad.addColorStop(0, '#0a091a');
        grad.addColorStop(0.5, '#13112b');
        grad.addColorStop(1, '#08252a'); // deep forest teal
      } else {
        // Lantern Finale - Complete starry midnight
        grad.addColorStop(0, '#030212');
        grad.addColorStop(0.5, '#070624');
        grad.addColorStop(1, '#150f2f');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Stars
      stars.forEach((star) => {
        star.phase += star.blinkSpeed;
        const alpha = Math.max(0.1, star.alpha + Math.sin(star.phase) * 0.15);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Very slight movement for celestial parallax
        star.y += 0.02;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      });

      // 3. Draw Fireflies
      fireflies.forEach((ff) => {
        ff.pulsePhase += ff.pulseSpeed;
        const currentAlpha = Math.max(0.1, ff.alpha + Math.sin(ff.pulsePhase) * 0.3);

        // Brown movement
        ff.vx += (Math.random() - 0.5) * 0.15;
        ff.vy += (Math.random() - 0.5) * 0.15;
        // speed limit
        ff.vx = Math.max(-0.6, Math.min(0.6, ff.vx));
        ff.vy = Math.max(-0.6, Math.min(0.6, ff.vy));

        ff.x += ff.vx;
        ff.y += ff.vy;

        // Boundaries
        if (ff.x < 0) ff.x = width;
        if (ff.x > width) ff.x = 0;
        if (ff.y < 0) ff.y = height;
        if (ff.y > height) ff.y = 0;

        // Draw glow
        const glowRad = ff.size * 5;
        const ffGrad = ctx.createRadialGradient(ff.x, ff.y, ff.size * 0.2, ff.x, ff.y, glowRad);
        ffGrad.addColorStop(0, `rgba(212, 251, 121, ${currentAlpha})`);
        ffGrad.addColorStop(0.4, `rgba(212, 251, 121, ${currentAlpha * 0.4})`);
        ffGrad.addColorStop(1, 'rgba(212, 251, 121, 0)');

        ctx.fillStyle = ffGrad;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha + 0.2})`;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Rising Lanterns
      lanterns.forEach((lantern) => {
        // Lantern floats up
        lantern.y -= lantern.speedY;

        // Sway left and right
        lantern.swayOffset += lantern.swaySpeed;
        let currentX = lantern.x + Math.sin(lantern.swayOffset) * lantern.swayRange * 10;

        // Interactive mouse wind force
        if (m.x !== -1000) {
          const dx = currentX - m.x;
          const dy = lantern.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            // Push lantern gently based on mouse movement speed
            const force = (180 - dist) / 180;
            lantern.x += (dx / dist) * force * 1.5 + m.vx * 0.1;
            lantern.y += m.vy * 0.05; // light vertical push
          }
        }

        // Wrap around screen boundaries
        if (lantern.y < -50) {
          lantern.y = height + 50 + Math.random() * 100;
          lantern.x = Math.random() * width;
          lantern.speedY = Math.random() * 0.4 + 0.2;
        }
        if (lantern.x < -50) lantern.x = width + 50;
        if (lantern.x > width + 50) lantern.x = -50;

        // Draw glowing aura behind lantern
        const glowRad = lantern.glowSize;
        const auraGrad = ctx.createRadialGradient(currentX, lantern.y, lantern.size * 0.2, currentX, lantern.y, glowRad);
        // Soft candle warmth
        auraGrad.addColorStop(0, `rgba(253, 186, 116, ${lantern.alpha})`);
        auraGrad.addColorStop(0.3, `rgba(251, 146, 60, ${lantern.alpha * 0.5})`);
        auraGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(currentX, lantern.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Draw the physical lantern box structure
        ctx.save();
        ctx.translate(currentX, lantern.y);
        // Slight organic tilt depending on sway
        ctx.rotate(Math.sin(lantern.swayOffset) * 0.06);

        // Outer parchment box
        ctx.fillStyle = 'rgba(254, 215, 170, 0.9)'; // rich cream
        ctx.strokeStyle = 'rgba(120, 53, 4, 0.4)'; // soft wood trim
        ctx.lineWidth = 1;

        const w = lantern.size;
        const h = lantern.size * 1.3;

        // Draw rectangle with rounded bottom
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.lineTo(w / 2, h / 2 - 2);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - 2, h / 2);
        ctx.lineTo(-w / 2 + 2, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Warm fiery inner candle core
        const coreGrad = ctx.createLinearGradient(0, h / 2, 0, -h / 4);
        coreGrad.addColorStop(0, 'rgba(239, 68, 68, 0.9)'); // bright red base
        coreGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.95)'); // orange
        coreGrad.addColorStop(1, 'rgba(253, 224, 71, 0.95)'); // bright yellow top
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, h / 3, w * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Tiny wood frames (top & bottom thin lines)
        ctx.fillStyle = 'rgba(120, 53, 4, 0.7)';
        ctx.fillRect(-w / 2, -h / 2, w, 1.5); // top bar
        ctx.fillRect(-w / 2, h / 2 - 1.5, w, 1.5); // bottom bar

        ctx.restore();
      });

      // 5. Draw Falling Petals
      petals.forEach((petal) => {
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.2; // organic floating side-to-side
        petal.rotation += petal.rotationSpeed;

        // Wind interaction from mouse
        if (m.x !== -1000) {
          const dx = petal.x - m.x;
          const dy = petal.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            petal.x += (dx / dist) * force * 2.0 + m.vx * 0.15;
            petal.y += (dy / dist) * force * 1.0 + m.vy * 0.1;
          }
        }

        // Boundaries recycle
        if (petal.y > height + 20 || petal.x < -20 || petal.x > width + 20) {
          Object.assign(petal, createPetal(false));
        }

        // Draw petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);

        ctx.fillStyle = petal.color;
        ctx.shadowColor = 'rgba(244, 143, 177, 0.3)';
        ctx.shadowBlur = 4;

        // Drawing a curved organic petal shape using path
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-petal.size / 2, -petal.size / 2, -petal.size, petal.size / 3, 0, petal.size);
        ctx.bezierCurveTo(petal.size, petal.size / 3, petal.size / 2, -petal.size / 2, 0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup functions
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scene]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      id="magical_particle_canvas"
    />
  );
};
