#!/usr/bin/env ts-node
/**
 * Initialize Slab using Phantom wallet (paste your keypair)
 */

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import bs58 from 'bs58';

// Program IDs
const SLAB_PROGRAM_ID = new PublicKey('6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz');
const ROUTER_PROGRAM_ID = new PublicKey('9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG');

// Account size: 512 KB (~3.5 SOL rent)
const SLAB_ACCOUNT_SIZE = 512 * 1024;

async function main() {
  console.log('🚀 Slab Initialization (Phantom Wallet Mode)\n');
  
  // Use YOUR Phantom wallet address
  const PHANTOM_WALLET_ADDRESS = 'BWiQa58X8dRArDbe7G44VoCtDqgCeCth7L6SvoKBeXRx'; // Your wallet!
  const payer = new PublicKey(PHANTOM_WALLET_ADDRESS);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  console.log('✅ Connected to devnet');
  console.log(`👛 Payer: ${payer.toBase58()}`);
  
  // Check balance
  const balance = await connection.getBalance(payer);
  console.log(`💰 Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  const rentExemption = await connection.getMinimumBalanceForRentExemption(SLAB_ACCOUNT_SIZE);
  console.log(`💵 Rent needed: ${rentExemption / LAMPORTS_PER_SOL} SOL`);
  
  if (balance < rentExemption + 0.01 * LAMPORTS_PER_SOL) {
    console.log('\n❌ Insufficient balance!');
    console.log(`   Need at least ${(rentExemption / LAMPORTS_PER_SOL + 0.01).toFixed(2)} SOL`);
    console.log(`\n💡 Get SOL: Click "+2 SOL" button in dashboard or visit https://faucet.solana.com/`);
    process.exit(1);
  }
  
  // Create new Slab account
  const slabAccount = Keypair.generate();
  console.log(`\n🆔 New Slab Account: ${slabAccount.publicKey.toBase58()}`);
  
  // Build Create Account instruction
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: slabAccount.publicKey,
    lamports: rentExemption,
    space: SLAB_ACCOUNT_SIZE,
    programId: SLAB_PROGRAM_ID,
  });
  
  // Build Initialize instruction data
  const instructionData = Buffer.alloc(1 + 32 + 32 + 32 + 2 + 2 + 8 + 8 + 8 + 2);
  let offset = 0;
  
  instructionData.writeUInt8(4, offset); // Discriminator: Initialize
  offset += 1;
  
  payer.toBuffer().copy(instructionData, offset); // Authority
  offset += 32;
  
  SystemProgram.programId.toBuffer().copy(instructionData, offset); // Oracle (dummy)
  offset += 32;
  
  ROUTER_PROGRAM_ID.toBuffer().copy(instructionData, offset); // Router
  offset += 32;
  
  instructionData.writeUInt16LE(500, offset); // IMR: 5%
  offset += 2;
  
  instructionData.writeUInt16LE(300, offset); // MMR: 3%
  offset += 2;
  
  instructionData.writeBigInt64LE(BigInt(-2), offset); // Maker fee: -0.02%
  offset += 8;
  
  instructionData.writeBigInt64LE(BigInt(5), offset); // Taker fee: 0.05%
  offset += 8;
  
  instructionData.writeBigUInt64LE(BigInt(100), offset); // Batch window: 100ms
  offset += 8;
  
  instructionData.writeUInt16LE(3, offset); // Freeze levels
  
  const initializeIx = new TransactionInstruction({
    programId: SLAB_PROGRAM_ID,
    keys: [
      { pubkey: slabAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: false },
    ],
    data: instructionData,
  });
  
  // Build transaction
  const transaction = new Transaction()
    .add(createAccountIx)
    .add(initializeIx);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;
  
  // Partially sign with Slab account
  transaction.partialSign(slabAccount);
  
  // Serialize for Phantom to sign
  const serialized = transaction.serialize({ requireAllSignatures: false });
  const base64Tx = serialized.toString('base64');
  
  console.log('\n📝 TRANSACTION READY FOR PHANTOM\n');
  console.log('Copy this Base64 transaction and paste it in your browser console:');
  console.log('(On percolator.site/dashboard, open DevTools → Console)\n');
  console.log('---BEGIN TRANSACTION---');
  console.log(base64Tx);
  console.log('---END TRANSACTION---\n');
  console.log('Then run this code in the browser console:\n');
  console.log(`
const tx = "${base64Tx}";
const connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
const transaction = solanaWeb3.Transaction.from(Buffer.from(tx, 'base64'));
const { signature } = await window.solana.signAndSendTransaction(transaction);
console.log('✅ Slab initialized!');
console.log('Signature:', signature);
console.log('View:', 'https://solscan.io/tx/' + signature + '?cluster=devnet');
  `.trim());
  
  console.log('\n💡 OR: Just use the "+2 SOL" button in dashboard first, then run this script again!');
}

main().catch(console.error);

