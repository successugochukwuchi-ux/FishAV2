import React from 'react';
import {
  Sparkles,
  Volume2,
  Tag,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  Radio,
  Sliders,
  CheckCircle2,
  Zap,
  Play
} from 'lucide-react';
import { PRESET_VOICES } from '../data/voicesData';
import { EMOTION_TAGS } from '../data/emotionTagsData';

interface LandingPageProps {
  onEnterStudio: () => void;
  onBrowseVoices: () => void;
  onOpenLibrary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onBrowseVoices,
  onOpenLibrary
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Fish Audio S2.1 Pro Voiceover Engine</span>
            <span className="bg-indigo-400/30 px-2 py-0.2 rounded-full text-[10px] font-mono text-indigo-100">
              Free Tier
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Expressive Neural Voiceovers with{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
              Fish Audio Model IDs & Emotion Tags
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Generate life-like human speech using Fish Audio S2.1 Pro voice model IDs (e.g.,{' '}
            <code className="text-indigo-200 font-mono bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-700/50">
              ca3007f9...
            </code>
            ). Shape vocal emotion dynamically with inline tags like{' '}
            <span className="text-indigo-300 font-bold">[happy]</span>,{' '}
            <span className="text-sky-300 font-bold">[whispering]</span>, and{' '}
            <span className="text-fuchsia-300 font-bold">[excited]</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onEnterStudio}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Enter Studio (No Login Required)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBrowseVoices}
              className="px-5 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Browse Voice Models</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Model Provider</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Fish Audio S2.1 Pro
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Voice Model IDs</span>
              <span className="font-bold text-white font-mono">32-Char Hashes Supported</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Emotion Tag Format</span>
              <span className="font-bold text-indigo-300 font-mono">[emotion] Tag Format</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Storage Engine</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Browser IndexedDB
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Core Architecture & Capabilities
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Everything you need for professional voiceover generation, script chunking, and local storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Model IDs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Fish Audio Model IDs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use standard preset voices or input custom 32-character Fish Audio voice model IDs (e.g.{' '}
              <code className="text-indigo-700 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">
                ca3007f96ae749...
              </code>
              ). Connect your favorite cloned voice models instantly.
            </p>
          </div>

          {/* Card 2: Emotion Tags */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Inline Emotion Control</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Insert brackets like <code className="text-fuchsia-700 font-mono font-bold">[happy]</code>,{' '}
              <code className="text-fuchsia-700 font-mono font-bold">[whispering]</code>, or{' '}
              <code className="text-fuchsia-700 font-mono font-bold">[laughing nervously]</code> directly into script text to shift vocal tone seamlessly.
            </p>
          </div>

          {/* Card 3: Chunk Stitching */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Smart Script Chunking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Long scripts surpassing character bounds are divided naturally at sentence boundaries, generated in parallel sequence, and stitched into a seamless master audio file.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Emotion Tags Showcase */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              <span>Supported Fish Audio Emotion Tags</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fish Audio S2 / S2.1 Pro parses bracketed descriptors to shape pitch, cadence, and vocal intensity.
            </p>
          </div>

          <button
            onClick={onEnterStudio}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try Tags in Studio</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {EMOTION_TAGS.map((emo) => (
            <div
              key={emo.tag}
              className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl text-center space-y-1 transition-colors"
            >
              <code className="text-xs font-mono font-bold text-indigo-700 block">
                {emo.tag}
              </code>
              <span className="text-[11px] font-medium text-slate-600 block">
                {emo.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Preset Voice Models Showcase */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-600" />
              <span>Sample Voice Models</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose from built-in preset profiles or add custom Fish Audio model IDs.
            </p>
          </div>

          <button
            onClick={onBrowseVoices}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Models</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {PRESET_VOICES.slice(0, 4).map((voice) => (
            <div
              key={voice.id}
              className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2 hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{voice.name}</span>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {voice.gender}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{voice.description}</p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Model ID:</span>
                <span className="text-indigo-700 font-bold truncate max-w-[110px]" title={voice.modelId}>
                  {voice.modelId ? `${voice.modelId.slice(0, 8)}...` : voice.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to create your voiceover?</h3>
        <p className="text-indigo-100 text-xs sm:text-sm max-w-xl mx-auto">
          No login required. Type or paste your script, customize your voice model ID, and export studio-quality MP3 audio directly in your browser.
        </p>
        <div className="pt-2">
          <button
            onClick={onEnterStudio}
            className="px-8 py-3.5 bg-white text-indigo-900 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Launch Studio Workspace</span>
          </button>
        </div>
      </section>
    </div>
  );
};
