#!/usr/bin/env node
// ERPNext connector — translates Purchase Orders into spine identity records.
// Joins via classification (NL-SfB) and workPackage; never carries a model GUID.
// Replace `fetchSource()` with a real ERPNext REST call; keep the shape.
import { runAdapter } from 'mycelium-sdk';

const config = {
  source: 'erpnext',
  identity: {
    uniqueId: 'erpnext:{name}',
    projectKey: '{project}',
    localIdField: 'name',
  },
  freshness: { revisionId: '{modified}', asOf: '{modified}', confidence: 'snapshot' },
};

async function fetchSource() {
  // In production: GET /api/method/frappe.client.get_list?doctype=Purchase Order&...
  return [
    {
      name: 'PUR-ORD-2026-00005',
      project: 'horizons',
      classification: [{ system: 'NL-SfB', code: '23.22' }],
      workPackage: 'WP-BALCONY-L3',
      costCode: 'CC-2326',
      modified: '2026-06-12T10:00:00Z',
    },
    {
      name: 'PUR-ORD-2026-00012',
      project: 'horizons',
      classification: [{ system: 'NL-SfB', code: '32.31' }],
      workPackage: 'WP-DOOR-B',
      modified: '2026-06-14T08:00:00Z',
    },
  ];
}

const result = await runAdapter(config, { fetchSource });
console.log(JSON.stringify(result, null, 2));
process.exit(result.conformant ? 0 : 1);
