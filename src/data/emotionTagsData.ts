import { EmotionTag } from '../types';

export const EMOTION_TAGS: EmotionTag[] = [
  {
    tag: '[happy]',
    label: 'Happy',
    category: 'emotion',
    description: 'Upbeat, joyful and enthusiastic tone',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    example: 'Hello everyone! [happy] I am so glad to share this news with you today.'
  },
  {
    tag: '[excited]',
    label: 'Excited',
    category: 'emotion',
    description: 'High energy, vibrant and passionate delivery',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    example: 'Wait until you see this! [excited] This changes everything we knew.'
  },
  {
    tag: '[whispering]',
    label: 'Whispering',
    category: 'tone',
    description: 'Soft, intimate, secret-sharing whisper voice',
    color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    example: 'Keep quiet. [whispering] We don\'t want anyone to hear us coming.'
  },
  {
    tag: '[sad]',
    label: 'Sad',
    category: 'emotion',
    description: 'Melancholic, solemn, soft and emotional delivery',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    example: 'It was a quiet evening. [sad] I still miss those golden summer days.'
  },
  {
    tag: '[angry]',
    label: 'Angry',
    category: 'emotion',
    description: 'Intense, stern, sharp and demanding tone',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    example: 'How could this happen? [angry] I explicitly asked you to prepare for this!'
  },
  {
    tag: '[calm]',
    label: 'Calm',
    category: 'tone',
    description: 'Relaxed, soothing, steady meditation tone',
    color: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    example: 'Take a deep breath. [calm] Feel the stillness around you as you release tension.'
  },
  {
    tag: '[serious]',
    label: 'Serious',
    category: 'narrative',
    description: 'Authoritative, firm and important announcement style',
    color: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    example: 'Attention please. [serious] The project deadline has been moved forward.'
  },
  {
    tag: '[surprised]',
    label: 'Surprised',
    category: 'emotion',
    description: 'Astonished, bewildered or shocked reaction',
    color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    example: 'Are you kidding me? [surprised] I never expected to find this here!'
  },
  {
    tag: '[curious]',
    label: 'Curious',
    category: 'tone',
    description: 'Inquisitive, wondering, intriguing vocal inflection',
    color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    example: 'What lies beyond that horizon? [curious] Let us explore together.'
  },
  {
    tag: '[fearful]',
    label: 'Fearful',
    category: 'emotion',
    description: 'Tense, nervous, trembling or anxious voice',
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    example: 'Did you hear that sound in the dark? [fearful] Something is watching us.'
  },
  {
    tag: '[laughing]',
    label: 'Laughing',
    category: 'action',
    description: 'Light chuckle, giggling, humorous delivery',
    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    example: 'Oh stop it! [laughing] That is the funniest thing I have heard all week!'
  },
  {
    tag: '[narrator]',
    label: 'Narrator',
    category: 'narrative',
    description: 'Cinematic audiobook narrator tone',
    color: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    example: 'Once upon a time in a distant kingdom, [narrator] a small spark lit up the dark.'
  },
  {
    tag: '[sigh]',
    label: 'Sigh',
    category: 'action',
    description: 'Exhale / weary or relaxed pause before speaking',
    color: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    example: 'It was a long day. [sigh] Finally time to rest and reset.'
  },
  {
    tag: '[affectionate]',
    label: 'Affectionate',
    category: 'emotion',
    description: 'Warm, caring, loving and gentle voice',
    color: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    example: 'You have worked so hard. [affectionate] I am so proud of everything you achieved.'
  }
];
