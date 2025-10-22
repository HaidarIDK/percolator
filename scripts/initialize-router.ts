/**
 * Initialize Router Program
 * Creates Registry and Vault accounts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Router Program ID (deployed on devnet)
const ROUTER_PROGRAM_ID = new PublicKey('9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG');

// Router instruction discriminators
enum RouterInstruction {
  Initialize = 0,
}

async function main() {
  console.log('🚀 Percolator Router Initialization Script\n');

  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  console.log('✅ Connected to Solana devnet');

  // Load payer keypair (same one used for Slab initialization)
  const keypairPath = path.join(__dirname, 'slab-payer.json');
  let payer: Keypair;

  try {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
    console.log('📂 Loaded existing keypair from slab-payer.json');
  } catch {
    console.error('❌ Could not load slab-payer.json');
    console.log('\n💡 This keypair should have been created during Slab initialization.');
    console.log('   Check scripts/slab-payer.json exists.\n');
    process.exit(1);
  }

  console.log(`👛 Payer: ${payer.publicKey.toBase58()}`);

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Balance: ${(balance / 1e9).toFixed(8)} SOL\n`);

  // Derive Registry PDA
  const [registryPDA, registryBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('registry')],
    ROUTER_PROGRAM_ID
  );

  console.log(`📋 Registry PDA: ${registryPDA.toBase58()}`);
  console.log(`   Bump: ${registryBump}`);

  // Check if registry already exists
  const registryInfo = await connection.getAccountInfo(registryPDA);
  if (registryInfo) {
    console.log('⚠️  Registry already initialized!');
    console.log(`   Owner: ${registryInfo.owner.toBase58()}`);
    console.log(`   Size: ${registryInfo.data.length} bytes\n`);
    console.log('✅ Router program already initialized - you can start trading!');
    return;
  }

  console.log('   Registry doesn\'t exist yet - will be created\n');

  // Calculate rent for Registry account
  // Registry structure: SlabRegistry with 256 SlabEntry slots
  // SlabEntry is large with multiple Pubkeys and u64 fields
  // Let's use a safe larger size: 100KB to be sure
  const REGISTRY_SIZE = 100 * 1024;
  const registryRent = await connection.getMinimumBalanceForRentExemption(REGISTRY_SIZE);
  console.log(`💵 Rent for Registry: ${(registryRent / 1e9).toFixed(8)} SOL`);

  // Also need to create Vault account
  // Vault structure: smaller, ~500 bytes
  const VAULT_SIZE = 500;
  const vaultRent = await connection.getMinimumBalanceForRentExemption(VAULT_SIZE);
  console.log(`💵 Rent for Vault: ${(vaultRent / 1e9).toFixed(8)} SOL`);

  // Check if we need airdrop
  const totalNeeded = registryRent + vaultRent + 0.01e9; // Registry + Vault rent + buffer for fees
  if (balance < totalNeeded) {
    const needed = totalNeeded - balance;
    console.log(`\n⚠️  Insufficient balance! Need ${(needed / 1e9).toFixed(2)} more SOL.`);
    console.log(`\n🚰 Requesting airdrop...`);
    
    try {
      const signature = await connection.requestAirdrop(payer.publicKey, 2e9);
      await connection.confirmTransaction(signature);
      console.log(`✅ Airdropped 2 SOL`);
      
      const newBalance = await connection.getBalance(payer.publicKey);
      console.log(`💰 New balance: ${(newBalance / 1e9).toFixed(8)} SOL\n`);
    } catch (error: any) {
      console.error(`❌ Airdrop failed: ${error.message}`);
      console.log(`\n💡 Get SOL from: https://faucet.solana.com/`);
      console.log(`   Address: ${payer.publicKey.toBase58()}\n`);
      process.exit(1);
    }
  }

  // Build initialization transaction
  console.log('🔧 Building Router initialization...\n');

  // Generate keypairs for Registry and Vault
  const registryKeypair = Keypair.generate();
  const vaultKeypair = Keypair.generate();

  console.log(`📋 Registry Account: ${registryKeypair.publicKey.toBase58()}`);
  console.log(`🏦 Vault Account: ${vaultKeypair.publicKey.toBase58()}\n`);

  // Create Registry account owned by Router program
  const createRegistryIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: registryKeypair.publicKey,
    lamports: registryRent,
    space: REGISTRY_SIZE,
    programId: ROUTER_PROGRAM_ID,
  });

  // Create Vault account owned by Router program
  const createVaultIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: vaultKeypair.publicKey,
    lamports: vaultRent,
    space: VAULT_SIZE,
    programId: ROUTER_PROGRAM_ID,
  });

  // Build Initialize instruction data: [discriminator(1), authority(32)]
  const data = Buffer.alloc(33);
  data.writeUInt8(RouterInstruction.Initialize, 0);
  payer.publicKey.toBuffer().copy(data, 1);

  const initializeIx = new TransactionInstruction({
    keys: [
      { pubkey: registryKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    programId: ROUTER_PROGRAM_ID,
    data,
  });

  const transaction = new Transaction()
    .add(createRegistryIx)
    .add(createVaultIx)
    .add(initializeIx);

  console.log('📡 Sending Initialize transaction...');

  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, registryKeypair, vaultKeypair], // Payer, registry, and vault need to sign
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      }
    );

    console.log(`\n✅ Router initialized successfully!`);
    console.log(`   Signature: ${signature}`);
    console.log(`   Registry: ${registryKeypair.publicKey.toBase58()}`);
    console.log(`\n🔗 View on Solscan:`);
    console.log(`   https://solscan.io/tx/${signature}?cluster=devnet`);
    console.log(`\n📊 Router Program Info:`);
    console.log(`   Program ID: ${ROUTER_PROGRAM_ID.toBase58()}`);
    console.log(`   Registry PDA: ${registryPDA.toBase58()}`);
    console.log(`   Authority: ${payer.publicKey.toBase58()}`);

    console.log(`   Vault: ${vaultKeypair.publicKey.toBase58()}`);

    // Save info to file
    const routerInfo = {
      programId: ROUTER_PROGRAM_ID.toBase58(),
      registryAccount: registryKeypair.publicKey.toBase58(),
      vaultAccount: vaultKeypair.publicKey.toBase58(),
      registryPDA: registryPDA.toBase58(), // Original PDA (for reference)
      registryBump,
      authority: payer.publicKey.toBase58(),
      initSignature: signature,
      network: 'devnet',
      timestamp: new Date().toISOString(),
    };

    // Save keypairs for future use
    fs.writeFileSync(
      path.join(__dirname, 'router-registry-keypair.json'),
      JSON.stringify(Array.from(registryKeypair.secretKey))
    );

    fs.writeFileSync(
      path.join(__dirname, 'router-vault-keypair.json'),
      JSON.stringify(Array.from(vaultKeypair.secretKey))
    );

    fs.writeFileSync(
      path.join(__dirname, 'router-info.json'),
      JSON.stringify(routerInfo, null, 2)
    );

    console.log(`\n💾 Router info saved to: scripts/router-info.json`);
    console.log(`\n🎉 Router is ready for deposits and trading!`);

  } catch (error: any) {
    console.error(`\n❌ Initialization failed:`, error.message);
    if (error.logs) {
      console.log(`\n📋 Transaction logs:`);
      error.logs.forEach((log: string) => console.log(`   ${log}`));
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

