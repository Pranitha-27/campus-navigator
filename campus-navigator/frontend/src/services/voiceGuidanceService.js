// src/services/voiceGuidanceService.js
// Full voice guidance service using expo-speech

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// Voice profiles
export const VOICE_PROFILES = {
  default: { language: 'en-IN', pitch: 1.0, rate: 0.9 },
  fast: { language: 'en-IN', pitch: 1.0, rate: 1.2 },
  slow: { language: 'en-IN', pitch: 1.0, rate: 0.7 },
  friendly: { language: 'en-IN', pitch: 1.1, rate: 0.85 },
};

// Announcement templates
const TEMPLATES = {
  start: (dest) => `Starting navigation to ${dest}. Follow the on-screen directions.`,
  step: (instruction) => instruction,
  approaching: (distance, landmark) =>
    `In ${distance} metres, ${landmark ? 'near ' + landmark + ',' : ''} follow the next instruction.`,
  arrived: (dest) => `You have arrived at ${dest}. Enjoy your visit!`,
  recalculating: () => `Path updated. Please follow the new directions.`,
  floor: (floor) => `Proceed to floor ${floor} using the nearby staircase or elevator.`,
  crowded: (area) => `${area} is currently busy. Consider an alternate route.`,
  sos: () => `Emergency alert sent. Help is on the way. Please stay calm.`,
};

class VoiceGuidanceService {
  constructor() {
    this.enabled = true;
    this.profile = VOICE_PROFILES.default;
    this.queue = [];
    this.isSpeaking = false;
    this.lastSpoken = null;
    this.debounceMs = 2000; // Prevent duplicate announcements
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val) this.stop();
  }

  setProfile(profileName) {
    this.profile = VOICE_PROFILES[profileName] || VOICE_PROFILES.default;
  }

  async _speak(text) {
    if (!this.enabled || !text) return;
    const now = Date.now();
    if (this.lastSpoken?.text === text && now - this.lastSpoken.time < this.debounceMs) return;
    this.lastSpoken = { text, time: now };
    try {
      await Speech.stop();
      Speech.speak(text, {
        ...this.profile,
        onStart: () => { this.isSpeaking = true; },
        onDone: () => { this.isSpeaking = false; this._processQueue(); },
        onError: () => { this.isSpeaking = false; },
      });
    } catch (e) {
      console.warn('Voice guidance error:', e);
    }
  }

  _processQueue() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this._speak(next);
    }
  }

  speak(text, priority = false) {
    if (priority) {
      this.queue = [text, ...this.queue];
      Speech.stop().then(() => this._processQueue());
    } else {
      if (!this.isSpeaking) this._speak(text);
      else this.queue.push(text);
    }
  }

  announceStart(destination) {
    this.speak(TEMPLATES.start(destination), true);
  }

  announceStep(instruction) {
    this.speak(TEMPLATES.step(instruction));
  }

  announceApproaching(distance, landmark) {
    this.speak(TEMPLATES.approaching(distance, landmark));
  }

  announceArrival(destination) {
    this.speak(TEMPLATES.arrived(destination), true);
  }

  announceRecalculating() {
    this.speak(TEMPLATES.recalculating(), true);
  }

  announceFloorChange(floorNumber) {
    this.speak(TEMPLATES.floor(floorNumber));
  }

  announceCrowded(area) {
    this.speak(TEMPLATES.crowded(area));
  }

  announceSOS() {
    this.speak(TEMPLATES.sos(), true);
  }

  stop() {
    this.queue = [];
    Speech.stop();
    this.isSpeaking = false;
  }

  async getAvailableVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.filter(v => v.language?.startsWith('en'));
    } catch {
      return [];
    }
  }
}

const voiceGuidance = new VoiceGuidanceService();
export default voiceGuidance;