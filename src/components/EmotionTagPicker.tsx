import React, { useState } from 'react';
import { EMOTION_TAGS } from '../data/emotionTagsData';
import { EmotionTag } from '../types';
import { Smile, Zap, Plus, HelpCircle } from 'lucide-react';

interface EmotionTagPickerProps {
  onInsertTag: (tag: string) => void;
}

export const EmotionTagPicker: React.FC<EmotionTagPickerProps> = ({ onInsertTag }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Tags' },
    { id: 'emotion', label: 'Emotions' },
    { id: 'tone', label: 'Voice Tones' },
    { id: 'action', label: 'Actions' },
    { id: 'narrative', label: 'Narrative' },
  ];

  const filteredTags = selectedCategory === 'all'
    ? EMOTION_TAGS
    : EMOTION_TAGS.filter(t => t.category === selectedCategory);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = customTagInput.trim();
    if (!formatted) return;
    if (!formatted.startsWith('[') && !formatted.startsWith('(')) {
      formatted = `[${formatted}]`;
    }
    onInsertTag(formatted);
    setCustomTagInput('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800 text-sm">Emotion & Expressive Tags</h3>
          <span className="text-xs text-slate-500">Insert anywhere in script</span>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showGuide ? 'Hide Guide' : 'How it works'}</span>
        </button>
      </div>

      {/* Guide Banner */}
      {showGuide && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-slate-700 leading-relaxed space-y-1 animate-fadeIn">
          <p className="font-bold text-indigo-900">💡 How Emotion Tags Work in Fish Audio S2 / S2.1 Pro:</p>
          <p>
            For Fish Audio S2 / S2.1 Pro models, place emotion tags in square brackets like <code className="bg-indigo-100 text-indigo-800 font-mono px-1 py-0.5 rounded">[happy]</code>, <code className="bg-indigo-100 text-indigo-800 font-mono px-1 py-0.5 rounded">[whispering]</code>, or natural descriptors like <code className="bg-indigo-100 text-indigo-800 font-mono px-1 py-0.5 rounded">[laughing nervously]</code> anywhere in your script text. Fish Audio dynamically adjusts voice timbre, pitch, inflection, and tone at that exact position in the sentence.
          </p>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quick Tag Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filteredTags.map((tag: EmotionTag) => (
          <button
            key={tag.tag}
            onClick={() => onInsertTag(tag.tag)}
            title={`${tag.description}\nExample: "${tag.example}"`}
            className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold border bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="font-mono text-indigo-600">{tag.tag}</span>
            <Plus className="w-3.5 h-3.5 opacity-60 hover:opacity-100 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Custom Tag Input */}
      <form onSubmit={handleAddCustom} className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <div className="relative flex-1">
          <Zap className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            placeholder="Custom tag e.g. [dramatic] or [laughing nervously]..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <button
          type="submit"
          disabled={!customTagInput.trim()}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Insert</span>
        </button>
      </form>
    </div>
  );
};
