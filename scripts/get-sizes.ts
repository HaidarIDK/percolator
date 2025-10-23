// Quick script to calculate exact struct sizes

// SlabEntry structure
const SlabEntry = {
  slab_id: 32,        // Pubkey
  version_hash: 32,   // [u8; 32]
  oracle_id: 32,      // Pubkey
  imr: 8,             // u64
  mmr: 8,             // u64
  maker_fee_cap: 8,   // u64
  taker_fee_cap: 8,   // u64
  latency_sla_ms: 8,  // u64
  max_exposure: 16,   // u128
  registered_ts: 8,   // u64
  active: 1,          // bool
  _padding: 7,        // [u8; 7]
};

const slabEntrySize = Object.values(SlabEntry).reduce((a, b) => a + b, 0);

// SlabRegistry structure
const SlabRegistryHeader = {
  router_id: 32,            // Pubkey
  governance: 32,           // Pubkey
  slab_count: 2,            // u16
  bump: 1,                  // u8
  _padding: 5,              // [u8; 5]
  imr: 8,                   // u64
  mmr: 8,                   // u64
  liq_band_bps: 8,          // u64
  preliq_buffer: 16,        // i128
  preliq_band_bps: 8,       // u64
  router_cap_per_slab: 8,   // u64
  min_equity_to_quote: 16,  // i128
  oracle_tolerance_bps: 8,  // u64
  _padding2: 8,             // [u8; 8]
};

const headerSize = Object.values(SlabRegistryHeader).reduce((a, b) => a + b, 0);
const MAX_SLABS = 256;
const registrySize = headerSize + (slabEntrySize * MAX_SLABS);

console.log('SlabEntry size:', slabEntrySize, 'bytes');
console.log('SlabRegistry header:', headerSize, 'bytes');
console.log('SlabRegistry total (with 256 slabs):', registrySize, 'bytes');

// SlabState size
const SlabStateSize = 50 * 1024; // 50KB as defined in initialize-slab.ts
console.log('\nSlabState size:', SlabStateSize, 'bytes');

