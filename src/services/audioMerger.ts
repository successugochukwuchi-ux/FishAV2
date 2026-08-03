/**
 * Merges multiple Audio Blobs into a single unified Audio Blob using Web Audio API.
 */
export async function mergeAudioBlobs(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 0) {
    throw new Error('No audio blobs provided for merging.');
  }

  if (blobs.length === 1) {
    return blobs[0];
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    // 1. Decode all Blobs into AudioBuffers
    const audioBuffers: AudioBuffer[] = [];
    for (const blob of blobs) {
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      audioBuffers.push(decoded);
    }

    // 2. Calculate total length and parameters
    const numberOfChannels = Math.max(...audioBuffers.map((b) => b.numberOfChannels));
    const sampleRate = audioBuffers[0].sampleRate;
    const totalLength = audioBuffers.reduce((sum, b) => sum + b.length, 0);

    // 3. Create destination AudioBuffer
    const mergedBuffer = audioCtx.createBuffer(numberOfChannels, totalLength, sampleRate);

    // 4. Copy channel data sequentially
    let offset = 0;
    for (const buffer of audioBuffers) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const outputData = mergedBuffer.getChannelData(channel);
        const inputData = buffer.getChannelData(channel < buffer.numberOfChannels ? channel : 0);
        outputData.set(inputData, offset);
      }
      offset += buffer.length;
    }

    // 5. Convert merged AudioBuffer to WAV Blob
    const wavBlob = audioBufferToWavBlob(mergedBuffer);
    return wavBlob;
  } finally {
    audioCtx.close();
  }
}

/**
 * Encodes AudioBuffer into standard uncompressed WAV Blob (broadly compatible audio format).
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const sampleRate = buffer.sampleRate;
  let channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF header
  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');

  // fmt subchunk
  writeString('fmt ');
  setUint32(16); // Subchunk1Size
  setUint16(1);  // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // ByteRate
  setUint16(numOfChan * 2);              // BlockAlign
  setUint16(16);                         // BitsPerSample

  // data subchunk
  writeString('data');
  setUint32(length - pos - 4);

  // De-interleave channel data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}
