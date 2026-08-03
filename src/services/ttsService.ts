import { ScriptChunk, GenerationProject, OpenRouterTTSPayload } from '../types';
import { mergeAudioBlobs } from './audioMerger';
import { dbService } from './indexedDB';

export const HARDCODED_OPENROUTER_API_KEY = "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";
export const DEFAULT_MODEL_ID = "fish-audio/s2.1-pro-free:free";

/**
 * Generates TTS audio for a single text chunk.
 */
export async function generateSingleChunkAudio(
  payload: OpenRouterTTSPayload
): Promise<Blob> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: payload.text,
      voice: payload.voice || 'alex',
      model: payload.model || DEFAULT_MODEL_ID,
      apiKey: payload.apiKey || HARDCODED_OPENROUTER_API_KEY,
      response_format: payload.response_format || 'mp3'
    })
  });

  if (!response.ok) {
    let errorMsg = `Server error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      errorMsg = await response.text();
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error('Received empty audio file from OpenRouter API.');
  }

  return blob;
}

/**
 * Calculates audio duration in seconds from Blob using AudioContext
 */
export async function getAudioDurationSeconds(blob: Blob): Promise<number> {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;
    audioCtx.close();
    return duration;
  } catch {
    return 0; // Fallback if audio decode fails
  }
}

/**
 * Processes a full project with multiple chunks in sequence,
 * saving progress to IndexedDB after each chunk, and merging at the end.
 */
export async function processSequenceGeneration(
  project: GenerationProject,
  apiKey: string,
  onChunkUpdate: (chunkIndex: number, updatedChunk: ScriptChunk) => void,
  onProjectUpdate: (updatedProject: GenerationProject) => void
): Promise<GenerationProject> {
  const updatedProject: GenerationProject = {
    ...project,
    status: 'generating'
  };

  onProjectUpdate({ ...updatedProject });

  const completedBlobs: Blob[] = [];
  let totalDuration = 0;

  for (let i = 0; i < updatedProject.chunks.length; i++) {
    const currentChunk = { ...updatedProject.chunks[i] };

    // 1. Mark chunk as generating
    currentChunk.status = 'generating';
    updatedProject.chunks[i] = currentChunk;
    onChunkUpdate(i, currentChunk);
    onProjectUpdate({ ...updatedProject });

    try {
      // 2. Request single chunk audio from OpenRouter
      const blob = await generateSingleChunkAudio({
        text: currentChunk.text,
        voice: updatedProject.voiceId,
        model: updatedProject.modelId,
        apiKey: apiKey || HARDCODED_OPENROUTER_API_KEY
      });

      const audioUrl = URL.createObjectURL(blob);
      const duration = await getAudioDurationSeconds(blob);

      // 3. Update completed chunk state
      currentChunk.status = 'completed';
      currentChunk.audioBlob = blob;
      currentChunk.audioUrl = audioUrl;
      currentChunk.durationSeconds = duration;
      currentChunk.sizeBytes = blob.size;

      completedBlobs.push(blob);
      totalDuration += duration;

      updatedProject.chunks[i] = currentChunk;
      onChunkUpdate(i, currentChunk);

      // Save individual chunk to IndexedDB
      await dbService.saveChunk(updatedProject.id, currentChunk);
    } catch (err: any) {
      console.error(`Error generating chunk ${i + 1}:`, err);
      currentChunk.status = 'error';
      currentChunk.errorMessage = err?.message || 'Failed to generate audio chunk';
      updatedProject.chunks[i] = currentChunk;
      onChunkUpdate(i, currentChunk);

      updatedProject.status = 'error';
      updatedProject.errorMessage = `Generation stopped at Chunk ${i + 1}: ${currentChunk.errorMessage}`;
      onProjectUpdate({ ...updatedProject });

      await dbService.saveProject(updatedProject);
      throw new Error(updatedProject.errorMessage);
    }
  }

  // 4. Merge all generated audio chunks into single merged file
  try {
    let mergedBlob: Blob;
    if (completedBlobs.length === 1) {
      mergedBlob = completedBlobs[0];
    } else {
      mergedBlob = await mergeAudioBlobs(completedBlobs);
    }

    const mergedAudioUrl = URL.createObjectURL(mergedBlob);
    updatedProject.mergedAudioBlob = mergedBlob;
    updatedProject.mergedAudioUrl = mergedAudioUrl;
    updatedProject.totalDurationSeconds = totalDuration;
    updatedProject.status = 'completed';

    // 5. Save complete merged project to IndexedDB
    await dbService.saveProject(updatedProject);
    onProjectUpdate({ ...updatedProject });

    return updatedProject;
  } catch (mergeErr: any) {
    console.error('Failed to merge audio chunks:', mergeErr);
    updatedProject.status = 'completed'; // Chunks are ready even if merge fallback needed
    if (completedBlobs.length > 0) {
      updatedProject.mergedAudioBlob = completedBlobs[0];
      updatedProject.mergedAudioUrl = URL.createObjectURL(completedBlobs[0]);
    }
    await dbService.saveProject(updatedProject);
    onProjectUpdate({ ...updatedProject });
    return updatedProject;
  }
}
