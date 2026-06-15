// Tiny reference orchestrator (v0.1) — the join + freshness-guard + ledger
// triple. NOT the moat: this is the minimal demonstration that the spine
// composes. Real orchestrators replace the join heuristics and add triage.

const STRONG = ['uniqueId', 'ifcGuid'];
const WEAK = ['classification', 'workPackage', 'costCode', 'zone'];

function classKey(c) {
  if (!c) return null;
  const arr = Array.isArray(c) ? c : [c];
  return arr.map((x) => `${x.system}:${x.code}`).sort();
}

function zoneKey(z) {
  if (!z) return null;
  return typeof z === 'string' ? z : z.id;
}

function normalizeFor(key, value) {
  if (key === 'classification') return classKey(value);
  if (key === 'zone') return zoneKey(value);
  return value;
}

function shares(a, b, key) {
  const av = normalizeFor(key, a[key]);
  const bv = normalizeFor(key, b[key]);
  if (av == null || bv == null) return false;
  if (Array.isArray(av) && Array.isArray(bv)) return av.some((x) => bv.includes(x));
  return av === bv;
}

// Join two record streams. Each stream is { identity, freshness }[].
// Returns { joined, stale, unjoined, modelInstanceConflicts }.
export function join(streamA, streamB) {
  const joined = [];
  const stale = [];
  const modelInstanceConflicts = [];
  const matchedA = new Set();
  const matchedB = new Set();

  for (let i = 0; i < streamA.length; i++) {
    const a = streamA[i];
    for (let j = 0; j < streamB.length; j++) {
      const b = streamB[j];
      if (a.identity.projectKey !== b.identity.projectKey) continue;

      const strong = STRONG.find((k) => shares(a.identity, b.identity, k));
      const weak = strong ? null : WEAK.find((k) => shares(a.identity, b.identity, k));
      if (!strong && !weak) continue;

      const edge = strong ? { kind: 'strong', key: strong } : { kind: 'weak', key: weak };

      // Model instance guard — only when both sides claim one and they differ.
      if (a.identity.modelInstanceId && b.identity.modelInstanceId
          && a.identity.modelInstanceId !== b.identity.modelInstanceId) {
        modelInstanceConflicts.push({ a, b, edge });
        continue;
      }

      // Freshness guard — different revisionId and at least one side is live.
      const fa = a.freshness, fb = b.freshness;
      const revMismatch = fa.revisionId && fb.revisionId && fa.revisionId !== fb.revisionId;
      const oneLive = fa.confidence === 'live' || fb.confidence === 'live';
      if (revMismatch && oneLive) {
        stale.push({ a, b, edge, reason: 'revisionId differs with live counterpart' });
        continue;
      }

      joined.push({ a, b, edge });
      matchedA.add(i);
      matchedB.add(j);
    }
  }

  const unjoined = [
    ...streamA.filter((_, i) => !matchedA.has(i)).map((x) => ({ side: 'A', record: x })),
    ...streamB.filter((_, j) => !matchedB.has(j)).map((x) => ({ side: 'B', record: x })),
  ];

  return { joined, stale, unjoined, modelInstanceConflicts };
}
