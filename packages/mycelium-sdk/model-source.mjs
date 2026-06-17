// mycelium-sdk/model-source — Model-source contract (v0.1)
//
// A model source exposes raw BIM/CAD data over MCP. It does NOT build spine
// records — the orchestrator does that from the raw fields. This module provides
// the canonical tool-name list and a conformance check for implementors.
//
// See spec/model-source-contract.md for the full wire shapes.

export const MODEL_SOURCE_VERSION = 'v0.1';

// Exact wire names (snake_case) every conformant model source must expose.
export const MODEL_SOURCE_TOOLS = [
  'get_model_revision',
  'filter_elements_by_region',
  'get_element_by_ifcguid',
  'get_element_by_native_id',
  'get_door_rooms',
];

/**
 * Check that a model-source tool manifest conforms to the contract.
 * @param {string[]} toolNames - names reported by the MCP server's tools/list
 * @returns {{ conformant: boolean, version: string, missing: string[], errors: string[] }}
 */
export function checkModelSourceConformance(toolNames = []) {
  const names = new Set(toolNames);
  const missing = MODEL_SOURCE_TOOLS.filter((t) => !names.has(t));
  const errors = missing.map((t) => `missing required tool: ${t}`);
  return {
    conformant: errors.length === 0,
    version: MODEL_SOURCE_VERSION,
    missing,
    errors,
  };
}
