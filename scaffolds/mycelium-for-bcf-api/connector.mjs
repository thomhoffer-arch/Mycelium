#!/usr/bin/env node
// mycelium-for-bcf-api — live BCF-API issue source as spine identity records.
// One connector for every BCF-API server (BIMcollab Cloud, Solibri BCF Live,
// Dalux); pick the server with BCF_VENDOR.
import { runAdapter } from './vendor/mycelium-sdk.mjs';
import { resolvePreset } from './src/presets.mjs';
import { makeFetchSource } from './src/bcf-api-client.mjs';

export async function run(env = process.env) {
  const preset = resolvePreset(env.BCF_VENDOR ?? 'bimcollab', env);
  const fetchSource = makeFetchSource({ baseUrl: preset.baseUrl, env });
  return runAdapter(preset.config, { fetchSource });
}

// CLI entry (only when run directly, not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await run();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.conformant ? 0 : 1);
}
