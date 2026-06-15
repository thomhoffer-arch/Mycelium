// Mycelium Spine Adapter (v0.1) — zero-dependency library.
//
// Turns any upstream source (MCP server, REST API, file dump) into a stream of
// Connective-Spine records: identity + freshness, plus edge extraction and a
// gated propose/approve/execute writer that emits hash-chained provenance.
//
// The adapter does NOT join — joining lives in the orchestrator. It only
// translates one source into the shared shape.

import { checkConformance } from '../conformance/validate.mjs';

export const SPINE_VERSION = 'v0.1';

// --- identity + freshness ----------------------------------------------------

export function template(tpl, record) {
  return String(tpl).replace(/\{([^}]+)\}/g, (_, key) => {
    const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), record);
    return v == null ? '' : String(v);
  });
}

export function stamp({ source, revisionId, asOf, confidence = 'snapshot' } = {}) {
  return {
    source,
    revisionId: revisionId || new Date().toISOString(),
    asOf: asOf || null,
    confidence,
  };
}

// --- edge extraction ---------------------------------------------------------

export function deterministicExtract(text, rules = []) {
  const edges = {};
  if (!text) return edges;
  for (const rule of rules) {
    const bucket = (edges[rule.edge] ||= []);
    if (rule.regex) {
      const re = new RegExp(rule.regex, 'g');
      for (const m of text.matchAll(re)) bucket.push(m[1] ?? m[0]);
    } else if (Array.isArray(rule.match)) {
      for (const term of rule.match) {
        if (text.includes(term) && !bucket.includes(term)) bucket.push(term);
      }
    }
  }
  // Dedupe and drop empty buckets.
  for (const k of Object.keys(edges)) {
    edges[k] = [...new Set(edges[k])];
    if (edges[k].length === 0) delete edges[k];
  }
  return edges;
}

// --- normalize one upstream record into a spine record ----------------------

export function toSpineRecord(record, config) {
  const { source, identity = {}, freshness: fr = {}, extract = {} } = config;
  const idTpl = identity.uniqueId;
  const uniqueId = idTpl ? template(idTpl, record) : undefined;
  const text = typeof config.text === 'function' ? config.text(record) : record.text;

  const spine = {
    source,
    sourceLocalId: String(record[identity.localIdField || 'id'] ?? uniqueId ?? ''),
    projectKey: identity.projectKey
      ? template(identity.projectKey, record)
      : record.projectKey || record.project,
  };
  if (uniqueId) spine.uniqueId = uniqueId;
  if (record.ifcGuid) spine.ifcGuid = record.ifcGuid;
  if (record.modelInstanceId) spine.modelInstanceId = record.modelInstanceId;
  if (record.classification) spine.classification = record.classification;
  if (record.workPackage) spine.workPackage = record.workPackage;
  if (record.costCode) spine.costCode = record.costCode;
  if (record.zone) spine.zone = record.zone;

  const edges = deterministicExtract(text, extract.deterministic || []);
  if (Object.keys(edges).length) spine.edges = edges;

  const freshness = stamp({
    source,
    revisionId: fr.revisionId ? template(fr.revisionId, record) : undefined,
    asOf: fr.asOf ? template(fr.asOf, record) : record.modified || null,
    confidence: fr.confidence || 'snapshot',
  });

  return { identity: spine, freshness };
}

// --- pipeline ---------------------------------------------------------------

export async function runAdapter(config, { fetchSource } = {}) {
  if (typeof fetchSource !== 'function') {
    throw new Error('runAdapter: pass { fetchSource } returning an array of records');
  }
  const rows = await fetchSource();
  const out = rows.map((r) => toSpineRecord(r, config));
  const results = out.map(({ identity, freshness }) => ({
    identity,
    freshness,
    ...checkConformance({ identity, freshness }),
  }));
  return {
    source: config.source,
    spineVersion: SPINE_VERSION,
    conformant: results.every((r) => r.conformant),
    records: results,
  };
}
