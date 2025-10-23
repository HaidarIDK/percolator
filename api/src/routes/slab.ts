import { Router } from 'express';
import { PublicKey, Connection } from '@solana/web3.js';

export const slabRouter = Router();

// Your initialized Slab account (from .env)
const SLAB_ACCOUNT = new PublicKey(
  process.env.SLAB_ACCOUNT || '5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB'
);
const SLAB_PROGRAM_ID = new PublicKey(
  process.env.SLAB_PROGRAM_ID || 'SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep'
);

/**
 * GET /api/slab/orderbook
 * Fetch REAL orderbook data from your Slab account on Solana
 */
slabRouter.get('/orderbook', async (req, res) => {
  try {
    console.log('📖 Fetching order book from Slab account on-chain...');
    
    // Connect to Solana devnet
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    // Fetch Slab account data
    const accountInfo = await connection.getAccountInfo(SLAB_ACCOUNT);
    
    if (!accountInfo) {
      return res.status(404).json({ 
        error: 'Slab account not found',
        slabAccount: SLAB_ACCOUNT.toBase58()
      });
    }
    
    console.log(`✅ Slab account found: ${accountInfo.data.length} bytes`);
    console.log(`   Owner: ${accountInfo.owner.toBase58()}`);
    console.log(`   Executable: ${accountInfo.executable}`);
    
    // TODO: Parse the binary data to extract order book
    // For now, return account metadata + empty orderbook
    // Once we have orders on-chain, we'll parse them here
    
    const accountData = accountInfo.data;
    
    // Slab account structure (from programs/slab/src/state/slab.rs):
    // - Header (first ~200 bytes)
    // - Account pool
    // - Instruments
    // - Orders pool
    // - Positions pool
    // - Reservations pool
    // - etc.
    
    // For now, return empty book (will populate as users trade)
    res.json({
      success: true,
      slabAccount: SLAB_ACCOUNT.toBase58(),
      programId: SLAB_PROGRAM_ID.toBase58(),
      accountSize: accountInfo.data.length,
      lamports: accountInfo.lamports,
      owner: accountInfo.owner.toBase58(),
      orderbook: {
        bids: [], // TODO: Parse from account data
        asks: [], // TODO: Parse from account data
        midPrice: 0,
        spread: 0,
        lastUpdate: Date.now()
      },
      message: 'Slab account initialized. Order book empty - make your first trade!'
    });
    
  } catch (error: any) {
    console.error('Error fetching Slab orderbook:', error);
    res.status(500).json({ 
      error: error.message,
      slabAccount: SLAB_ACCOUNT.toBase58()
    });
  }
});

/**
 * GET /api/slab/state
 * Get full Slab state info
 */
slabRouter.get('/state', async (req, res) => {
  try {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    const accountInfo = await connection.getAccountInfo(SLAB_ACCOUNT);
    
    if (!accountInfo) {
      return res.status(404).json({ error: 'Slab account not found' });
    }
    
    res.json({
      success: true,
      slabAccount: SLAB_ACCOUNT.toBase58(),
      programId: SLAB_PROGRAM_ID.toBase58(),
      size: accountInfo.data.length,
      lamports: accountInfo.lamports,
      rentEpoch: accountInfo.rentEpoch,
      owner: accountInfo.owner.toBase58(),
      executable: accountInfo.executable,
      // TODO: Parse header, instruments, orders, positions, etc.
    });
    
  } catch (error: any) {
    console.error('Error fetching Slab state:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/slab/transactions
 * Get recent transactions for this Slab account
 */
slabRouter.get('/transactions', async (req, res) => {
  try {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Fetch signatures for this account
    const signatures = await connection.getSignaturesForAddress(
      SLAB_ACCOUNT,
      { limit }
    );
    
    res.json({
      success: true,
      slabAccount: SLAB_ACCOUNT.toBase58(),
      transactions: signatures.map(sig => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        err: sig.err,
        memo: sig.memo,
        solscanLink: `https://solscan.io/tx/${sig.signature}?cluster=devnet`
      }))
    });
    
  } catch (error: any) {
    console.error('Error fetching Slab transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

