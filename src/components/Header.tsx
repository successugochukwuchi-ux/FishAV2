import React from 'react';
import { Volume2, Sparkles, Sliders, Database, Layers, Radio, Home } from 'lucide-react';
import { Voice } from '../types';

export type AppTab = 'landing' | 'generator' | 'voices' | 'library' | 'settings';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedVoice: Voice;
  modelId: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedVoice,
  modelId
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 bg-indigo-600 group-hover:bg-indigo-700 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-100 transition-colors">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                Fish Audio <span className="text-indigo-600">Studio</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                S2.1 Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Expressive OpenRouter TTS with Emotion Tags & Model IDs
            </p>
          </div>
        </button>

        {/* Center Active Voice & Model Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-slate-500 font-medium">Voice:</span>
          <span className="font-semibold text-slate-800">{selectedVoice.name}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Model:</span>
          <span className="font-mono text-indigo-600 text-[11px] max-w-[140px] truncate" title={modelId}>
            {modelId.replace('fish-audio/', '')}
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'landing'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Overview & Landing Page"
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'generator'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('voices')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'voices'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Voices</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="API & Model Configuration"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
};
