/**
 * Audio Utilities for OpenAI Realtime and Gemini Live APIs
 * Handles PCM16 encoding/decoding at provider-specific sample rates
 */

// OpenAI Realtime API uses 24kHz for both input and output
export const OPENAI_SAMPLE_RATE = 24000;

// Gemini Live API uses 16kHz for input, 24kHz for output
export const GEMINI_INPUT_SAMPLE_RATE = 16000;
export const GEMINI_OUTPUT_SAMPLE_RATE = 24000;

export const CHANNELS = 1; // Mono audio
export const BIT_DEPTH = 16; // 16-bit PCM

/**
 * Convert Float32Array audio data to PCM16 Int16Array
 * @param float32Array Audio data from Web Audio API (-1.0 to 1.0)
 * @returns Int16Array in PCM16 format
 */
export function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    // Clamp values to -1.0 to 1.0 range
    const clampedValue = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to 16-bit integer (-32768 to 32767)
    int16Array[i] = clampedValue < 0
      ? clampedValue * 0x8000
      : clampedValue * 0x7FFF;
  }

  return int16Array;
}

/**
 * Convert PCM16 Int16Array to Float32Array
 * @param int16Array PCM16 audio data
 * @returns Float32Array for Web Audio API playback
 */
export function pcm16ToFloat(int16Array: Int16Array): Float32Array {
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i++) {
    // Convert 16-bit integer to float (-1.0 to 1.0)
    float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
  }

  return float32Array;
}

/**
 * Convert Int16Array to base64 string for WebSocket transmission
 * @param int16Array PCM16 audio data
 * @returns Base64 encoded string
 */
export function int16ArrayToBase64(int16Array: Int16Array): string {
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';

  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binary);
}

/**
 * Convert base64 string to Int16Array for audio playback
 * @param base64 Base64 encoded PCM16 audio
 * @returns Int16Array PCM16 audio data
 */
export function base64ToInt16Array(base64: string): Int16Array {
  const binary = atob(base64);
  const uint8Array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }

  return new Int16Array(uint8Array.buffer);
}

/**
 * Resample audio from source sample rate to target sample rate
 * Uses linear interpolation for simplicity
 * @param audioData Float32Array audio data at source sample rate
 * @param sourceSampleRate Source sample rate (e.g., 48000)
 * @param targetSampleRate Target sample rate (e.g., 16000)
 * @returns Resampled Float32Array
 */
export function resampleAudio(
  audioData: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const sourceIndex = i * ratio;
    const index1 = Math.floor(sourceIndex);
    const index2 = Math.min(index1 + 1, audioData.length - 1);
    const fraction = sourceIndex - index1;

    // Linear interpolation
    result[i] = audioData[index1] * (1 - fraction) + audioData[index2] * fraction;
  }

  return result;
}

/**
 * Merge multiple audio channels into mono
 * @param audioData Array of Float32Arrays (one per channel)
 * @returns Single Float32Array with merged mono audio
 */
export function mergeChannelsToMono(audioData: Float32Array[]): Float32Array {
  if (audioData.length === 0) return new Float32Array(0);
  if (audioData.length === 1) return audioData[0];

  const length = audioData[0].length;
  const result = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (let channel = 0; channel < audioData.length; channel++) {
      sum += audioData[channel][i];
    }
    result[i] = sum / audioData.length;
  }

  return result;
}
