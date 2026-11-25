"""Synthesize a fake "scream" WAV to feed Chrome's fake microphone (--use-file-for-fake-audio-capture).
Room noise → rising AAAH with vibrato → a pause (download should stop) → a louder second scream.
Usage: python -I reels/make-scream.py out.wav"""
import sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def voice(seconds, f0, amp, rough=0.25):
    t = np.arange(int(seconds * SR)) / SR
    f = f0 * (1 + 0.035 * np.sin(2 * np.pi * 5.5 * t)) * (1 + 0.08 * t / max(seconds, 1e-6))  # vibrato + strain
    phase = 2 * np.pi * np.cumsum(f) / SR
    # bright, buzzy "AAAH": stacked harmonics with vowel-ish formant weights
    sig = sum(w * np.sin(k * phase) for k, w in [(1, 1.0), (2, 0.7), (3, 0.55), (4, 0.35), (5, 0.3), (6, 0.18), (8, 0.12)])
    sig = sig / np.max(np.abs(sig))
    sig = (1 - rough) * sig + rough * rng.uniform(-1, 1, t.size)  # breath + rasp
    env = np.minimum(1, t / 0.25) * np.minimum(1, (seconds - t) / 0.3)  # attack/release
    return amp * env * sig


def room(seconds, amp=0.004):
    return amp * rng.normal(0, 1, int(seconds * SR))


parts = [
    room(1.6),
    voice(3.6, 430, 0.55),
    room(1.5),
    voice(7.5, 470, 0.92, rough=0.3),
    room(0.6),
    voice(8.0, 450, 0.75),
]
x = np.clip(np.concatenate(parts), -1, 1)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((x * 32767).astype("<i2").tobytes())
print(f"wrote {sys.argv[1]} ({x.size / SR:.1f}s)")
