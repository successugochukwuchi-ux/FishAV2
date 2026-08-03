import React, { useState, useMemo } from 'react';
import { Voice, VoiceCategory, VoiceGender, CustomVoiceModel } from '../types';
import { CATALOG_VOICES } from '../data/voicesData';
import { dbService } from '../services/indexedDB';
import {
  Search,
  Filter,
  Star,
  Plus,
  Radio,
  Check,
  Tag,
  Cpu,
  Trash2,
  Pencil,
  Sparkles
} from 'lucide-react';

interface VoiceBrowserProps {
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
  customModels: CustomVoiceModel[];
  onAddCustomModel: (model: CustomVoiceModel) => void;
  onUpdateCustomModel: (model: CustomVoiceModel) => void;
  onDeleteCustomModel: (id: string) => void;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
}

export const VoiceBrowser: React.FC<VoiceBrowserProps> = ({
  selectedVoice,
  onSelectVoice,
  customModels,
  onAddCustomModel,
  onUpdateCustomModel,
  onDeleteCustomModel,
  favoriteIds,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Custom Voice Modal State (Add or Edit)
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingModel, setEditingModel] = useState<CustomVoiceModel | null>(null);
  const [customName, setCustomName] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState<VoiceCategory>('custom');

  const openAddModal = () => {
    setEditingModel(null);
    setCustomName('');
    setCustomModelId('');
    setCustomTag('');
    setCustomDesc('');
    setCustomCategory('custom');
    setShowCustomModal(true);
  };

  const openEditModal = (cm: CustomVoiceModel) => {
    setEditingModel(cm);
    setCustomName(cm.name);
    setCustomModelId(cm.modelId);
    setCustomTag(cm.voiceTag || '');
    setCustomDesc(cm.description || '');
    setCustomCategory(cm.category || 'custom');
    setShowCustomModal(true);
  };

  // Combine Catalog + Custom Models
  const allVoices = useMemo(() => {
    const list: Voice[] = [...CATALOG_VOICES];

    // Convert custom models to Voice objects
    customModels.forEach((cm) => {
      list.push({
        id: cm.id,
        name: cm.name,
        gender: 'neutral',
        category: cm.category,
        tags: [cm.voiceTag || 'Custom', 'User Model'],
        language: 'Custom',
        description: cm.description || `Custom Fish Audio model: ${cm.modelId}`,
        modelId: cm.modelId,
        avatarColor: 'from-purple-600 to-fuchsia-600'
      });
    });

    return list;
  }, [customModels]);

  // Filtering Logic
  const filteredVoices = useMemo(() => {
    return allVoices.filter((v) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesDesc = v.description.toLowerCase().includes(q);
        const matchesTags = v.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      // Category
      if (selectedCategory !== 'all' && v.category !== selectedCategory) {
        return false;
      }

      // Gender
      if (selectedGender !== 'all' && v.gender !== selectedGender) {
        return false;
      }

      // Favorites
      if (showFavoritesOnly && !favoriteIds.includes(v.id)) {
        return false;
      }

      return true;
    });
  }, [allVoices, searchQuery, selectedCategory, selectedGender, showFavoritesOnly, favoriteIds]);

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customModelId.trim()) return;

    if (editingModel) {
      // Editing existing custom model in IndexedDB
      const updatedModel: CustomVoiceModel = {
        id: editingModel.id,
        name: customName.trim(),
        modelId: customModelId.trim(),
        voiceTag: customTag.trim() || customName.trim().toLowerCase(),
        category: customCategory,
        description: customDesc.trim() || `User added Fish Audio model ${customModelId.trim()}`,
        addedAt: editingModel.addedAt || Date.now()
      };

      dbService.saveCustomModel(updatedModel);
      onUpdateCustomModel(updatedModel);

      // If currently selected voice is this model, update selection
      if (selectedVoice.id === updatedModel.id) {
        onSelectVoice({
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
    } else {
      // Creating new custom model in IndexedDB
      const newCustom: CustomVoiceModel = {
        id: `custom_voice_${Date.now()}`,
        name: customName.trim(),
        modelId: customModelId.trim(),
        voiceTag: customTag.trim() || customName.trim().toLowerCase(),
        category: customCategory,
        description: customDesc.trim() || `User added Fish Audio model ${customModelId.trim()}`,
        addedAt: Date.now()
      };

      dbService.saveCustomModel(newCustom);
      onAddCustomModel(newCustom);

      // Auto select new custom voice
      onSelectVoice({
        id: newCustom.id,
        name: newCustom.name,
        gender: 'neutral',
        category: newCustom.category,
        tags: [newCustom.voiceTag, 'Custom Model'],
        language: 'Custom',
        description: newCustom.description,
        modelId: newCustom.modelId,
        avatarColor: 'from-purple-600 to-fuchsia-600'
      });
    }

    setShowCustomModal(false);
    setEditingModel(null);
    setCustomName('');
    setCustomModelId('');
    setCustomTag('');
    setCustomDesc('');
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'preset', label: 'Presets' },
    { id: 'narration', label: 'Narration' },
    { id: 'conversational', label: 'Conversational' },
    { id: 'expressive', label: 'Expressive' },
    { id: 'anime', label: 'Anime' },
    { id: 'character', label: 'Character' },
    { id: 'custom', label: 'Custom Models' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600" />
              <span>Fish Audio Voice Browser</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse presets or input custom Fish Audio model IDs for expressive voiceovers.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Model ID</span>
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voices by name, tag, or description..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Gender Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="neutral">Neutral / Character</option>
            </select>
          </div>

          {/* Favorites Filter Toggle */}
          <div className="md:col-span-4 flex items-center justify-end">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                showFavoritesOnly
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current text-amber-500' : ''}`} />
              <span>Favorites Only ({favoriteIds.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voices Grid */}
      {filteredVoices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-slate-800 text-sm font-bold">No voices match your filters</p>
          <p className="text-slate-500 text-xs">Try resetting search keywords or category selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoice.id === voice.id;
            const isFav = favoriteIds.includes(voice.id);
            const isCustom = voice.category === 'custom' || !!voice.modelId;

            return (
              <div
                key={voice.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 relative group shadow-sm ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Avatar & Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        {voice.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">{voice.name}</h3>
                          {voice.isPreset && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded uppercase">
                              Preset
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 capitalize">{voice.gender} • {voice.language}</p>
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(voice.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                      title="Favorite voice"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {voice.description}
                  </p>

                  {/* Custom Model Badge */}
                  {isCustom && voice.modelId && (
                    <div className="mt-2 text-[11px] font-mono text-indigo-700 bg-indigo-50 p-1.5 rounded-lg border border-indigo-100 flex items-center justify-between">
                      <span className="truncate flex-1 font-semibold">Model: {voice.modelId}</span>
                      {voice.id.startsWith('custom_voice_') && (
                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const cm = customModels.find((m) => m.id === voice.id);
                              if (cm) openEditModal(cm);
                            }}
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100/60 rounded transition-colors"
                            title="Edit custom voice in IndexedDB"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomModel(voice.id);
                              dbService.deleteCustomModel(voice.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-100/60 rounded transition-colors"
                            title="Delete custom voice from IndexedDB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1 mt-3">
                    {voice.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Select Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectVoice(voice)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Active Voice</span>
                      </>
                    ) : (
                      <span>Select Voice</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Custom Fish Audio Model ID */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <span>{editingModel ? 'Edit Custom Fish Audio Model' : 'Add Custom Fish Audio Model'}</span>
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Voice Display Name *</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. My Fine-tuned Anime Voice"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Fish Audio Voice Model ID / Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                  placeholder="e.g. ca3007f96ae7499ab87d27ea3599956a"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-indigo-700 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold text-xs"
                />
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500">e.g. 32-char Fish Audio voice model ID</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomModelId('ca3007f96ae7499ab87d27ea3599956a');
                      if (!customName) setCustomName('Fish Audio Custom Model');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold underline"
                  >
                    Try Example ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Voice Tag (Optional)</label>
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="e.g. custom_alex"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as VoiceCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                >
                  <option value="custom">Custom</option>
                  <option value="narration">Narration</option>
                  <option value="conversational">Conversational</option>
                  <option value="expressive">Expressive</option>
                  <option value="anime">Anime</option>
                  <option value="character">Character</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Short note about this voice model..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingModel ? 'Update Model' : 'Save Model'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
