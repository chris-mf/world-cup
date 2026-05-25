let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAirHorn(): void {
  const ctx = getContext();
  const now = ctx.currentTime;
  const duration = 1.4;

  const frequencies = [311, 370, 466];

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.97, now);
    osc.frequency.linearRampToValueAtTime(freq, now + 0.12);
    osc.frequency.setValueAtTime(freq, now + duration - 0.3);
    osc.frequency.linearRampToValueAtTime(freq * 0.95, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.Q.setValueAtTime(1.5, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
    gain.gain.setValueAtTime(0.12, now + duration - 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  });
}
