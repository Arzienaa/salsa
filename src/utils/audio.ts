// Procedural Dream Synth using Web Audio API
class DreamSynth {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private chordInterval: any = null;
  private twinkleInterval: any = null;
  private currentChordIndex: number = 0;
  private isMuted: boolean = false;
  private disableChords: boolean = false;
  private bgAudio: HTMLAudioElement | null = null;
  private bgAudioExists: boolean = false;

  // G Major Pentatonic frequencies
  private scale = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77];

  // Dreamy chord progression: Gmaj7, Cadd9, Em9, Dadd4
  private chords = [
    [196.00, 293.66, 392.00, 493.88, 587.33], // G major chord
    [261.63, 329.63, 392.00, 523.25, 587.33], // C major (Cadd9)
    [164.81, 293.66, 329.63, 392.00, 587.33], // E minor (Em9)
    [146.83, 220.00, 293.66, 440.00, 587.33]  // D major (Dadd4)
  ];

  constructor() {
    this.checkBgAudio();
  }

  private checkBgAudio() {
    if (typeof window === 'undefined') return;
    fetch('/audio/background.mp3', { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          this.bgAudioExists = true;
          this.setDisableChords(true);
          this.bgAudio = new Audio('/audio/background.mp3');
          this.bgAudio.loop = true;
          this.bgAudio.volume = this.isMuted ? 0 : 0.25;
          if (this.isPlaying && !this.isMuted) {
            this.bgAudio.play().catch(e => console.log("Bg audio play failed:", e));
          }
        }
      })
      .catch(() => {
        this.bgAudioExists = false;
        this.setDisableChords(false);
      });
  }

  init() {
    if (this.ctx) return;
    
    // Create AudioContext safely on user gesture
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(2000, this.ctx.currentTime); // default open filter
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime); // default comfortable volume

    // Connect nodes
    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Start background audio if it exists
    if (this.bgAudioExists && this.bgAudio) {
      this.bgAudio.volume = this.isMuted ? 0 : 0.25;
      this.bgAudio.play().catch(e => console.log("Bg play error:", e));
    }

    // Start ambient chord progression loop
    this.playNextChord();
    this.chordInterval = setInterval(() => {
      this.playNextChord();
    }, 6000); // New chord every 6 seconds

    // Start gentle random twinkling chimes
    this.twinkleInterval = setInterval(() => {
      if (Math.random() > 0.4 && !this.isMuted) {
        this.triggerRandomTwinkle();
      }
    }, 2500);
  }

  public setDisableChords(disable: boolean) {
    this.disableChords = disable;
  }

  private playNextChord() {
    if (!this.ctx || this.isMuted || this.disableChords) return;

    const chord = this.chords[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

    const now = this.ctx.currentTime;

    // Trigger each note in the chord with a slight stagger (strum effect)
    chord.forEach((freq, idx) => {
      const stagger = idx * 0.12;
      this.playPianoNote(freq, now + stagger, 5.0, 0.08);
    });
  }

  private playPianoNote(freq: number, startTime: number, duration: number, volume: number) {
    if (!this.ctx || !this.filterNode) return;

    // Base Oscillator (soft triangle)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Warm Sub Oscillator (sine) for lower notes
    let osc2: OscillatorNode | null = null;
    if (freq < 300) {
      osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq, startTime);
    }

    // High shimmer for texture
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2, startTime);

    // Envelope
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0, startTime);
    // Soft attack
    noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.4);
    // Long dreamy decay
    noteGain.gain.setValueAtTime(volume, startTime + duration - 2.5);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Connections
    osc1.connect(noteGain);
    if (osc2) osc2.connect(noteGain);
    osc3.connect(noteGain);
    
    noteGain.connect(this.filterNode);

    // Start & Stop
    osc1.start(startTime);
    osc1.stop(startTime + duration);
    if (osc2) {
      osc2.start(startTime);
      osc2.stop(startTime + duration);
    }
    osc3.start(startTime);
    osc3.stop(startTime + duration);
  }

  private triggerRandomTwinkle() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Choose a high note from G Major Pentatonic
    const highNotes = this.scale.slice(7);
    const freq = highNotes[Math.floor(Math.random() * highNotes.length)];
    this.playTwinkleNote(freq, now, 3.0, 0.04);
  }

  public playTwinkleNote(freq: number, startTime: number, duration: number, volume: number) {
    if (!this.ctx || !this.filterNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Twinkle chimes envelope - immediate attack, rapid decay with ringing tails
    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0, startTime);
    chimeGain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(chimeGain);
    chimeGain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Plays a harmonious twinkle chime when clicking something
  public triggerTwinkleFeedback() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 659.25, 783.99, 880.00, 987.77];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    this.playTwinkleNote(freq, now, 2.0, 0.07);
    
    // Play a secondary higher harmonizing note shortly after
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const secondFreq = freq * 1.5; // Perfect fifth
      this.playTwinkleNote(secondFreq, this.ctx.currentTime, 1.5, 0.04);
    }, 100);
  }

  // Plays a beautiful celebratory birthday chime when candles are blown out
  public playBirthdayArpeggio() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Frequencies for a sweet, sparkling "Happy Birthday" short phrase: G5, G5, A5, G5, C6, B5
    const notes = [392.00, 392.00, 440.00, 392.00, 523.25, 493.88];
    const timings = [0, 0.15, 0.3, 0.5, 0.7, 0.9];
    notes.forEach((freq, i) => {
      this.playTwinkleNote(freq, now + timings[i], 1.5, 0.08);
    });
  }

  // Plays a mechanical, satisfying click sound for typewriter keys
  public playTypewriterClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Low woody click
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(150 + Math.random() * 40, now);
    
    // High metal snap
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400 + Math.random() * 200, now);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.025, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc1.connect(clickGain);
    osc2.connect(clickGain);
    clickGain.connect(this.filterNode || this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.04);
    osc2.start(now);
    osc2.stop(now + 0.04);
  }

  // Plays a beautiful mechanical bell sound for line endings / returns
  public playTypewriterBell() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freq = 1864.66; // High Bb6 bell sound

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const bellGain = this.ctx.createGain();
    bellGain.gain.setValueAtTime(0.06, now);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(bellGain);
    bellGain.connect(this.filterNode || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Adjust volume levels (e.g. muffle/silence during envelope, or full bloom during lantern flight)
  public setCozyMode(isCozy: boolean) {
    if (!this.ctx || !this.masterGain || !this.filterNode) return;
    
    const now = this.ctx.currentTime;
    if (isCozy) {
      // Quiet down and apply lowpass filter to make it feel muffled, warm, and intimate
      this.masterGain.gain.exponentialRampToValueAtTime(0.12, now + 1.5);
      this.filterNode.frequency.exponentialRampToValueAtTime(600, now + 1.5);
      if (this.bgAudio) {
        this.bgAudio.volume = this.isMuted ? 0 : 0.08;
      }
    } else {
      // Return to full, luminous dynamic range
      this.masterGain.gain.exponentialRampToValueAtTime(0.35, now + 1.0);
      this.filterNode.frequency.exponentialRampToValueAtTime(2200, now + 1.0);
      if (this.bgAudio) {
        this.bgAudio.volume = this.isMuted ? 0 : 0.25;
      }
    }
  }

  // Keep track of voice hum nodes for active cozy messages
  private voiceHumOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private voiceHumLFO: OscillatorNode | null = null;

  public playVoiceHum() {
    if (!this.ctx || this.isMuted) return;
    this.stopVoiceHum(); // Stop any existing first

    const now = this.ctx.currentTime;
    
    // Create voice hum filter to focus on soft warm midrange (vowel formants)
    const voiceFilter = this.ctx.createBiquadFilter();
    voiceFilter.type = 'bandpass';
    voiceFilter.frequency.setValueAtTime(240, now);
    voiceFilter.Q.setValueAtTime(2.2, now);
    voiceFilter.connect(this.filterNode || this.ctx.destination);

    // Warm, breathing LFO for realistic human vibrato and volume swell
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.8, now); // 5.8Hz natural vibrato
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(1.5, now); // vibrato depth (Hz)
    lfo.connect(lfoGain);
    lfo.start(now);
    this.voiceHumLFO = lfo;

    // We play a gentle sequence of humming frequencies resembling a loving, romantic lullaby
    // D3 (146.83 Hz) and A3 (220.00 Hz)
    const baseFreqs = [146.83, 220.00];
    
    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      // Triangle wave has soft, organic odd harmonics similar to a humming human mouth
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      // Connect LFO to modulate oscillator frequency (vibrato)
      lfoGain.connect(osc.frequency);

      const gainNode = this.ctx!.createGain();
      // Lower volume for harmony
      const targetVolume = idx === 0 ? 0.15 : 0.06;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(targetVolume, now + 1.2); // smooth fade in

      osc.connect(gainNode);
      gainNode.connect(voiceFilter);

      osc.start(now);
      this.voiceHumOscs.push({ osc, gain: gainNode });
    });
  }

  public stopVoiceHum() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Fade out active hum nodes smoothly to avoid abrupt clicks
    this.voiceHumOscs.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          try {
            osc.stop();
          } catch (e) {}
        }, 1000);
      } catch (err) {}
    });
    this.voiceHumOscs = [];

    if (this.voiceHumLFO) {
      try {
        this.voiceHumLFO.stop();
      } catch (e) {}
      this.voiceHumLFO = null;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    }
    if (this.bgAudio) {
      this.bgAudio.muted = this.isMuted;
      if (!this.isMuted && this.isPlaying) {
        this.bgAudio.play().catch(() => {});
      }
    }
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  stop() {
    if (this.chordInterval) clearInterval(this.chordInterval);
    if (this.twinkleInterval) clearInterval(this.twinkleInterval);
    this.isPlaying = false;
    
    if (this.bgAudio) {
      this.bgAudio.pause();
    }

    if (this.ctx) {
      this.ctx.suspend();
    }
  }
}

export const dreamSynth = new DreamSynth();
export default dreamSynth;
