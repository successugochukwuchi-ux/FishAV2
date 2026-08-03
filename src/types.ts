export type VoiceGender = 'male' | 'female' | 'neutral';

export type VoiceCategory = 
  | 'preset' 
  | 'narration' 
  | 'conversational' 
  | 'expressive' 
  | 'anime' 
  | 'character' 
  | 'custom';

export interface Voice {
  id: string;
  name: string;
  gender: VoiceGender;
  category: VoiceCategory;
  tags: string[];
  language: string;
  description: string;
  sampleText?: string;
  modelId?: string; // Custom model ID if specified
  isPreset?: boolean;
  isFavorite?: boolean;
  avatarColor?: string;
}

export interface EmotionTag {
  tag: string;           // e.g. "[happy]", "[whispering]"
  label: string;         // e.g. "Happy / Upbeat"
  category: 'emotion' | 'tone' | 'action' | 'narrative';
  description: string;
  color: string;         // Tailwind color badge style
  example: string;
}

export type ChunkStatus = 'pending' | 'generating' | 'completed' | 'error';

export interface ScriptChunk {
  id: string;
  index: number;
  text: string;
  charCount: number;
  status: ChunkStatus;
  audioBlob?: Blob;
  audioUrl?: string;
  durationSeconds?: number;
  sizeBytes?: number;
  errorMessage?: string;
}

export interface GenerationProject {
  id: string;
  title: string;
  fullScript: string;
  voiceId: string;
  voiceName: string;
  modelId: string;
  createdAt: number;
  charCount: number;
  chunkCount: number;
  chunkSizeLimit: number;
  chunks: ScriptChunk[];
  mergedAudioBlob?: Blob;
  mergedAudioUrl?: string;
  totalDurationSeconds?: number;
  status: 'idle' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
}

export interface OpenRouterTTSPayload {
  text: string;
  voice: string;
  model?: string;
  apiKey?: string;
  response_format?: string;
}

export interface CustomVoiceModel {
  id: string;
  name: string;
  modelId: string;
  voiceTag: string;
  category: VoiceCategory;
  description: string;
  addedAt: number;
}
