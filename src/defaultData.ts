import { BirthdayConfig } from './types';

export const DEFAULT_BIRTHDAY_DATA: BirthdayConfig = {
  recipientName: 'Salsaa',
  senderName: 'Fadzlan',
  letterText: `HAAAIII SAYAANGG😝😝, selamat ulang tahun yaaahh cantiikkuuuhh🥳😘 sehaatt terus yaahh semoga panjang umur dan selalu diberikan kelancaran dalam setiap harinya, diberikan kelancaran rezekinya dan semoga diberikan perlindungan dari hal' buruk aamiiinn, btw CIEEE nambah tuaa aja nieehh 😗😗, oh iya, makasih yah sayang buat selama ini... makasih udah mau dan bertahan sama aku, maaf kalo aku sering bikin kamu marahh yahh, maaf juga aku bikin kamu kecewa dan cape sama aku😕😕... TAPIII tapi nih yaahh makasih jugaaa yaahh udaahh mau buat ngertiin aku dan mencoba buat memahami aku... ilysm sayaaaang 💐💐💐❤️❤️😘😘 makasih yaaa udah buat aku ngerasaaa diperhatiin dan ngerasa di sayangg dan makasih udaahh bikin akuu happy yaaa selama iniii😚😚 I am really grateful and happy with you, darling i love youu 💐💐❤️❤️😘😘

SEKALI LAGI SELAMAT ULANG TAHUN SAYANGKU`,
  memories: [
    {
      id: 'tree-1',
      title: 'Gemes Banget',
      type: 'photo',
      mediaUrl: '/images/memory-1.jpg',
      description: 'GEMES LUCUUU BANGET SAYANG.',
      color: 'from-emerald-400/20 to-teal-500/20'
    },
    {
      id: 'tree-2',
      title: 'Gorgeous',
      type: 'photo',
      mediaUrl: '/images/memory-2.jpg',
      description: 'Cantik banget pas lagi ngedipin mata gini, Pandai ya kamuu buat aku jatuh cinta teruss.',
      color: 'from-pink-400/20 to-rose-500/20'
    },
    {
      id: 'tree-3',
      title: 'Cantik',
      type: 'photo',
      mediaUrl: '/images/memory-3.jpg',
      description: 'CINTA BANGET.',
      color: 'from-indigo-400/20 to-violet-500/20'
    }
  ],
  stars: [
    {
      id: 'star-1',
      title: 'July 28, 2009',
      description: 'The precise celestial alignment captured at the moment Salsaa entered this world.',
      category: 'birth',
      cx: 25,
      cy: 30
    },
    {
      id: 'star-2',
      title: 'Seventeen Years Later',
      description: 'A beautiful milestone on the map of life, marked by seventeen complete orbits around the sun.',
      category: 'milestone',
      cx: 45,
      cy: 65
    },
    {
      id: 'star-3',
      title: 'The Constellation Alignment',
      description: 'A coordinate where the brightest stars align, creating a brilliant light in the northern sky.',
      category: 'wish',
      cx: 65,
      cy: 25
    },
    {
      id: 'star-4',
      title: 'Our Journey Ahead',
      description: 'Looking forward to the upcoming stellar journeys and beautiful constellations yet to be discovered.',
      category: 'future',
      cx: 85,
      cy: 55
    }
  ],
  cakes: [
    {
      id: 'cake-1',
      title: 'Strawberry Velvet Dream',
      color: 'from-pink-300 to-rose-400',
      creamColor: '#fda4af',
      candlesCount: 1,
      decorations: ['Fresh Strawberries', 'Glittering Pearls', 'Pink Ribbon frosting'],
      wish: 'A beautiful wish has been made with the first blown candle. 🍓'
    },
    {
      id: 'cake-2',
      title: 'Lavender Magic Chiffon',
      color: 'from-purple-300 to-indigo-400',
      creamColor: '#d8b4fe',
      candlesCount: 1,
      decorations: ['Lavender blooms', 'Golden Stars', 'Silver fairy dust'],
      wish: 'Your second silent wish has been successfully sent to the heavens. 🌌'
    },
    {
      id: 'cake-3',
      title: 'Midnight Caramel Sparkle',
      color: 'from-amber-300 to-orange-400',
      creamColor: '#fcd34d',
      candlesCount: 1,
      decorations: ['Caramel Drizzles', 'Magical Sparklers', 'Sweet Chocolate curls'],
      wish: 'The final candle is blown, sealing your silent birthday wishes. ✨'
    }
  ]
};
