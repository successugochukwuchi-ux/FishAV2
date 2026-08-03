import { Voice } from '../types';

export const PRESET_VOICES: Voice[] = [
  {
    id: 'ca3007f96ae7499ab87d27ea3599956a',
    name: 'Alex (Default)',
    gender: 'male',
    category: 'preset',
    tags: ['Natural', 'Male', 'Conversational', 'Warm', 'English'],
    language: 'English (US)',
    description: 'Natural male voice model suitable for podcasts, tutorials, and clear voiceovers.',
    sampleText: 'Welcome to Fish Audio S2.1 Pro! [happy] Ready to narrate your text with natural expression.',
    modelId: 'ca3007f96ae7499ab87d27ea3599956a',
    isPreset: true,
    avatarColor: 'from-blue-600 to-cyan-500'
  },
  {
    id: '7f96ae7499ab87d27ea3599956aca300',
    name: 'Anna (Narrative)',
    gender: 'female',
    category: 'preset',
    tags: ['Natural', 'Female', 'Friendly', 'Clear', 'English'],
    language: 'English (US)',
    description: 'Natural female voice model with friendly, articulated tone for video guides and ads.',
    sampleText: 'Hi there! I am Anna. [happy] Let us create an engaging voiceover together.',
    modelId: '7f96ae7499ab87d27ea3599956aca300',
    isPreset: true,
    avatarColor: 'from-pink-500 to-rose-400'
  },
  {
    id: '3599956aca3007f96ae7499ab87d27ea',
    name: 'Benjamin (Deep Lore)',
    gender: 'male',
    category: 'preset',
    tags: ['Deep', 'Male', 'Narration', 'Cinematic', 'Audiobook'],
    language: 'English (UK)',
    description: 'Deep, rich male narration voice model tailored for documentaries, audiobooks, and lore.',
    sampleText: 'Deep in the heart of the ancient forest, [whispering] secrets lay hidden for centuries.',
    modelId: '3599956aca3007f96ae7499ab87d27ea',
    isPreset: true,
    avatarColor: 'from-amber-600 to-orange-500'
  },
  {
    id: '8d27ea3599956aca3007f96ae7499ab',
    name: 'Eva (Expressive)',
    gender: 'female',
    category: 'preset',
    tags: ['Expressive', 'Female', 'Emotional', 'Vibrant', 'Storyteller'],
    language: 'English (US)',
    description: 'Highly expressive female voice model with rich dynamic emotion tag performance.',
    sampleText: 'Listen closely! [excited] Every emotion comes alive with Fish Audio S2.1 Pro.',
    modelId: '8d27ea3599956aca3007f96ae7499ab',
    isPreset: true,
    avatarColor: 'from-purple-600 to-indigo-500'
  }
];

export const CATALOG_VOICES: Voice[] = [
  ...PRESET_VOICES,
  {
    id: 'morgan_storyteller',
    name: 'Morgan',
    gender: 'male',
    category: 'narration',
    tags: ['Narrator', 'Epic', 'Resonant', 'Documentary'],
    language: 'English (US)',
    description: 'Resonant narrator with commanding presence for trailers and cinematic voiceovers.',
    sampleText: 'In a world governed by silence, [serious] one voice resonated across the digital divide.',
    modelId: 'ca3007f96ae7499ab87d27ea3599956a',
    avatarColor: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'chloe_vlog',
    name: 'Chloe',
    gender: 'female',
    category: 'conversational',
    tags: ['Casual', 'Upbeat', 'Social Media', 'YouTube'],
    language: 'English (US)',
    description: 'Energetic, modern female voice ideal for short-form content, YouTube videos, and vlogs.',
    sampleText: 'Hey guys, [happy] welcome back to another episode! Don\'t forget to hit that like button.',
    modelId: 'ca3007f96ae7499ab87d27ea3599956a',
    avatarColor: 'from-fuchsia-500 to-pink-500'
  },
  {
    id: 'hikari_anime',
    name: 'Hikari',
    gender: 'female',
    category: 'anime',
    tags: ['Anime', 'Cute', 'Energetic', 'Character'],
    language: 'Japanese / English',
    description: 'Vibrant anime style voice actor perfect for gaming, virtual assistants, and character lines.',
    sampleText: 'Konnichiwa! [excited] Let us embark on an extraordinary journey together!',
    modelId: 'ca3007f96ae7499ab87d27ea3599956a',
    avatarColor: 'from-rose-500 to-amber-400'
  },
  {
    id: 'kaito_cyber',
    name: 'Kaito',
    gender: 'male',
    category: 'character',
    tags: ['Cyberpunk', 'Grit', 'Action', 'Gaming'],
    language: 'English (US)',
    description: 'Grit and gravel sci-fi gaming protagonist voice with intense emotional range.',
    sampleText: 'Lock and load. [serious] We only get one shot at taking down the mainframe.',
    modelId: 'ca3007f96ae7499ab87d27ea3599956a',
    avatarColor: 'from-blue-600 to-violet-600'
  },
  {
    id: 'seraphina_calm',
    name: 'Seraphina',
    gender: 'female',
    category: 'expressive',
    tags: ['Soothing', 'Meditation', 'ASMR', 'Gentle'],
    language: 'English (UK)',
    description: 'Soothing, delicate vocal delivery for sleep stories, meditation apps, and relaxed listening.',
    sampleText: 'Close your eyes. [calm] Allow the gentle waves of breath to steady your focus.',
    modelId: 'ca3007f96ae7499ab87d27ea3599956a',
    avatarColor: 'from-sky-500 to-teal-400'
  },
  {
    id: 'marcus_tech',
    name: 'Marcus',
    gender: 'male',
    category: 'conversational',
    tags: ['Tech', 'Professional', 'Corporate', 'Explainer'],
    language: 'English (US)',
    description: 'Crisp, articulate corporate spokesman voice for product demos, B2B presentations, and tutorials.',
    sampleText: 'Our next-generation architecture delivers unparalleled scalability for modern web apps.',
    modelId: 'ca3007f96ae7499ab87d27ea3599956a',
    avatarColor: 'from-slate-600 to-zinc-500'
  }
];
