import { describe, it, expect, beforeEach } from 'vitest';
// @ts-ignore
import { initSound, resetSound, THROTTLE_MS, STORAGE_KEY } from '../code/sound/initSound.mjs';

class MockAudioParam {
  value: number = 1;
  setValueAtTime(_val: number, _time: number) {}
  exponentialRampToValueAtTime(_val: number, _time: number) {}
}

class MockGainNode {
  gain = new MockAudioParam();
  connect(_dest: any) {}
}

class MockOscillatorNode {
  type = 'sine';
  frequency = new MockAudioParam();
  connect(_dest: any) {}
  start(_time?: number) {}
  stop(_time?: number) {}
}

class MockBiquadFilterNode {
  type = 'highpass';
  frequency = new MockAudioParam();
  Q = new MockAudioParam();
  connect(_dest: any) {}
}

class MockAudioBufferSourceNode {
  buffer: any = null;
  connect(_dest: any) {}
  start(_time?: number) {}
  stop(_time?: number) {}
}

class MockAudioBuffer {
  sampleRate = 44100;
  length: number;
  data: Float32Array;
  constructor(_channels: number, length: number, _sampleRate: number) {
    this.length = length;
    this.data = new Float32Array(length);
  }
  getChannelData(_ch: number) {
    return this.data;
  }
}

class MockAudioContext {
  state: 'suspended' | 'running' | 'closed' = 'suspended';
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  createBiquadFilter() { return new MockBiquadFilterNode(); }
  createBufferSource() { return new MockAudioBufferSourceNode(); }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
  };
}

describe('Procedural WebAudio Synthesis (Phase 6)', () => {
  beforeEach(() => {
    resetSound();
  });

  it('builds node graph for each kit with AudioContext destination', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: 'on' });
    const kits = ['minimal-click', 'glass', 'soft-mechanical', 'analog-tape'] as const;

    for (const kit of kits) {
      const engine = initSound({
        kit,
        AudioContext: MockAudioContext as any,
        storage,
      });
      engine.unlock();
      const playRes = engine.play(kit === 'analog-tape' ? 'open' : 'click');
      expect(playRes.ok).toBe(true);

      const g = engine.graph();
      expect(g.kit).toBe(kit);
      expect(g.links).toContainEqual(['master', 'destination']);

      if (kit === 'minimal-click' || kit === 'glass') {
        expect(g.links).toContainEqual(['oscillator', 'gain']);
        expect(g.links).toContainEqual(['gain', 'master']);
      }

      if (kit === 'soft-mechanical' || kit === 'analog-tape') {
        expect(g.links).toContainEqual(['buffer', 'biquad']);
        expect(g.links).toContainEqual(['biquad', 'gain']);
        expect(g.links).toContainEqual(['gain', 'master']);
      }
    }
  });

  it('enforces throttling to prevent machine-gun audio spam (< 60ms)', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: 'on' });
    const engine = initSound({
      kit: 'minimal-click',
      AudioContext: MockAudioContext as any,
      storage,
    });
    engine.unlock();

    // First call succeeds
    const res1 = engine.play('click');
    expect(res1.ok).toBe(true);

    // Immediate second call is throttled
    const res2 = engine.play('click');
    expect(res2.ok).toBe(false);
    expect(res2.reason).toBe('throttle');

    const stats = engine.stats();
    expect(stats.played).toBe(1);
    expect(stats.throttled).toBe(1);
  });

  it('is muted by default until user toggle is enabled', () => {
    const storage = createMemoryStorage();
    const engine = initSound({
      kit: 'minimal-click',
      AudioContext: MockAudioContext as any,
      storage,
    });
    engine.unlock();

    // Muted by default
    expect(engine.muted).toBe(true);
    const resMuted = engine.play('click');
    expect(resMuted.ok).toBe(false);
    expect(resMuted.reason).toBe('muted');

    // Unmute
    engine.setMuted(false);
    expect(engine.muted).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe('on');

    const resUnmuted = engine.play('click');
    expect(resUnmuted.ok).toBe(true);
  });

  it('requires unlock before playing audio', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: 'on' });
    const engine = initSound({
      kit: 'glass',
      AudioContext: MockAudioContext as any,
      storage,
    });

    // Not yet unlocked
    const resLocked = engine.play('click');
    expect(resLocked.ok).toBe(false);
    expect(resLocked.reason).toBe('locked');

    // Unlock
    engine.unlock();
    const resUnlocked = engine.play('click');
    expect(resUnlocked.ok).toBe(true);
  });

  it('respects reduced-motion as a proxy for reduced sensory stimulation', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: 'on' });
    const originalMatchMedia = globalThis.matchMedia;

    try {
      globalThis.matchMedia = ((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      })) as any;

      const engine = initSound({
        kit: 'minimal-click',
        AudioContext: MockAudioContext as any,
        storage,
      });
      engine.unlock();

      const res = engine.play('click');
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('reduced');
    } finally {
      globalThis.matchMedia = originalMatchMedia;
    }
  });
});
