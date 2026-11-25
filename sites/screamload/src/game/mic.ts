/* Microphone → loudness. Audio never leaves the device and nothing is recorded:
   we only read the instantaneous level (RMS) from an AnalyserNode. */

export type Mic = { rms(): number; stop(): void };

export async function openMic(): Promise<Mic> {
  // Gain control/noise suppression off, so loudness reflects how hard you actually scream.
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const ctx = new AudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0;
  src.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  return {
    rms() {
      analyser.getFloatTimeDomainData(buf);
      let s = 0;
      for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      return Math.sqrt(s / buf.length);
    },
    stop() {
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}

/** Phone-mic estimate of loudness in dB: dBFS shifted so speech lands ~60–75 and a scream ~90–100.
 *  Real dB SPL needs a calibrated mic; we say "≈ dB" in the UI for honesty. */
export const toDb = (rms: number) => Math.max(0, Math.min(130, 20 * Math.log10(Math.max(rms, 1e-6)) + 100));
