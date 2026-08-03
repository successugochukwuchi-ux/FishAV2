import { ScriptChunk } from '../types';

export const DEFAULT_CHUNK_LIMIT = 3000;

/**
 * Splits text into logical chunks of max `maxChars` length,
 * respecting sentence and paragraph boundaries whenever possible.
 */
export function splitScriptIntoChunks(script: string, maxChars: number = DEFAULT_CHUNK_LIMIT): ScriptChunk[] {
  const trimmed = script.trim();
  if (!trimmed) return [];

  // If text fits within limit, return as single chunk
  if (trimmed.length <= maxChars) {
    return [
      {
        id: `chunk_0_${Date.now()}`,
        index: 0,
        text: trimmed,
        charCount: trimmed.length,
        status: 'pending'
      }
    ];
  }

  const chunks: string[] = [];
  
  // First break by double newlines or single newlines
  const paragraphs = trimmed.split(/(\r?\n\r?\n|\r?\n)/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // Skip empty lines in counting unless needed
    if (!paragraph) continue;

    // If paragraph itself fits in current chunk
    if ((currentChunk + paragraph).length <= maxChars) {
      currentChunk += paragraph;
    } else {
      // Current chunk full? Push it if not empty
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // If paragraph fits in a new chunk
      if (paragraph.length <= maxChars) {
        currentChunk = paragraph;
      } else {
        // Paragraph is longer than maxChars! Need to split paragraph by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [paragraph];

        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= maxChars) {
            currentChunk += sentence;
          } else {
            if (currentChunk.trim().length > 0) {
              chunks.push(currentChunk.trim());
              currentChunk = '';
            }

            // If sentence itself is longer than maxChars, hard break by words
            if (sentence.length > maxChars) {
              const words = sentence.split(/\s+/);
              for (const word of words) {
                if ((currentChunk + ' ' + word).length <= maxChars) {
                  currentChunk = currentChunk ? currentChunk + ' ' + word : word;
                } else {
                  if (currentChunk.trim().length > 0) {
                    chunks.push(currentChunk.trim());
                  }
                  currentChunk = word;
                }
              }
            } else {
              currentChunk = sentence;
            }
          }
        }
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.map((text, idx) => ({
    id: `chunk_${idx}_${Date.now()}`,
    index: idx,
    text,
    charCount: text.length,
    status: 'pending'
  }));
}
