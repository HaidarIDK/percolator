#!/usr/bin/env ts-node
/**
 * Generate vanity Solana addresses
 * 
 * Usage:
 *   npx ts-node scripts/generate-vanity.ts PERC
 *   npx ts-node scripts/generate-vanity.ts SLAB
 */

import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';

const prefix = process.argv[2];
const outputFile = process.argv[3];

if (!prefix) {
  console.error('Usage: npx ts-node scripts/generate-vanity.ts <PREFIX> [output-file.json]');
  console.error('Example: npx ts-node scripts/generate-vanity.ts PERC wallet.json');
  process.exit(1);
}

console.log(`🎯 Generating vanity address starting with: ${prefix}`);
console.log(`⏱️  Estimated time: ${estimateTime(prefix.length)}`);
console.log(`🔑 Searching... (Press Ctrl+C to stop)\n`);

let attempts = 0;
const startTime = Date.now();

// Progress update every 10k attempts
const progressInterval = setInterval(() => {
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = attempts / elapsed;
  console.log(`   Checked ${attempts.toLocaleString()} addresses (${rate.toFixed(0)}/sec)`);
}, 10000);

while (true) {
  attempts++;
  
  const keypair = Keypair.generate();
  const pubkey = keypair.publicKey.toBase58();
  
  if (pubkey.startsWith(prefix)) {
    clearInterval(progressInterval);
    
    const elapsed = (Date.now() - startTime) / 1000;
    
    console.log(`\n✅ FOUND after ${attempts.toLocaleString()} attempts in ${elapsed.toFixed(1)}s!`);
    console.log(`\n🔑 Public Key:  ${pubkey}`);
    console.log(`🔐 Secret Key:  [${keypair.secretKey.slice(0, 4).join(', ')}...] (${keypair.secretKey.length} bytes)`);
    
    // Save to file if specified
    if (outputFile) {
      const keypairData = {
        publicKey: pubkey,
        secretKey: Array.from(keypair.secretKey)
      };
      
      fs.writeFileSync(outputFile, JSON.stringify(keypairData, null, 2));
      console.log(`\n💾 Saved to: ${outputFile}`);
    }
    
    // Also save to a standard format
    const autoFile = `${prefix.toLowerCase()}-keypair.json`;
    fs.writeFileSync(autoFile, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(`💾 Also saved to: ${autoFile} (Solana CLI format)`);
    
    console.log(`\n📋 To use with Solana CLI:`);
    console.log(`   solana-keygen pubkey ${autoFile}`);
    console.log(`   solana program deploy --program-id ${autoFile} target/deploy/program.so`);
    
    process.exit(0);
  }
  
  // Show progress every 100k attempts
  if (attempts % 100000 === 0) {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = attempts / elapsed;
    process.stdout.write(`\r   ${attempts.toLocaleString()} checked (${rate.toFixed(0)}/sec)...`);
  }
}

function estimateTime(length: number): string {
  // Base58 has 58 characters
  const possibilities = Math.pow(58, length);
  const attemptsPerSecond = 50000; // Conservative estimate
  const seconds = possibilities / attemptsPerSecond / 2; // On average, find in half the space
  
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  return `${Math.round(seconds / 86400)} days`;
}

