import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ScriptEditor } from './components/ScriptEditor';
import { ChunkProgressList } from './components/ChunkProgressList';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceBrowser } from './components/VoiceBrowser';
import { HistoryLibrary } from './components/HistoryLibrary';
import { SettingsModal } from './components/SettingsModal';

import { Voice, ScriptChunk, GenerationProject, CustomVoiceModel } from './types';
import { PRESET_VOICES } from './data/voicesData';
import { splitScriptIntoChunks, DEFAULT_CHUNK_LIMIT } from './services/scriptSplitter';
import {
  processSequenceGeneration,
  HARDCODED_OPENROUTER_API_KEY,
  DEFAULT_MODEL_ID
} from './services/ttsService';
import { dbService } from './services/indexedDB';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('landing');

  // Studio Inputs
  const [title, setTitle] = useState<string>('My Expressive Voiceover');
  const [script, setScript] = useState<string>(
    'Welcome to Fish Audio S2.1 Pro! [happy] I am excited to demonstrate how emotion tags bring voiceovers to life.\n\n[whispering] Listen closely as the sound drops to a soft whisper.\n\nSuddenly, [excited] the story erupts into pure excitement!'
  );
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PRESET_VOICES[0]); // Alex
  const [chunkSizeLimit, setChunkSizeLimit] = useState<number>(DEFAULT_CHUNK_LIMIT); // 3000 chars

  // Config State
  const [apiKey, setApiKey] = useState<string>(HARDCODED_OPENROUTER_API_KEY);
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);

  // Custom Voices & Favorites from IndexedDB
  const [customModels, setCustomModels] = useState<CustomVoiceModel[]>([]);
  const [favoriteVoiceIds, setFavoriteVoiceIds] = useState<string[]>([]);

  // Active Project & Generation State
  const [currentProject, setCurrentProject] = useState<GenerationProject | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active Audio Player State
  const [playerAudioUrl, setPlayerAudioUrl] = useState<string | null>(null);
  const [playerTitle, setPlayerTitle] = useState<string>('');
  const [playerSubtitle, setPlayerSubtitle] = useState<string>('');
  const [currentlyPlayingChunkId, setCurrentlyPlayingChunkId] = useState<string | null>(null);

  // Load IndexedDB User Data
  useEffect(() => {
    async function loadData() {
      try {
        const models = await dbService.getCustomModels();
        setCustomModels(models);

        const favs = await dbService.getFavoriteVoiceIds();
        setFavoriteVoiceIds(favs);
      } catch (err) {
        console.error('Failed to load initial data from IndexedDB:', err);
      }
    }
    loadData();
  }, []);

  // Handle Voice Favorites Toggle
  const handleToggleFavorite = async (voiceId: string) => {
    try {
      const isFav = await dbService.toggleFavoriteVoice(voiceId);
      if (isFav) {
        setFavoriteVoiceIds([...favoriteVoiceIds, voiceId]);
      } else {
        setFavoriteVoiceIds(favoriteVoiceIds.filter((id) => id !== voiceId));
      }
    } catch (err) {
      console.error('Failed to toggle favorite voice:', err);
    }
  };

  // Handle Add Custom Model
  const handleAddCustomModel = (model: CustomVoiceModel) => {
    setCustomModels((prev) => [...prev, model]);
  };

  // Handle Update Custom Model
  const handleUpdateCustomModel = (updatedModel: CustomVoiceModel) => {
    setCustomModels((prev) => prev.map((m) => (m.id === updatedModel.id ? updatedModel : m)));
    if (selectedVoice.id === updatedModel.id) {
      setSelectedVoice({
        id: updatedModel.id,
        name: updatedModel.name,
        gender: 'neutral',
        category: updatedModel.category,
        tags: [updatedModel.voiceTag, 'Custom Model'],
        language: 'Custom',
        description: updatedModel.description,
        modelId: updatedModel.modelId,
        avatarColor: 'from-purple-600 to-fuchsia-600'
      });
    }
  };

  // Handle Delete Custom Model
  const handleDeleteCustomModel = (id: string) => {
    setCustomModels((prev) => prev.filter((m) => m.id !== id));
  };

  // Trigger Main TTS Generation
  const handleStartGeneration = async () => {
    if (!script.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    // 1. Divide script into chunks of <= chunkSizeLimit (e.g. 3000 chars)
    const initialChunks = splitScriptIntoChunks(script, chunkSizeLimit);

    const project: GenerationProject = {
      id: `proj_${Date.now()}`,
      title: title.trim() || 'Untitled Voiceover',
      fullScript: script,
      voiceId: selectedVoice.modelId || selectedVoice.id,
      voiceName: selectedVoice.name,
      modelId: modelId || DEFAULT_MODEL_ID,
      createdAt: Date.now(),
      charCount: script.length,
      chunkCount: initialChunks.length,
      chunkSizeLimit,
      chunks: initialChunks,
      status: 'generating'
    };

    setCurrentProject(project);

    try {
      // 2. Process chunks in sequence and merge audio at the end
      const finalProject = await processSequenceGeneration(
        project,
        apiKey,
        (idx, updatedChunk) => {
          setCurrentProject((prev) => {
            if (!prev) return null;
            const newChunks = [...prev.chunks];
            newChunks[idx] = updatedChunk;
            return { ...prev, chunks: newChunks };
          });
        },
        (updatedProject) => {
          setCurrentProject(updatedProject);
        }
      );

      // 3. Set merged audio to main player
      if (finalProject.mergedAudioUrl) {
        setPlayerAudioUrl(finalProject.mergedAudioUrl);
        setPlayerTitle(finalProject.title);
        setPlayerSubtitle(`Voice: ${finalProject.voiceName} • ${finalProject.chunkCount} Chunks Merged`);
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setGenerationError(err?.message || 'Failed to generate voiceover.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Single Chunk Preview Player
  const handlePlayChunk = (chunk: ScriptChunk) => {
    if (chunk.audioUrl) {
      setPlayerAudioUrl(chunk.audioUrl);
      setPlayerTitle(`${currentProject?.title || 'Voiceover'} - Chunk ${chunk.index + 1}`);
      setPlayerSubtitle(`Previewing Chunk (${chunk.charCount} chars)`);
      setCurrentlyPlayingChunkId(chunk.id);
    }
  };

  const handlePauseChunk = () => {
    setCurrentlyPlayingChunkId(null);
  };

  // Download File Helpers
  const downloadBlobToLocal = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Download Merged Project Audio
  const handleDownloadMergedProject = (proj: GenerationProject) => {
    if (proj.mergedAudioBlob) {
      const cleanTitle = proj.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      downloadBlobToLocal(proj.mergedAudioBlob, `${cleanTitle}_merged.mp3`);
    } else if (proj.mergedAudioUrl) {
      const a = document.createElement('a');
      a.href = proj.mergedAudioUrl;
      a.download = `${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_merged.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Download Individual Chunk
  const handleDownloadChunk = (chunk: ScriptChunk) => {
    if (chunk.audioBlob) {
      downloadBlobToLocal(chunk.audioBlob, `chunk_${chunk.index + 1}.mp3`);
    } else if (chunk.audioUrl) {
      const a = document.createElement('a');
      a.href = chunk.audioUrl;
      a.download = `chunk_${chunk.index + 1}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Download All Chunks Sequentially
  const handleDownloadAllChunks = () => {
    if (!currentProject) return;
    currentProject.chunks.forEach((chunk, i) => {
      setTimeout(() => {
        handleDownloadChunk(chunk);
      }, i * 300);
    });
  };

  // Load Saved Project from Library into Studio & Player
  const handleSelectProjectFromLibrary = (project: GenerationProject) => {
    setCurrentProject(project);
    setTitle(project.title);
    setScript(project.fullScript);

    if (project.mergedAudioUrl) {
      setPlayerAudioUrl(project.mergedAudioUrl);
      setPlayerTitle(project.title);
      setPlayerSubtitle(`Voice: ${project.voiceName} • ${project.chunkCount} Chunks Merged`);
    }

    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedVoice={selectedVoice}
        modelId={selectedVoice.modelId || modelId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Landing Page Tab */}
        {activeTab === 'landing' && (
          <LandingPage
            onEnterStudio={() => setActiveTab('generator')}
            onBrowseVoices={() => setActiveTab('voices')}
            onOpenLibrary={() => setActiveTab('library')}
          />
        )}

        {/* Studio Generator Tab */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <ScriptEditor
              script={script}
              setScript={setScript}
              title={title}
              setTitle={setTitle}
              chunkSizeLimit={chunkSizeLimit}
              setChunkSizeLimit={setChunkSizeLimit}
              selectedVoice={selectedVoice}
              onOpenVoiceBrowser={() => setActiveTab('voices')}
              onGenerate={handleStartGeneration}
              isGenerating={isGenerating}
            />

            {/* Error Banner */}
            {generationError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Generation Failed</p>
                  <p className="text-rose-700">{generationError}</p>
                </div>
              </div>
            )}

            {/* Active Audio Player */}
            {playerAudioUrl && (
              <AudioPlayer
                audioUrl={playerAudioUrl}
                title={playerTitle}
                subtitle={playerSubtitle}
                totalDuration={currentProject?.totalDurationSeconds}
                onDownloadMerged={
                  currentProject ? () => handleDownloadMergedProject(currentProject) : undefined
                }
                onDownloadAllChunks={
                  currentProject && currentProject.chunkCount > 1 ? handleDownloadAllChunks : undefined
                }
                chunkCount={currentProject?.chunkCount || 1}
              />
            )}

            {/* Live Sequential Chunk Progress List */}
            {currentProject && (
              <ChunkProgressList
                chunks={currentProject.chunks}
                currentlyPlayingChunkId={currentlyPlayingChunkId}
                onPlayChunk={handlePlayChunk}
                onPauseChunk={handlePauseChunk}
                onDownloadChunk={handleDownloadChunk}
              />
            )}
          </div>
        )}

        {/* Voices Tab */}
        {activeTab === 'voices' && (
          <VoiceBrowser
            selectedVoice={selectedVoice}
            onSelectVoice={(v) => {
              setSelectedVoice(v);
              setActiveTab('generator');
            }}
            customModels={customModels}
            onAddCustomModel={handleAddCustomModel}
            onUpdateCustomModel={handleUpdateCustomModel}
            onDeleteCustomModel={handleDeleteCustomModel}
            favoriteIds={favoriteVoiceIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* History Library Tab */}
        {activeTab === 'library' && (
          <HistoryLibrary
            onSelectProjectForPlayer={handleSelectProjectFromLibrary}
            onDownloadProjectAudio={handleDownloadMergedProject}
            onDownloadChunk={handleDownloadChunk}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsModal
            apiKey={apiKey}
            setApiKey={setApiKey}
            modelId={modelId}
            setModelId={setModelId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1">
          <span>Powered by</span>
          <strong className="text-indigo-600">Fish Audio S2.1 Pro</strong>
          <span>on</span>
          <strong className="text-slate-800">OpenRouter API</strong>
          <span>• Local Storage in IndexedDB</span>
        </p>
      </footer>
    </div>
  );
}
