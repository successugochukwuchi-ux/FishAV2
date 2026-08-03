import React from 'react';
import { ScriptChunk } from '../types';
import { CheckCircle2, Loader2, AlertCircle, Clock, Download, Play, Pause, Layers } from 'lucide-react';

interface ChunkProgressListProps {
  chunks: ScriptChunk[];
  activeChunkIndex?: number;
  currentlyPlayingChunkId: string | null;
  onPlayChunk: (chunk: ScriptChunk) => void;
  onPauseChunk: () => void;
  onDownloadChunk: (chunk: ScriptChunk) => void;
}

export const ChunkProgressList: React.FC<ChunkProgressListProps> = ({
  chunks,
  currentlyPlayingChunkId,
  onPlayChunk,
  onPauseChunk,
  onDownloadChunk
}) => {
  if (chunks.length === 0) return null;

  const completedCount = chunks.filter(c => c.status === 'completed').length;
  const progressPercent = Math.round((completedCount / chunks.length) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header & Overall Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">Audio Chunk Sequence ({chunks.length})</h3>
        </div>
        <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
          <div className="flex-1 sm:w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-indigo-600 font-bold">{progressPercent}%</span>
        </div>
      </div>

      {/* Chunk List Grid */}
      <div className="space-y-3">
        {chunks.map((chunk, idx) => {
          const isPlaying = currentlyPlayingChunkId === chunk.id;

          return (
            <div
              key={chunk.id}
              className={`p-3.5 rounded-xl border transition-all ${
                chunk.status === 'generating'
                  ? 'bg-indigo-50/60 border-indigo-200 shadow-sm'
                  : chunk.status === 'completed'
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : chunk.status === 'error'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-slate-50/50 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Status Icon & Index */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {chunk.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : chunk.status === 'generating' ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : chunk.status === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">
                        Chunk {idx + 1} of {chunks.length}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({chunk.charCount} chars)
                      </span>
                      {chunk.durationSeconds && (
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">
                          {chunk.durationSeconds.toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 max-w-lg">
                      {chunk.text}
                    </p>
                  </div>
                </div>

                {/* Actions & Status Badge */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                  {chunk.status === 'completed' && chunk.audioBlob && (
                    <>
                      {/* Play / Pause Chunk Button */}
                      <button
                        onClick={() => (isPlaying ? onPauseChunk() : onPlayChunk(chunk))}
                        className={`p-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          isPlaying
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-indigo-600" />
                            <span>Preview</span>
                          </>
                        )}
                      </button>

                      {/* Download Chunk Button */}
                      <button
                        onClick={() => onDownloadChunk(chunk)}
                        title="Download this chunk to local storage"
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {chunk.status === 'generating' && (
                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                      <span>Generating Audio...</span>
                    </span>
                  )}

                  {chunk.status === 'error' && (
                    <span className="text-xs text-rose-600 truncate max-w-[200px]" title={chunk.errorMessage}>
                      {chunk.errorMessage || 'Failed'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
