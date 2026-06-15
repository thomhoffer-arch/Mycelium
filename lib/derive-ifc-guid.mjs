// Derive an IFC GlobalId from a Revit UniqueId.
//
// Revit UniqueId is "EpisodeGUID-ElementId", where EpisodeGUID is 36 hex
// characters with dashes and the last segment is the ElementId as 8 hex
// chars XOR-mixed into the GUID's last 4 bytes. The IFC GlobalId is the
// resulting 16-byte GUID re-encoded in IFC's compressed base64 (22 chars,
// alphabet 0-9A-Za-z_$).
//
// Reference: Revit SDK IFCExportUtils + buildingSMART IfcGloballyUniqueId.
// Algorithm matches Autodesk's documented Revit → IFC GUID derivation.

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';

function parseUniqueId(uniqueId) {
  // EpisodeGUID is 36 chars (8-4-4-4-12). ElementId is the trailing 8 hex.
  // Some forms separate them with a dash: "<GUID>-<8hex>".
  const s = String(uniqueId).trim();
  const m = s.match(/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})-([0-9a-fA-F]{8})$/);
  if (!m) throw new Error(`invalid Revit UniqueId: ${uniqueId}`);
  return { episode: m[1], elementHex: m[2] };
}

function guidToBytes(guidStr) {
  const hex = guidStr.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

// Encode 16 raw bytes as IFC GlobalId (22 chars, base64 with IFC alphabet).
// IFC packs the 128-bit GUID into 22 base-64 digits: one leading 2-bit digit,
// then seven 3-byte → 4-digit groups.
function bytesToIfcGuid(bytes) {
  if (bytes.length !== 16) throw new Error('need 16 bytes');
  const out = [];
  // Leading 2-bit char from the top 2 bits of byte 0.
  out.push(ALPHABET[(bytes[0] >> 6) & 0x3]);
  // Remaining 6 bits of byte 0 + 7 groups of 3 bytes → 21 chars.
  let acc = bytes[0] & 0x3f;
  let bits = 6;
  for (let i = 1; i < 16; i++) {
    acc = (acc << 8) | bytes[i];
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      out.push(ALPHABET[(acc >> bits) & 0x3f]);
    }
  }
  if (bits) out.push(ALPHABET[(acc << (6 - bits)) & 0x3f]);
  return out.join('');
}

export function deriveIfcGuid(uniqueId) {
  const { episode, elementHex } = parseUniqueId(uniqueId);
  const bytes = guidToBytes(episode);
  // Revit XORs the 32-bit ElementId into the last 4 bytes of the EpisodeGUID
  // (big-endian) before encoding. ElementId can overflow 32 bits in modern
  // Revit; the algorithm uses the low 32 bits.
  const elem = BigInt('0x' + elementHex) & 0xffffffffn;
  bytes[12] ^= Number((elem >> 24n) & 0xffn);
  bytes[13] ^= Number((elem >> 16n) & 0xffn);
  bytes[14] ^= Number((elem >> 8n) & 0xffn);
  bytes[15] ^= Number(elem & 0xffn);
  return bytesToIfcGuid(bytes);
}

if (process.argv[1] && process.argv[1].endsWith('derive-ifc-guid.mjs')) {
  const uid = process.argv[2];
  if (!uid) {
    console.error('usage: node lib/derive-ifc-guid.mjs <revit-uniqueid>');
    process.exit(2);
  }
  console.log(deriveIfcGuid(uid));
}
