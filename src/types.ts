export type MemoryType = 'photo' | 'voice' | 'note';

export interface MemoryItem {
  id: string;
  title: string;
  type: MemoryType;
  mediaUrl: string;
  description: string;
  fullNote?: string;
  color: string;
}

export interface StarItem {
  id: string;
  title: string;
  description: string;
  category: string;
  cx: number; // percentage width
  cy: number; // percentage height
}

export interface CakeItem {
  id: string;
  title: string;
  color: string; // e.g., 'from-pink-300 to-rose-400'
  creamColor: string; // hex/tailwind color
  candlesCount: number;
  decorations: string[];
  wish: string;
}

export interface BirthdayConfig {
  recipientName: string;
  senderName: string;
  letterText: string;
  memories: MemoryItem[];
  stars: StarItem[];
  cakes: CakeItem[];
}
