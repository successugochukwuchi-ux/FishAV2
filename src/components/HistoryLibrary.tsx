import React, { useState, useEffect } from 'react';
import { GenerationProject, ScriptChunk } from '../types';
import { dbService } from '../services/indexedDB';
import {
  Database,
  Trash2,
  Download,
  Play,
  Layers,
  Clock,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  AlertTriangle,
  X
} from 'lucide-react';

interface HistoryLibraryProps {
  onSelectProjectForPlayer: (project: GenerationProject) => void;
  onDownloadProjectAudio: (project: GenerationProject) => void;
  onDownloadChunk: (chunk: ScriptChunk) => void;
}

export const HistoryLibrary: React.FC<HistoryLibraryProps> = ({
  onSelectProjectForPlayer,
  onDownloadProjectAudio,
  onDownloadChunk
}) => {
  const [projects, setProjects] = useState<GenerationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<'single' | 'selected' | 'all' | null>(null);
  const [targetSingleId, setTargetSingleId] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllProjects();
      setProjects(data);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to load projects from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.fullScript.toLowerCase().includes(q) ||
      p.voiceName.toLowerCase().includes(q)
    );
  });

  // Checkbox Select Toggles
  const handleToggleSelect = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  // Single Deletion Request
  const promptDeleteSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetSingleId(id);
    setShowConfirmModal('single');
  };

  // Execute Deletion
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (showConfirmModal === 'single' && targetSingleId) {
        await dbService.deleteProject(targetSingleId);
        setProjects((prev) => prev.filter((p) => p.id !== targetSingleId));
        setSelectedIds((prev) => prev.filter((id) => id !== targetSingleId));
      } else if (showConfirmModal === 'selected' && selectedIds.length > 0) {
        await dbService.deleteProjects(selectedIds);
        setProjects((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else if (showConfirmModal === 'all') {
        await dbService.clearAllProjects();
        setProjects([]);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Deletion error from IndexedDB:', err);
      alert('An error occurred while deleting voiceovers from IndexedDB.');
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(null);
      setTargetSingleId(null);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>IndexedDB Local Storage Library</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All generated voiceovers and audio chunks are stored locally in your browser IndexedDB.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
              <strong className="text-indigo-600 font-mono font-bold">{projects.length}</strong> Saved Voiceovers
            </div>

            {projects.length > 0 && (
              <button
                onClick={() => setShowConfirmModal('all')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                title="Delete all voiceovers in IndexedDB"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: Search + Selection controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved projects by title, voice, or script text..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {filteredProjects.length > 0 && (
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <button
                onClick={handleSelectAll}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
              >
                {selectedIds.length === filteredProjects.length ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selectedIds.length === filteredProjects.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>

              {selectedIds.length > 0 && (
                <button
                  onClick={() => setShowConfirmModal('selected')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 animate-fadeIn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-sm">
          Loading voiceovers from IndexedDB...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-slate-800 text-sm font-bold">No voiceover projects found</p>
          <p className="text-slate-500 text-xs">
            Generate voiceovers in the Studio tab and they will automatically save here in IndexedDB.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const isExpanded = expandedProjectId === project.id;
            const isSelected = selectedIds.includes(project.id);
            const hasMergedBlob = !!project.mergedAudioBlob || !!project.mergedAudioUrl;

            return (
              <div
                key={project.id}
                onClick={(e) => handleToggleSelect(project.id, e)}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Main Card Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Select Checkbox */}
                    <div
                      onClick={(e) => handleToggleSelect(project.id, e)}
                      className="pt-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{project.title}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold">
                          {project.voiceName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {project.chunkCount} {project.chunkCount === 1 ? 'Chunk' : 'Chunks'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDate(project.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{project.charCount} chars</span>
                        {project.totalDurationSeconds && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-mono font-bold">
                              {project.totalDurationSeconds.toFixed(1)}s audio
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 border-slate-100 pt-2 sm:pt-0"
                  >
                    <button
                      onClick={() => onSelectProjectForPlayer(project)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-white" />
                      <span>Play Voiceover</span>
                    </button>

                    {hasMergedBlob && (
                      <button
                        onClick={() => onDownloadProjectAudio(project)}
                        title="Download merged audio to local storage"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => promptDeleteSingle(project.id, e)}
                      title="Delete project from IndexedDB"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Script Snippet */}
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 line-clamp-2 leading-relaxed">
                  {project.fullScript}
                </p>

                {/* Chunks Expandable Section */}
                {project.chunks && project.chunks.length > 0 && (
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Hide Chunks' : `View Chunks breakdown (${project.chunks.length})`}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                        {project.chunks.map((chunk, idx) => (
                          <div
                            key={chunk.id || idx}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5 max-w-xl">
                              <span className="font-bold text-slate-800">
                                Chunk {idx + 1} ({chunk.charCount} chars)
                              </span>
                              <p className="text-slate-600 line-clamp-1">{chunk.text}</p>
                            </div>

                            <button
                              onClick={() => onDownloadChunk(chunk)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 self-end sm:self-center shadow-xs"
                            >
                              <Download className="w-3 h-3 text-slate-500" />
                              <span>Download Chunk</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">
                  {showConfirmModal === 'all'
                    ? 'Delete All Voiceovers?'
                    : showConfirmModal === 'selected'
                    ? `Delete ${selectedIds.length} Selected Projects?`
                    : 'Delete Voiceover Project?'}
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {showConfirmModal === 'all'
                ? 'Are you sure you want to permanently delete ALL saved voiceovers and audio chunks from browser IndexedDB storage? This action cannot be undone.'
                : showConfirmModal === 'selected'
                ? `Are you sure you want to permanently delete the ${selectedIds.length} selected voiceovers and their associated audio chunks from IndexedDB?`
                : 'Are you sure you want to permanently delete this voiceover project and all its audio chunks from IndexedDB?'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
