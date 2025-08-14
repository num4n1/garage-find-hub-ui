// src/lib/sessionShuffle.ts

// Simple 53-bit hash for stable ordering
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Get or create a seed for this login session
export function getSessionSeed(uid: string): number {
  const key = `yf_seed_${uid}`;
  let val = sessionStorage.getItem(key);
  if (!val) {
    val = String(Math.floor(Math.random() * 0x7fffffff));
    sessionStorage.setItem(key, val);
  }
  return Number(val);
}

// Stable shuffle by id + seed
export function stableShuffleById<T extends { id: string }>(items: T[], seed: number): T[] {
  const arr = items.slice();
  arr.sort((a, b) => {
    const ha = cyrb53(`${a.id}|${seed}`);
    const hb = cyrb53(`${b.id}|${seed}`);
    return ha - hb;
  });
  return arr;
}
