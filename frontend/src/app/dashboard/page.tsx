"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, Transaction, clusterApiUrl } from '@solana/web3.js';
import { cn } from '@/lib/utils';
import { Target, Zap, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

// Toast Container Component
const ToastContainer = ({ toasts, onClose }: { toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>, onClose: (id: string) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "px-4 py-3 rounded-lg shadow-lg max-w-sm",
            toast.type === 'success' && "bg-green-500/20 border border-green-500/50 text-green-400",
            toast.type === 'error' && "bg-red-500/20 border border-red-500/50 text-red-400",
            toast.type === 'warning' && "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400",
            toast.type === 'info' && "bg-blue-500/20 border border-blue-500/50 text-blue-400"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium whitespace-pre-line">{toast.message}</span>
            <button
              onClick={() => onClose(toast.id)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// TradingView Chart Component with Real Data
const TradingViewChartComponent = ({ symbol, selectedCoin, onCoinChange }: { symbol: string, selectedCoin: "ethereum" | "bitcoin" | "solana", onCoinChange: (coin: "ethereum" | "bitcoin" | "solana") => void }) => {
  const [mounted, setMounted] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real-time market data from backend
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/dashboard/${selectedCoin}`);
        const data = await response.json();
        if (data) {
          setMarketData(data);
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [selectedCoin]);

  useEffect(() => {
    if (!mounted) return;

    // Map coin to TradingView symbol
    const getTradingViewSymbol = () => {
      switch(selectedCoin) {
        case "ethereum": return "COINBASE:ETHUSD";
        case "bitcoin": return "COINBASE:BTCUSD";
        case "solana": return "COINBASE:SOLUSD";
      }
    };

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: getTradingViewSymbol(),
          interval: '15',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0a0a0f',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: true,
          save_image: false,
          container_id: 'tradingview_chart',
          backgroundColor: '#0a0a0f',
          gridColor: '#181825',
          studies: [],
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="https://s3.tradingview.com/tv.js"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [mounted, selectedCoin]);

  const getPriceChangeColor = () => {
    if (!marketData?.price_change_percentage_24h) return "text-gray-400";
    return marketData.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400";
  };

  const getCoinColor = (coin: "ethereum" | "bitcoin" | "solana") => {
    switch(coin) {
      case "ethereum": return "text-blue-400";
      case "bitcoin": return "text-orange-400";
      case "solana": return "text-purple-400";
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-full bg-black/20 rounded-2xl border border-[#181825] overflow-hidden">
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#181825]">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-lg">Chart</h3>
          
          {/* Coin Selector Pills */}
          <div className="flex items-center gap-2 bg-[#0a0a0f] rounded-lg p-1">
            <button
              onClick={() => onCoinChange("ethereum")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                selectedCoin === "ethereum"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              ETH
            </button>
            <button
              onClick={() => onCoinChange("bitcoin")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                selectedCoin === "bitcoin"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              BTC
            </button>
            <button
              onClick={() => onCoinChange("solana")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                selectedCoin === "solana"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              SOL
            </button>
          </div>

          {marketData && (
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-bold", getCoinColor(selectedCoin))}>
                ${marketData.current_price?.toLocaleString() || '0.00'}
              </span>
              <span className={cn("text-xs font-medium", getPriceChangeColor())}>
                {marketData.price_change_percentage_24h >= 0 ? '+' : ''}
                {marketData.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>
      
      <div className="h-[calc(100%-3rem)]">
        <div id="tradingview_chart" className="w-full h-full" />
      </div>
    </div>
  );
};

// OrderBook Component
const OrderBook = ({ symbol }: { symbol: string }) => {
  const [orderbook, setOrderbook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    // Fetch LIVE orderbook from YOUR Slab account on-chain
    const fetchOrderbook = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(`${API_URL}/api/slab-live/orderbook`)
        const data = await response.json()
        
        if (data.success) {
          setOrderbook(data.orderbook)
          setWsConnected(true) // Mark as connected to blockchain
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch live Slab orderbook:', error)
        setLoading(false)
        setWsConnected(false)
      }
    }

    fetchOrderbook()

    // Refresh every 5 seconds from blockchain
    const interval = setInterval(fetchOrderbook, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [symbol])

  const asks = orderbook?.asks?.slice(0, 10) || []
  const bids = orderbook?.bids?.slice(0, 10) || []
  const midPrice = asks.length && bids.length 
    ? ((asks[0]?.price || 0) + (bids[0]?.price || 0)) / 2 
    : 0

  return (
    <div className="w-full h-full bg-black/20 rounded-2xl border border-[#181825] overflow-hidden">
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#181825]">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-lg">Order Book</h3>
          <span className="text-gray-500">·</span>
          <span className="text-sm text-gray-400">{symbol}</span>
        </div>
        
          {/* WebSocket Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              wsConnected ? "bg-green-400" : "bg-red-400"
            )}></div>
            <span className="text-xs text-gray-400">
              {wsConnected ? "On-Chain" : "Offline"}
            </span>
          </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-400">Loading order book...</div>
          </div>
        ) : (
          <>
            {/* Asks */}
            <div className="space-y-1 mb-2">
              <div className="text-xs text-gray-400 font-medium mb-2">Asks</div>
              {asks.length > 0 ? (
                asks.map((ask: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-red-400">{ask.price?.toFixed(2) || '0.00'}</span>
                    <span className="text-white">{ask.quantity?.toFixed(4) || '0.0000'}</span>
                    <span className="text-gray-400">{ask.total?.toFixed(4) || '0.0000'}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">
                  {(orderbook?.bids?.length === 0 && orderbook?.asks?.length === 0) 
                    ? "Fresh pool! Place first order" 
                    : "No asks"}
                </div>
              )}
            </div>
            
            {/* Mark Price */}
            <div className="flex items-center justify-center py-2 border-y border-[#181825] my-2">
              <span className="text-white font-semibold">{midPrice.toFixed(2)}</span>
              <TrendingUp className="w-3 h-3 text-green-400 ml-2" />
            </div>
            
            {/* Bids */}
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-medium mb-2">Bids</div>
              {bids.length > 0 ? (
                bids.map((bid: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-green-400">{bid.price?.toFixed(2) || '0.00'}</span>
                    <span className="text-white">{bid.quantity?.toFixed(4) || '0.0000'}</span>
                    <span className="text-gray-400">{bid.total?.toFixed(4) || '0.0000'}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">No bids</div>
              )}
            </div>
          </>
        )}
        
        {/* Slab Account Info */}
        <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <div className="text-xs text-blue-300 font-semibold mb-1">
            Your Slab Account (On-Chain)
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk
          </div>
          <a
            href="https://explorer.solana.com/address/79DUPoYSvfrsHTGHUZDtb98vGA5tzKUAVQyYSxsVX8fk?cluster=devnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
          >
            View on Explorer →
          </a>
        </div>
      </div>
    </div>
  )
}

// Simplified Order Form Component
const OrderForm = ({ selectedCoin }: { selectedCoin: "ethereum" | "bitcoin" | "solana" }) => {
  const wallet = useWallet();
  const { publicKey, connected, signTransaction } = wallet;
  
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy")
  const [orderType, setOrderType] = useState("Limit")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [lastHoldId, setLastHoldId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);
  const [realPrice, setRealPrice] = useState<number>(0);

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get symbol from selected coin
  const getSymbol = () => {
    switch(selectedCoin) {
      case "ethereum": return "ETHUSDC";
      case "bitcoin": return "BTCUSDC";
      case "solana": return "SOLUSDC";
    }
  };

  // Get display name for selected market
  const getMarketDisplayName = () => {
    switch(selectedCoin) {
      case "ethereum": return "ETH/USDC";
      case "bitcoin": return "BTC/USDC";
      case "solana": return "SOL/USDC";
    }
  };

  // Get market color
  const getMarketColor = () => {
    switch(selectedCoin) {
      case "ethereum": return "text-blue-400";
      case "bitcoin": return "text-orange-400";
      case "solana": return "text-purple-400";
    }
  };

  // Fetch real market price from CoinGecko (same source as chart)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/dashboard/${selectedCoin}`);
        const data = await response.json();
        if (data?.current_price) {
          setRealPrice(data.current_price);
        }
      } catch (error) {
        // Silent fail
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [selectedCoin]);

  // Debug: Log the real price when it changes
  useEffect(() => {
    if (realPrice > 0) {
      console.log(`Real market price for ${selectedCoin}: $${realPrice.toFixed(2)}`);
    }
  }, [realPrice, selectedCoin]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => closeToast(id), 5000);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSubmitTrade = async () => {
    if (!connected || !publicKey || !signTransaction) {
      showToast('Connect wallet to trade', 'warning');
      return;
    }

    if (!quantity || !price) {
      showToast('Enter price and amount', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const walletAddress = publicKey.toBase58();
      
      // Smart flow: Auto-reserve first, then auto-commit
      if (!lastHoldId) {
        // Reserve liquidity
        const reserveEndpoint = '/api/trade/reserve';
        const reserveBody = {
          user: walletAddress,
          slice: "Slice 1",
          orderType,
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          capLimit: 100,
          multiAsset: false,
          side: tradeSide,
          instrument: 0,
        };

        console.log(`Building Reserve transaction...`);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const reserveResponse = await fetch(`${API_URL}${reserveEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reserveBody)
        });

        const reserveResult = await reserveResponse.json();
        
        if (!reserveResult.success) {
          showToast(reserveResult.error || 'Failed to reserve liquidity', 'error');
          setSubmitting(false);
          return;
        }

        // Sign with Phantom
        if (reserveResult.needsSigning && reserveResult.transaction && signTransaction) {
          try {
            console.log('Signing Reserve with Phantom...');
            
            const txBuffer = Buffer.from(reserveResult.transaction, 'base64');
            const transaction = Transaction.from(txBuffer);
            
            // Get FRESH blockhash right before sending
            console.log('Getting fresh blockhash...');
            // Use alternative RPC to bypass cache
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            
            const signedTx = await signTransaction(transaction);
            
            console.log('Submitting to Solana devnet...');
            const signature = await connection.sendRawTransaction(signedTx.serialize(), {
              skipPreflight: false,
              preflightCommitment: 'confirmed'
            });
            
            console.log('Confirming transaction...');
            await connection.confirmTransaction({
              signature,
              blockhash,
              lastValidBlockHeight
            }, 'confirmed');
            
            console.log('Reserve confirmed!', signature);
            setLastHoldId(reserveResult.holdId);
            showToast('Reserve successful! Click to commit.', 'success');
          } catch (error: any) {
            console.error('Reserve failed:', error);
            
            // Check if it's an account initialization error
            if (error.message?.includes('invalid owner') || error.message?.includes('0x1') || error.message?.includes('custom program error')) {
              showToast(
                `Slab Program Update Required\n\n` +
                `The auto-account creation feature has been added\n` +
                `to the Slab program but needs to be deployed.\n\n` +
                `To Enable Trading:\n` +
                `1. Build updated Slab program\n` +
                `2. Deploy to devnet\n` +
                `3. Update backend with new program ID\n\n` +
                `See BUILD_AND_DEPLOY.md for instructions!`,
                'info'
              );
            } else {
              showToast(`Reserve failed: ${error.message}`, 'error');
            }
            setSubmitting(false);
            return;
          }
        }
      } else {
        // Commit the reserved order
        const commitEndpoint = '/api/trade/commit';
        const commitBody = {
          user: walletAddress,
          holdId: lastHoldId,
          secret: "0".repeat(64), // Mock secret for testing
        };

        console.log(`Building Commit transaction...`);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const commitResponse = await fetch(`${API_URL}${commitEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commitBody)
        });

        const commitResult = await commitResponse.json();
        
        if (!commitResult.success) {
          showToast(commitResult.error || 'Failed to commit order', 'error');
          setSubmitting(false);
          return;
        }

        // Sign with Phantom
        if (commitResult.needsSigning && commitResult.transaction && signTransaction) {
          try {
            console.log('Signing Commit with Phantom...');
            
            const txBuffer = Buffer.from(commitResult.transaction, 'base64');
            const transaction = Transaction.from(txBuffer);
            
            // Get FRESH blockhash right before sending
            console.log('Getting fresh blockhash...');
            const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            
            const signedTx = await signTransaction(transaction);
            
            console.log('Submitting to Solana devnet...');
            const signature = await connection.sendRawTransaction(signedTx.serialize(), {
              skipPreflight: false,
              preflightCommitment: 'confirmed'
            });
            
            console.log('Confirming transaction...');
            await connection.confirmTransaction({
              signature,
              blockhash,
              lastValidBlockHeight
            }, 'confirmed');
            
            console.log('Commit confirmed!', signature);
            setLastHoldId(null); // Reset for next trade
            showToast('Order executed successfully!', 'success');
          } catch (error: any) {
            console.error('Commit failed:', error);
            showToast(`Commit failed: ${error.message}`, 'error');
            setSubmitting(false);
            return;
          }
        }
      }
    } catch (error: any) {
      console.error('Trade failed:', error);
      showToast(`Trade failed: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <div className="w-full h-full bg-black/20 rounded-2xl border border-[#181825] overflow-hidden">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#181825]">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-lg">Trade</h3>
            <span className="text-gray-500">·</span>
            <span className={cn("text-sm font-medium", getMarketColor())}>
              {getMarketDisplayName()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="flex bg-[#0a0a0f] rounded-lg p-1">
            <button
              onClick={() => setTradeSide("buy")}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all",
                tradeSide === "buy"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeSide("sell")}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all",
                tradeSide === "sell"
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              Sell
            </button>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Price (USDC)</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0a0a0f] border border-[#181825] rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (realPrice > 0) {
                    setPrice(realPrice.toFixed(2));
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                title={realPrice > 0 ? `Use market price: $${realPrice.toFixed(2)}` : 'Loading price...'}
              >
                {realPrice > 0 ? `$${realPrice.toFixed(2)}` : 'Loading...'}
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Amount ({selectedCoin.toUpperCase()})</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0a0a0f] border border-[#181825] rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#181825] rounded-lg px-3 py-3 text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="Limit">Limit Order</option>
              <option value="Market">Market Order</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitTrade}
            disabled={submitting || !connected || !price || !quantity}
            className={cn(
              "w-full py-4 rounded-lg font-bold text-sm transition-all",
              tradeSide === "buy"
                ? "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30",
              (submitting || !connected || !price || !quantity) && "opacity-50 cursor-not-allowed"
            )}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : !connected ? (
              "Connect Wallet"
            ) : !lastHoldId ? (
              `Reserve ${tradeSide === "buy" ? "Buy" : "Sell"} Order`
            ) : (
              `Commit ${tradeSide === "buy" ? "Buy" : "Sell"} Order`
            )}
          </button>

          {/* Wallet Info */}
          {connected && publicKey && (
            <div className="bg-[#0a0a0f] rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-400 font-medium">Wallet</div>
              <div className="text-xs text-gray-300 font-mono">
                {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Cross-Slab Trader Component (placeholder)
const CrossSlabTrader = ({ selectedCoin }: { selectedCoin: "ethereum" | "bitcoin" | "solana" }) => {
  return (
    <div className="w-full h-full bg-black/20 rounded-2xl border border-[#181825] overflow-hidden">
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#181825]">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-lg">Cross-Slab Router</h3>
          <span className="text-gray-500">·</span>
          <span className="text-sm text-purple-400">Advanced</span>
        </div>
      </div>
      
      <div className="p-4 flex items-center justify-center h-[calc(100%-3rem)]">
        <div className="text-center">
          <div className="text-purple-400 mb-2">⚡ Cross-Slab Router</div>
          <div className="text-xs text-gray-500">Advanced routing coming soon</div>
        </div>
      </div>
    </div>
  );
};

// Bottom Assets Bar
const AssetsBar = () => {
  const assets = [
    { symbol: "144.1", price: "+1.14%", positive: true },
    { symbol: "ZEN", price: "12.810 +13.16%", positive: true },
    { symbol: "USELESS", price: "0.32951 +3.89%", positive: true },
    { symbol: "S", price: "0.1738 -2.79%", positive: false },
    { symbol: "ZEC", price: "280.92 +20.58%", positive: true },
    { symbol: "ASTER", price: "1.1430 -6.62%", positive: false },
    { symbol: "AAVE", price: "225.86 +0.54%", positive: true },
    { symbol: "SPX", price: "1.0177 -1.59%", positive: false },
    { symbol: "IP", price: "5.4900 -0.16%", positive: false },
    { symbol: "XPL", price: "0.3833 -9.59%", positive: false },
    { symbol: "TRUMP", price: "5.932 -C", positive: false },
  ]

  return (
    <div className="w-full bg-black/20 backdrop-blur-md border border-[#181825] rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-400">Operational</span>
            <span className="text-gray-400">Join our community</span>
            <span className="text-gray-400">Charts powered by TradingView</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto">
          {assets.map((asset, index) => (
            <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-white text-sm">{asset.symbol}</span>
              <span className={cn(
                "text-sm",
                asset.positive ? "text-green-400" : "text-red-400"
              )}>
                {asset.price}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" className="w-4 h-4 text-[#B8B8FF] bg-[#181825] border-[#181825] rounded focus:ring-[#B8B8FF]/50" />
          <span className="text-sm text-gray-400">Hide other symbols</span>
        </div>
      </div>
    </div>
  )
}

export default function TradingDashboard() {
  // Default to ETH chart
  const [selectedCoin, setSelectedCoin] = useState<"ethereum" | "bitcoin" | "solana">("ethereum")
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [showFaucetSuccess, setShowFaucetSuccess] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);
  const [mounted, setMounted] = useState(false);
  const [tradingMode, setTradingMode] = useState<"simple" | "advanced">("simple");
  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Fix hydration error - only render wallet button after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch portfolio when wallet connects
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!connected || !publicKey) {
        setPortfolio(null);
        return;
      }

      setPortfolioLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/router/portfolio/${publicKey.toBase58()}`);
        const data = await response.json();
        
        if (data.success) {
          setPortfolio(data);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchPortfolio();
    
    // Refresh portfolio every 10 seconds
    const interval = setInterval(fetchPortfolio, 10000);
    return () => clearInterval(interval);
  }, [connected, publicKey]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // Map coin to symbol for backend API
  const getSymbolFromCoin = (coin: "ethereum" | "bitcoin" | "solana") => {
    switch(coin) {
      case "ethereum": return "ETHUSDC";
      case "bitcoin": return "BTCUSDC";
      case "solana": return "SOLUSDC";
    }
  };
  
  const selectedSymbol = getSymbolFromCoin(selectedCoin);

  const handleDeposit = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      showToast('Connect wallet first', 'warning');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast('Enter a valid deposit amount', 'warning');
      return;
    }

    setPortfolioLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      console.log(`Depositing ${depositAmount} SOL to portfolio...`);
      
      const response = await fetch(`${API_URL}/api/router/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          amount: depositAmount,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showToast(result.error || 'Deposit failed', 'error');
        setPortfolioLoading(false);
        return;
      }

      // Sign and submit transaction
      if (result.needsSigning && result.transaction) {
        try {
          const txBuffer = Buffer.from(result.transaction, 'base64');
          const transaction = Transaction.from(txBuffer);
          
          // Get fresh blockhash
          const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
          transaction.recentBlockhash = blockhash;
          transaction.lastValidBlockHeight = lastValidBlockHeight;
          
          const signedTx = await wallet.signTransaction(transaction);
          
          console.log('📡 Submitting deposit transaction...');
          const signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
          });
          
          console.log('⏳ Confirming deposit...');
          await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed');
          
          console.log('Deposit confirmed!', signature);
          showToast(
            `Deposited ${depositAmount} SOL!\n\n` +
            `Portfolio created at:\n${result.portfolioAddress.slice(0, 8)}...${result.portfolioAddress.slice(-8)}\n\n` +
            `View on Solscan`,
            'success'
          );
          
          setDepositAmount("");
          setShowDepositModal(false);
          
          // Refresh portfolio
          setTimeout(async () => {
            const portfolioResponse = await fetch(`${API_URL}/api/router/portfolio/${publicKey.toBase58()}`);
            const portfolioData = await portfolioResponse.json();
            if (portfolioData.success) {
              setPortfolio(portfolioData);
            }
          }, 2000);
          
        } catch (error: any) {
          console.error('Deposit transaction failed:', error);
          showToast(`Deposit failed: ${error.message}`, 'error');
        }
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      showToast(`Deposit failed: ${error.message}`, 'error');
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleFaucetRequest = async () => {
    if (!publicKey) return;
    setFaucetLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/faucet/airdrop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet: publicKey.toBase58(),
          amount: 2
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setShowFaucetSuccess(true);
        setTimeout(() => setShowFaucetSuccess(false), 5000);
        
        showToast(
          `You received ${result.amount} SOL!\n` +
          `New balance: ${result.balance_after?.toFixed(4)} SOL`,
          'success'
        );
      } else {
        // Show error with helpful message
        if (result.error?.includes('rate limit') || result.error?.includes('limit')) {
          showToast(
            `Airdrop rate limit reached\n\n` +
            `Please wait 1 minute and try again, or use:\n` +
            `https://faucet.solana.com`,
            'warning'
          );
        } else if (result.error?.includes('RPC') || result.error?.includes('not available')) {
          showToast(
            `Solana RPC temporarily unavailable\n\n` +
            `Use web faucet instead:\n` +
            `https://faucet.solana.com`,
            'warning'
          );
        } else {
          showToast(
            result.error || 'Airdrop failed. Try again in a minute.',
            'error'
          );
        }
      }
    } catch (error: any) {
      showToast(
        `Airdrop failed: ${error.message}\n\n` +
        `Try the web faucet: https://faucet.solana.com`,
        'error'
      );
    } finally {
      setFaucetLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastContainer toasts={toasts} onClose={closeToast} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B8B8FF] to-purple-400 bg-clip-text text-transparent">
              Percolator
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Portfolio Balance Display */}
            {connected && portfolio && portfolio.exists && (
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-xs text-green-300 font-semibold">Portfolio Balance</div>
                <div className="text-sm text-white font-bold">{portfolio.collateral?.toFixed(4) || '0.0000'} SOL</div>
              </div>
            )}

            {/* Deposit Button */}
            {connected && publicKey && (
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 text-sm font-medium transition-all"
              >
                Deposit Collateral
              </button>
            )}

            {mounted && (
              <WalletMultiButton className="!bg-[#B8B8FF]/20 !border-[#B8B8FF]/50 !text-[#B8B8FF] hover:!bg-[#B8B8FF]/30" />
            )}
            
            {connected && publicKey && (
              <button
                onClick={handleFaucetRequest}
                disabled={faucetLoading}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 text-sm font-medium transition-all disabled:opacity-50"
              >
                {faucetLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Requesting...
                  </div>
                ) : (
                  'Get SOL'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Portfolio Visual Section */}
        {connected && portfolio && portfolio.exists && (
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Your Portfolio</h3>
                <p className="text-xs text-gray-400">Router-managed cross-margin account</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Health</div>
                <div className="text-2xl font-bold text-green-400">{portfolio.health || 100}%</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {/* Total Equity */}
              <div className="bg-black/20 rounded-xl p-4 border border-[#181825]">
                <div className="text-xs text-gray-400 mb-2">Total Equity</div>
                <div className="text-xl font-bold text-white">{portfolio.equity?.toFixed(4) || '0.0000'}</div>
                <div className="text-xs text-gray-500">SOL</div>
              </div>

              {/* Collateral */}
              <div className="bg-black/20 rounded-xl p-4 border border-[#181825]">
                <div className="text-xs text-gray-400 mb-2">Collateral</div>
                <div className="text-xl font-bold text-blue-400">{portfolio.collateral?.toFixed(4) || '0.0000'}</div>
                <div className="text-xs text-gray-500">SOL</div>
              </div>

              {/* Free Collateral */}
              <div className="bg-black/20 rounded-xl p-4 border border-[#181825]">
                <div className="text-xs text-gray-400 mb-2">Available</div>
                <div className="text-xl font-bold text-green-400">{portfolio.free_collateral?.toFixed(4) || '0.0000'}</div>
                <div className="text-xs text-gray-500">SOL</div>
              </div>

              {/* Leverage */}
              <div className="bg-black/20 rounded-xl p-4 border border-[#181825]">
                <div className="text-xs text-gray-400 mb-2">Leverage</div>
                <div className="text-xl font-bold text-purple-400">{portfolio.leverage?.toFixed(2) || '1.00'}x</div>
                <div className="text-xs text-gray-500">Cross-margin</div>
              </div>
            </div>

            {/* Portfolio Address */}
            <div className="mt-4 flex items-center justify-between bg-black/20 rounded-lg p-3 border border-[#181825]">
              <div>
                <div className="text-xs text-gray-400 mb-1">Portfolio Account (PDA)</div>
                <div className="text-xs text-gray-300 font-mono">{portfolio.portfolioAddress}</div>
              </div>
              <a
                href={`https://explorer.solana.com/address/${portfolio.portfolioAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View on Explorer
              </a>
            </div>
          </div>
        )}

        {/* Trading Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTradingMode("simple")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tradingMode === "simple"
                ? "bg-[#B8B8FF]/20 text-[#B8B8FF] border border-[#B8B8FF]/50"
                : "bg-[#181825] border border-[#181825] text-gray-400 hover:text-white"
            )}
          >
            <Target className="w-4 h-4" />
            Simple Trading
          </button>
          <button
            onClick={() => setTradingMode("advanced")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tradingMode === "advanced"
                ? "bg-purple-500/20 border-2 border-purple-500/50 text-purple-300"
                : "bg-[#181825] border border-[#181825] text-gray-400 hover:text-white"
            )}
          >
            <Zap className="w-4 h-4" />
            Cross-Slab Router
          </button>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Left Sidebar - Order Book */}
          <div className="col-span-3 space-y-4">
            <OrderBook symbol={selectedSymbol} />
          </div>

          {/* Center - Chart */}
          <div className="col-span-6">
            <TradingViewChartComponent 
              symbol={selectedSymbol} 
              selectedCoin={selectedCoin}
              onCoinChange={setSelectedCoin}
            />
          </div>

          {/* Right Sidebar - Trade Panel */}
          <div className="col-span-3">
            {tradingMode === "simple" ? (
              <OrderForm selectedCoin={selectedCoin} />
            ) : (
              <CrossSlabTrader selectedCoin={selectedCoin} />
            )}
          </div>
        </div>

        {/* Bottom Assets Bar */}
        <AssetsBar />
      </main>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-[#181825] rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Deposit Collateral</h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-sm text-blue-300 mb-2">
                  <strong>Router Architecture</strong>
                </div>
                <div className="text-xs text-gray-400">
                  Depositing SOL creates your trading portfolio on the Router program.
                  This enables cross-margin trading across all slabs!
                </div>
              </div>

              {/* Portfolio Status */}
              {portfolio && !portfolio.exists && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-xs text-yellow-300">
                    Portfolio will be created with your first deposit
                  </div>
                </div>
              )}

              {portfolio && portfolio.exists && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-xs text-green-300 mb-1">Current Balance</div>
                  <div className="text-lg text-white font-bold">{portfolio.collateral?.toFixed(4)} SOL</div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Amount (SOL)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full bg-[#181825] border border-[#282835] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                />
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Minimum: 0.01 SOL</span>
                  <button
                    onClick={() => setDepositAmount("1")}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Set 1 SOL
                  </button>
                </div>
              </div>

              {/* Deposit Button */}
              <button
                onClick={handleDeposit}
                disabled={portfolioLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {portfolioLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  `Deposit ${depositAmount || '0'} SOL`
                )}
              </button>

              {/* Info */}
              <div className="text-xs text-gray-500 text-center">
                Network fee: ~0.000005 SOL
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}