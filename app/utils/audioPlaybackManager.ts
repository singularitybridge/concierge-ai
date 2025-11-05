/**
 * Audio Playback Manager for OpenAI Realtime and Gemini Live APIs
 * Handles audio playback queue and smooth audio streaming
 */

import { CHANNELS, pcm16ToFloat, base64ToInt16Array, resampleAudio } from './audioUtils';

export class AudioPlaybackManager {
  private audioContext: AudioContext | null = null;
  private audioQueue: Float32Array[] = [];
  private isPlaying: boolean = false;
  private nextStartTime: number = 0;
  private readonly maxQueueSize: number = 100; // Prevent memory issues
  private gainNode: GainNode | null = null;
  private sourceSampleRate: number = 24000; // Default to 24kHz (both OpenAI and Gemini output)

  /**
   * Initialize the audio playback system
   * @param sampleRate Source sample rate of incoming audio (default: 24000)
   */
  async initialize(sampleRate: number = 24000): Promise<void> {
    if (this.audioContext) {
      console.warn('Audio playback already initialized');
      return;
    }

    this.sourceSampleRate = sampleRate;

    // Use browser's default sample rate (typically 44100 or 48000)
    this.audioContext = new AudioContext();

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 1.0;

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    console.log('Audio playback initialized');
  }

  /**
   * Add PCM16 audio chunk to playback queue
   * @param pcm16Data Int16Array PCM16 audio data
   */
  addAudioChunk(pcm16Data: Int16Array): void {
    if (!this.audioContext) {
      console.warn('Audio playback not initialized');
      return;
    }

    // Check queue size to prevent memory issues
    if (this.audioQueue.length >= this.maxQueueSize) {
      console.warn('Audio queue full, dropping oldest chunks');
      this.audioQueue = this.audioQueue.slice(-50); // Keep only last 50 chunks
    }

    // Convert PCM16 to Float32
    let float32Data = pcm16ToFloat(pcm16Data);

    // Resample from source sample rate to audio context sample rate
    const contextSampleRate = this.audioContext.sampleRate;
    if (this.sourceSampleRate !== contextSampleRate) {
      float32Data = resampleAudio(float32Data, this.sourceSampleRate, contextSampleRate);
    }

    this.audioQueue.push(float32Data);

    // Start playback if not already playing
    if (!this.isPlaying) {
      this.startPlayback();
    }
  }

  /**
   * Add base64-encoded PCM16 audio chunk to playback queue
   * @param base64Audio Base64 encoded PCM16 audio
   */
  addBase64AudioChunk(base64Audio: string): void {
    const pcm16Data = base64ToInt16Array(base64Audio);
    this.addAudioChunk(pcm16Data);
  }

  /**
   * Start processing the audio queue
   */
  private startPlayback(): void {
    if (!this.audioContext || !this.gainNode) {
      return;
    }

    this.isPlaying = true;
    this.nextStartTime = this.audioContext.currentTime;

    // Start processing queue
    this.processQueue();
  }

  /**
   * Process audio chunks from the queue
   */
  private processQueue(): void {
    if (!this.audioContext || !this.gainNode || !this.isPlaying) {
      return;
    }

    while (this.audioQueue.length > 0) {
      const audioData = this.audioQueue.shift()!;

      // Create audio buffer with context's sample rate
      const buffer = this.audioContext.createBuffer(
        CHANNELS,
        audioData.length,
        this.audioContext.sampleRate
      );

      // Fill buffer with audio data
      buffer.getChannelData(0).set(audioData);

      // Create buffer source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode);

      // Schedule playback
      const startTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
      source.start(startTime);

      // Update next start time
      this.nextStartTime = startTime + buffer.duration;

      // Cleanup when done
      source.onended = () => {
        source.disconnect();
      };
    }

    // Check if more chunks are coming
    if (this.audioQueue.length === 0) {
      // Wait a bit for more chunks, then stop if none arrive
      setTimeout(() => {
        if (this.audioQueue.length === 0) {
          this.isPlaying = false;
        } else {
          this.processQueue();
        }
      }, 100);
    } else {
      // Continue processing
      requestAnimationFrame(() => this.processQueue());
    }
  }

  /**
   * Clear the audio queue
   */
  clearQueue(): void {
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }

  /**
   * Set playback volume
   * @param volume Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current volume level
   * @returns number (0.0 to 1.0)
   */
  getVolume(): number {
    return this.gainNode?.gain.value ?? 1.0;
  }

  /**
   * Stop playback and cleanup
   */
  async stop(): Promise<void> {
    this.isPlaying = false;
    this.clearQueue();

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    console.log('Audio playback stopped');
  }

  /**
   * Get playback status
   * @returns boolean
   */
  isPlayingAudio(): boolean {
    return this.isPlaying;
  }

  /**
   * Get queue size
   * @returns number
   */
  getQueueSize(): number {
    return this.audioQueue.length;
  }

  /**
   * Get audio context state
   * @returns AudioContextState | null
   */
  getAudioContextState(): AudioContextState | null {
    return this.audioContext?.state ?? null;
  }
}
