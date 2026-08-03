import React, { useState } from 'react';
import { Sliders, Key, Cpu, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { HARDCODED_OPENROUTER_API_KEY, DEFAULT_MODEL_ID } from '../services/ttsService';

interface SettingsModalProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  modelId: string;
  setModelId: (model: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  apiKey,
  setApiKey,
  modelId,
  setModelId
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Connection test.',
          voice: 'alex',
          model: modelId || DEFAULT_MODEL_ID,
          apiKey: apiKey || HARDCODED_OPENROUTER_API_KEY
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter error ${res.status}: ${errText}`);
      }

      setTestStatus('success');
      setTestMessage('Successfully connected to OpenRouter Fish Audio TTS endpoint!');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Connection test failed.');
    }
  };

  const handleResetDefaults = () => {
    setApiKey(HARDCODED_OPENROUTER_API_KEY);
    setModelId(DEFAULT_MODEL_ID);
    setTestStatus('idle');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">OpenRouter & Model Configuration</h2>
              <p className="text-xs text-slate-500">
                Manage your API key and default Fish Audio TTS model endpoints.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* API Key Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>OpenRouter API Key</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                Pre-configured Key Loaded
              </span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-indigo-700 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Hardcoded default key provided in user request is pre-loaded. You can also override with your custom OpenRouter key.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Default OpenRouter Model ID</span>
            </label>
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="fish-audio/s2.1-pro-free:free"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-indigo-700 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Default OpenRouter model ID: <code className="text-indigo-600 font-semibold">fish-audio/s2.1-pro-free:free</code> or <code className="text-indigo-600 font-semibold">fish-audio/s2.1-pro</code>.
            </p>
          </div>

          {/* Connection Test Action */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{testStatus === 'testing' ? 'Testing Connection...' : 'Test OpenRouter Connection'}</span>
            </button>

            {testStatus === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{testMessage}</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="flex items-center gap-1.5 text-xs text-rose-800 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{testMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
