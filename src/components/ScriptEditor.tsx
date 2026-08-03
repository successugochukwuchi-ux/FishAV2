import React, { useState, useRef, useMemo } from 'react';
import { EmotionTagPicker } from './EmotionTagPicker';
import { splitScriptIntoChunks, DEFAULT_CHUNK_LIMIT } from '../services/scriptSplitter';
import { Voice } from '../types';
import {
  FileText,
  Scissors,
  Wand2,
  BookOpen,
  AlignLeft,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ScriptEditorProps {
  script: string;
  setScript: (s: string) => void;
  title: string;
  setTitle: (t: string) => void;
  chunkSizeLimit: number;
  setChunkSizeLimit: (limit: number) => void;
  selectedVoice: Voice;
  onOpenVoiceBrowser: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const SAMPLE_SCRIPTS = [
  {
    title: '🎭 Expressive Emotion Demo',
    content: `Welcome to Fish Audio S2.1 Pro! [happy] I am excited to demonstrate how emotion tags bring voiceovers to life.

[whispering] Listen closely as the sound drops to a soft whisper.

Suddenly, [excited] the story erupts into pure excitement! We can shift seamless tone and feeling across every paragraph.

[sad] Even quiet melancholic moments carry authentic weight. [calm] Take a breath, and let your voice tell the story.`
  },
  {
    title: '📚 Long Script Chunking Test (>3000 Chars)',
    content: `Chapter 1: The Voyage Beyond the Meridian.

[narrator] The night air was thick with the scent of saltwater and ozone as the starship Astraea cleared the orbital ring. Captain Elena Vance adjusted her headset, watching the telemetry streams illuminate the cockpit in soft blue light.

[serious] "All engine blocks online," reported Chief Engineer Marcus over the comms channel. "Quantum drives charging to ninety-eight percent."

Elena leaned back in her high-backed chair. [thoughtful] Years of planning, sacrifice, and quiet persistence had led to this single moment. Outside the viewport, the twin moons of Calypso hung like luminous pearl spheres against a velvet abyss.

[whispering] "We are finally going home," she murmured to herself.

[excited] Suddenly, a sharp chime resonated across the console! "Warning: Proximity alert!" synthetic intelligence chimed. A cluster of unknown signals had emerged from behind the asteroid shadow belt.

[fearful] "Marcus, are you seeing this?" Elena asked, her voice steadying against the spike of adrenaline. "Those aren't planetary survey drones. Their energy signatures match nothing in our database."

[angry] "Brace for impact!" Marcus yelled as a pulse of electromagnetic kinetic force rattled the hull armor. Sparks showered from the secondary distribution node overhead.

[calm] Elena kept her cool. She tapped the emergency stabilization override sequence with practiced ease. "Rerouting backup power to deflector arrays. Hold on everyone!"

[happy] As the energy shields locked into frequency, the hull stopped shaking. The Astraea cut through the solar flare unharmed, accelerating into the deep jump corridor ahead. The crew exhaled in collective relief, gazing out as warp vectors stretched distant stars into dazzling streaks of pure white light.

[narrator] This journey was far from over, but the Astraea was bound for uncharted horizons, carried by courage, technology, and an unyielding human spirit.`
  },
  {
    title: '🚀 High Energy Commercial Ad',
    content: `[excited] Introducing the all-new Nova Sound Studio!

Are you ready to elevate your content to professional broadcast standards? [happy] With advanced neural synthesis and emotional tag control, creating studio-quality voiceovers takes seconds, not hours.

[whispering] No expensive recording gear. No endless retakes.

[serious] Just type your script, insert your preferred emotion tags, and let Fish Audio handle the rest.

[excited] Try it free today and give your story the voice it deserves!`
  }
];

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  setScript,
  title,
  setTitle,
  chunkSizeLimit,
  setChunkSizeLimit,
  selectedVoice,
  onOpenVoiceBrowser,
  onGenerate,
  isGenerating
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);

  // Calculate live chunking stats
  const chunks = useMemo(() => {
    return splitScriptIntoChunks(script, chunkSizeLimit);
  }, [script, chunkSizeLimit]);

  const charCount = script.length;
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;

  // Insert emotion tag at cursor position
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setScript(script ? `${script} ${tag} ` : `${tag} `);
      return;
    }

    const start = textareaRef.current.selectionStart || 0;
    const end = textareaRef.current.selectionEnd || 0;

    const before = script.substring(0, start);
    const after = script.substring(end);

    const spaceBefore = before.length > 0 && !before.endsWith(' ') ? ' ' : '';
    const spaceAfter = !after.startsWith(' ') ? ' ' : '';

    const newText = `${before}${spaceBefore}${tag}${spaceAfter}${after}`;
    setScript(newText);

    // Reposition cursor after tag
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = start + spaceBefore.length + tag.length + spaceAfter.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  const handleLoadSample = (content: string, sampleTitle: string) => {
    setScript(content);
    if (!title || title === 'Untitled Voiceover') {
      setTitle(sampleTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim());
    }
    setShowSamplesMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Voice Configuration Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Project Title Input */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Project Title
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Expressive Voiceover Project..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Active Voice Selector Card */}
          <div className="w-full sm:w-auto flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {selectedVoice.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedVoice.name}</p>
                <p className="text-[11px] text-slate-500 capitalize">{selectedVoice.gender} • {selectedVoice.category}</p>
              </div>
            </div>
            <button
              onClick={onOpenVoiceBrowser}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-600 text-xs font-semibold rounded-lg border border-slate-200 transition-colors whitespace-nowrap shadow-xs"
            >
              Change Voice
            </button>
          </div>
        </div>

        {/* Chunking Settings & Sample Loader Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Scissors className="w-3.5 h-3.5 text-indigo-600" />
              <span>Max Chunk Size:</span>
            </div>
            <select
              value={chunkSizeLimit}
              onChange={(e) => setChunkSizeLimit(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value={1000}>1,000 chars</option>
              <option value={1500}>1,500 chars</option>
              <option value={2000}>2,000 chars</option>
              <option value={2500}>2,500 chars</option>
              <option value={3000}>3,000 chars (Default)</option>
            </select>
          </div>

          {/* Sample Scripts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSamplesMenu(!showSamplesMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-700 rounded-lg border border-slate-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Sample Scripts</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showSamplesMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-30 space-y-1">
                <p className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Preset Template
                </p>
                {SAMPLE_SCRIPTS.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleLoadSample(sample.content, sample.title)}
                    className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs text-slate-800 transition-colors flex flex-col gap-0.5"
                  >
                    <span className="font-bold text-indigo-600">{sample.title}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{sample.content.substring(0, 50)}...</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emotion Tag Insertion Palette */}
      <EmotionTagPicker onInsertTag={handleInsertTag} />

      {/* Main Textarea & Live Chunk Stats */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Voiceover Script</span>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              <strong className="text-slate-800">{wordCount}</strong> words
            </span>
            <span className="text-slate-300">•</span>
            <span className={charCount > chunkSizeLimit ? 'text-amber-600 font-medium' : 'text-slate-500'}>
              <strong className="text-slate-800">{charCount}</strong> chars
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[11px] font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {chunks.length} {chunks.length === 1 ? 'Chunk' : 'Chunks'}
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Enter your voiceover script here... Use emotion tags like [happy], [whispering], or [excited] to shape voice performance."
            rows={10}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-sans resize-y transition-colors"
          />
        </div>

        {/* Chunk Breakdown Preview Banner */}
        {chunks.length > 1 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-medium">
              <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                <Scissors className="w-3.5 h-3.5" />
                Script exceeds {chunkSizeLimit} characters. Will generate in {chunks.length} sequential chunks:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {chunks.map((c, idx) => (
                <div key={idx} className="p-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center justify-between shadow-xs">
                  <span className="font-semibold text-slate-800">Chunk {idx + 1}</span>
                  <span className="font-mono text-indigo-600 font-bold">{c.charCount} chars</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !script.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Voiceover Chunks...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-white" />
                <span>Generate Expressive Voiceover</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
