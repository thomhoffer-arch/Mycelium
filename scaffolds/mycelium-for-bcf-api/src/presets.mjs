// Per-vendor presets for the BCF-API connector.
//
// A preset is just a spine `config` (identity/freshness templates) plus the
// transport details for that server: base-URL template, BCF protocol version,
// and auth style. Because the buildingSMART BCF-API is a standard, presets
// differ only in URL/auth and a couple of extension-field names — the spine
// mapping below is shared.
//
// confidence:'live' is the whole point — this is the API, not exported files.

const sharedIdentity = {
  uniqueId: 'bcf:{topicGuid}',
  projectKey: '{project}',
  localIdField: 'topicGuid',
};
const sharedFreshness = {
  revisionId: '{modifiedDate}',
  asOf: '{modifiedDate}',
  confidence: 'live',
};

export const PRESETS = {
  // BIMcollab Cloud / Nexus — https://{space}.bimcollab.com
  bimcollab: {
    // {space} and {project} are filled from env (BCF_SPACE, BCF_PROJECT_ID).
    baseUrl: 'https://{space}.bimcollab.com/bcf/{version}',
    version: '2.1',
    auth: 'oauth2-bearer', // pass token via BCF_TOKEN
    config: { source: 'bimcollab', identity: sharedIdentity, freshness: sharedFreshness },
  },

  // Solibri BCF Live Connector (Solibri Desktop's local BCF-API bridge).
  solibri: {
    baseUrl: 'http://localhost:8080/bcf/{version}',
    version: '2.1',
    auth: 'oauth2-bearer',
    config: { source: 'solibri-live', identity: sharedIdentity, freshness: sharedFreshness },
  },

  // Dalux Field/Build (BCF-API compliant).
  dalux: {
    baseUrl: 'https://field.dalux.com/service/api/bcf/{version}',
    version: '2.1',
    auth: 'oauth2-bearer',
    config: { source: 'dalux', identity: sharedIdentity, freshness: sharedFreshness },
  },
};

export function resolvePreset(vendor, env = process.env) {
  const preset = PRESETS[vendor];
  if (!preset) throw new Error(`unknown BCF_VENDOR "${vendor}" (have: ${Object.keys(PRESETS).join(', ')})`);
  const baseUrl = preset.baseUrl
    .replace('{space}', env.BCF_SPACE ?? 'demo')
    .replace('{version}', preset.version);
  return { ...preset, baseUrl };
}
