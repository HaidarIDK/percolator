#!/usr/bin/env ts-node
/**
 * Initialize Percolator Slab Program on Devnet
 * 
 * This script creates and initializes a Slab account for the order book.
 */

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import * as fs from 'fs';

// Program IDs (deployed on devnet with vanity addresses)
const SLAB_PROGRAM_ID = new PublicKey('SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep');
const ROUTER_PROGRAM_ID = new PublicKey('RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr');

// Slab state size: SlabState struct (v0 minimal ~3.4KB)
// SlabHeader (200B) + QuoteCache (136B) + BookArea (3072B) = 3,408 bytes
const SLAB_ACCOUNT_SIZE = 3408; // Exact size matching SlabState::LEN

async function main() {
  console.log('🚀 Percolator Slab Initialization Script\n');

  // Connect to Solana devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  console.log('✅ Connected to Solana devnet');

  // Load payer keypair (PERC vanity wallet)
  let payer: Keypair;
  const KEYPAIR_PATH = 'perc-keypair.json';
  
  if (fs.existsSync(KEYPAIR_PATH)) {
    console.log('📂 Loading PERC vanity wallet...');
    const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
    payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
  } else {
    console.error('❌ Could not find perc-keypair.json');
    console.log('\n💡 Make sure scripts/perc-keypair.json exists.\n');
    process.exit(1);
  }

  console.log(`👛 Payer: ${payer.publicKey.toBase58()}`);

  // Check balance and request airdrops if needed
  let balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  // Calculate rent needed (with some buffer for transaction fees)
  const rentExemptionEstimate = await connection.getMinimumBalanceForRentExemption(SLAB_ACCOUNT_SIZE);
  const totalNeeded = rentExemptionEstimate + (0.1 * LAMPORTS_PER_SOL); // Add 0.1 SOL for fees
  
  console.log(`💵 Estimated rent needed: ${rentExemptionEstimate / LAMPORTS_PER_SOL} SOL`);
  console.log(`📊 Total needed (with fees): ${totalNeeded / LAMPORTS_PER_SOL} SOL`);

  if (balance < totalNeeded) {
    const solNeeded = Math.ceil((totalNeeded - balance) / LAMPORTS_PER_SOL);
    console.log(`\n⚠️  Insufficient balance! Need ${solNeeded} more SOL.`);
    console.log(`\n🚰 Requesting airdrops from faucet...`);
    console.log(`   (This may take multiple attempts due to rate limits)\n`);
    
    // Request multiple small airdrops (max 2 SOL per request)
    const airdropAttempts = Math.ceil(solNeeded / 2);
    let successfulAirdrops = 0;
    
    for (let i = 0; i < airdropAttempts && balance < totalNeeded; i++) {
      try {
        console.log(`   Airdrop ${i + 1}/${airdropAttempts}...`);
        const airdropAmount = Math.min(2 * LAMPORTS_PER_SOL, totalNeeded - balance);
        const airdropSig = await connection.requestAirdrop(payer.publicKey, airdropAmount);
        await connection.confirmTransaction(airdropSig, 'confirmed');
        successfulAirdrops++;
        balance = await connection.getBalance(payer.publicKey);
        console.log(`   ✅ Success! New balance: ${balance / LAMPORTS_PER_SOL} SOL`);
        
        // Wait between airdrops to avoid rate limit
        if (i < airdropAttempts - 1 && balance < totalNeeded) {
          console.log(`   ⏳ Waiting 5 seconds before next airdrop...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error: any) {
        console.log(`   ❌ Airdrop ${i + 1} failed: ${error.message}`);
      }
    }
    
    // Check final balance
    balance = await connection.getBalance(payer.publicKey);
    if (balance < totalNeeded) {
      console.log(`\n❌ Still insufficient balance after ${successfulAirdrops} airdrops.`);
      console.log(`   Current: ${balance / LAMPORTS_PER_SOL} SOL`);
      console.log(`   Needed: ${totalNeeded / LAMPORTS_PER_SOL} SOL`);
      console.log(`\n💡 Solutions:`);
      console.log(`   1. Get more SOL from web faucet: https://faucet.solana.com/`);
      console.log(`      Address: ${payer.publicKey.toBase58()}`);
      console.log(`   2. Wait a few minutes and run script again (rate limit resets)`);
      console.log(`   3. Use a different wallet with more SOL`);
      process.exit(1);
    }
    
    console.log(`\n✅ Sufficient balance acquired! (${balance / LAMPORTS_PER_SOL} SOL)\n`);
  }

  // Create Slab account
  console.log('\n📦 Creating Slab account...');
  const slabAccount = Keypair.generate();
  console.log(`🆔 Slab Account: ${slabAccount.publicKey.toBase58()}`);

  const rentExemption = await connection.getMinimumBalanceForRentExemption(SLAB_ACCOUNT_SIZE);
  console.log(`💵 Rent required: ${rentExemption / LAMPORTS_PER_SOL} SOL`);

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: slabAccount.publicKey,
    lamports: rentExemption,
    space: SLAB_ACCOUNT_SIZE,
    programId: SLAB_PROGRAM_ID,
  });

  // Build Initialize instruction (Tolly's format)
  console.log('\n🔧 Building Initialize instruction...');
  
  // Create a dummy instrument ID (market identifier)
  const instrumentId = Keypair.generate().publicKey;
  
  // Derive the PDA bump (even though we're using regular account for v0)
  const [expectedPDA, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('slab'), instrumentId.toBuffer()],
    SLAB_PROGRAM_ID
  );
  
  console.log(`   Instrument ID: ${instrumentId.toBase58()}`);
  console.log(`   Expected PDA: ${expectedPDA.toBase58()}`);
  console.log(`   PDA Bump: ${bump}\n`);
  
  // Instruction data layout (121 bytes):
  // - 1 byte: discriminator (0 = Initialize)
  // - 32 bytes: lp_owner
  // - 32 bytes: router_id
  // - 32 bytes: instrument
  // - 8 bytes: mark_px (i64)
  // - 8 bytes: taker_fee_bps (i64)
  // - 8 bytes: contract_size (i64)
  // - 1 byte: bump
  
  const instructionData = Buffer.alloc(1 + 32 + 32 + 32 + 8 + 8 + 8 + 1);
  let offset = 0;
  
  // Discriminator: 0 = Initialize
  instructionData.writeUInt8(0, offset);
  offset += 1;
  
  // LP Owner - use payer
  console.log(`   LP Owner: ${payer.publicKey.toBase58()}`);
  payer.publicKey.toBuffer().copy(instructionData, offset);
  offset += 32;
  
  // Router ID
  ROUTER_PROGRAM_ID.toBuffer().copy(instructionData, offset);
  offset += 32;
  
  // Instrument ID
  instrumentId.toBuffer().copy(instructionData, offset);
  offset += 32;
  
  // Mark price: $100 (in 1e6 scale = 100_000_000)
  instructionData.writeBigInt64LE(BigInt(100_000_000), offset);
  offset += 8;
  
  // Taker fee: 5 basis points
  instructionData.writeBigInt64LE(BigInt(5), offset);
  offset += 8;
  
  // Contract size: 1.0 (in 1e6 scale = 1_000_000)
  instructionData.writeBigInt64LE(BigInt(1_000_000), offset);
  offset += 8;
  
  // Bump seed
  instructionData.writeUInt8(bump, offset);
  
  const initializeIx = {
    programId: SLAB_PROGRAM_ID,
    keys: [
      { pubkey: slabAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    data: instructionData,
  };

  // Build and send INITIALIZATION transaction
  console.log('\n📤 Submitting initialization transaction...');
  const initTransaction = new Transaction()
    .add(createAccountIx)
    .add(initializeIx);

  try {
    const initSignature = await sendAndConfirmTransaction(
      connection,
      initTransaction,
      [payer, slabAccount],
      { commitment: 'confirmed' }
    );

    console.log('\n🎉 SUCCESS! Slab initialized!');
    console.log(`\n📊 Details:`);
    console.log(`   Slab Account: ${slabAccount.publicKey.toBase58()}`);
    console.log(`   Instrument ID: ${instrumentId.toBase58()}`);
    console.log(`   Init Transaction: ${initSignature}`);
    console.log(`   Mark Price: $100 (100,000,000 in 1e6 scale)`);
    console.log(`   Contract Size: 1.0 (1,000,000 in 1e6 scale)`);
    console.log(`   Taker Fee: 5 basis points`);
    console.log(`\n🔍 View on Explorer:`);
    console.log(`   https://explorer.solana.com/tx/${initSignature}?cluster=devnet`);
    console.log(`   https://explorer.solana.com/address/${slabAccount.publicKey.toBase58()}?cluster=devnet`);
    
    // Save the Slab account address
    fs.writeFileSync(
      'slab-account.json',
      JSON.stringify({
        slabAccount: slabAccount.publicKey.toBase58(),
        instrumentId: instrumentId.toBase58(),
        programId: SLAB_PROGRAM_ID.toBase58(),
        routerId: ROUTER_PROGRAM_ID.toBase58(),
        initTransaction: initSignature,
        timestamp: new Date().toISOString(),
        markPrice: 100_000_000,
        contractSize: 1_000_000,
        takerFeeBps: 5,
      }, null, 2)
    );
    console.log(`\n💾 Slab account info saved to slab-account.json`);
    
    console.log(`\n✅ Next steps:`);
    console.log(`   1. Update backend to use this Slab account:`);
    console.log(`      SLAB_ACCOUNT=${slabAccount.publicKey.toBase58()}`);
    console.log(`   2. Test Reserve/Commit transactions with the Router!`);
    
  } catch (error: any) {
    console.error('\n❌ Initialization failed:', error);
    if (error.logs) {
      console.error('\n📝 Transaction logs:');
      error.logs.forEach((log: string) => console.error(`   ${log}`));
    }
    process.exit(1);
  }
}

main().catch(console.error);

