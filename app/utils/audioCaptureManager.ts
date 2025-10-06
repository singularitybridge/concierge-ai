/**
 * Audio Capture Manager for OpenAI Realtime and Gemini Live APIs
 * Handles microphone access, audio processing, and streaming
 */

import {
  SAMPLE_RATE,
  CHANNELS,
  floatTo16BitPCM,
  resampleAudio,
  mergeChannelsToMono,
  int16ArrayToBase64,
} from './audioUtils';

export type AudioDataCallback = (audioData: Int16Array, base64Audio: string) => void;

export class AudioCaptureManager {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isCapturing: boolean = false;
  private onAudioData: AudioDataCallback | null = null;

  /**
   * Start capturing audio from the microphone
   * @param onAudioData Callback function that receives PCM16 audio chunks
   * @returns Promise<void>
   */
  async startCapture(onAudioData: AudioDataCallback): Promise<void> {
    if (this.isCapturing) {
      console.warn('Audio capture already active');
      return;
    }

    this.onAudioData = onAudioData;

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: SAMPLE_RATE,
          channelCount: CHANNELS,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext({
        sampleRate: SAMPLE_RATE,
      });

      // Create media stream source
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create script processor for audio data
      // Using buffer size of 4096 for balance between latency and processing overhead
      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(
        bufferSize,
        CHANNELS,
        CHANNELS
      );

      // Process audio data
      this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isCapturing || !this.onAudioData) return;

        const inputBuffer = e.inputBuffer;
        const inputData: Float32Array[] = [];

        // Get all channels
        for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
          inputData.push(inputBuffer.getChannelData(channel));
        }

        // Merge to mono if needed
        let audioData = inputData.length > 1
          ? mergeChannelsToMono(inputData)
          : inputData[0];

        // Resample if needed
        if (inputBuffer.sampleRate !== SAMPLE_RATE) {
          audioData = resampleAudio(audioData, inputBuffer.sampleRate, SAMPLE_RATE);
        }

        // Convert to PCM16
        const pcm16Data = floatTo16BitPCM(audioData);

        // Convert to base64 for transmission
        const base64Audio = int16ArrayToBase64(pcm16Data);

        // Send to callback
        this.onAudioData(pcm16Data, base64Audio);
      };

      // Connect nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isCapturing = true;
      console.log('Audio capture started successfully');
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      await this.stopCapture();
      throw error;
    }
  }

  /**
   * Stop capturing audio and cleanup resources
   */
  async stopCapture(): Promise<void> {
    if (!this.isCapturing) {
      return;
    }

    this.isCapturing = false;

    // Disconnect and cleanup audio nodes
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    // Stop all media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.onAudioData = null;
    console.log('Audio capture stopped');
  }

  /**
   * Check if microphone permission is granted
   * @returns Promise<boolean>
   */
  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state === 'granted';
    } catch (error) {
      console.warn('Permission API not supported:', error);
      return false;
    }
  }

  /**
   * Get current capture status
   * @returns boolean
   */
  isActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Get audio context state
   * @returns AudioContextState | null
   */
  getAudioContextState(): AudioContextState | null {
    return this.audioContext?.state ?? null;
  }
}
