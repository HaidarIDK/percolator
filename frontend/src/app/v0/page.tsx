"use client"

import { useState, useEffect } from "react"
import { Particles } from "@/components/ui/particles"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Zap, Database, Shield, Layers, Check } from "lucide-react"

export default function V0POCPage() {
  const [slabs, setSlabs] = useState<any[]>([])
  const [selectedCoin, setSelectedCoin] = useState<'ethereum' | 'bitcoin' | 'solana'>('ethereum')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSlabs = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(`${API_URL}/api/router/slabs?coin=${selectedCoin}`)
        const data = await response.json()
        setSlabs(data.slabs || [])
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch slabs:', error)
        setLoading(false)
      }
    }

    fetchSlabs()
  }, [selectedCoin])

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Particles className="absolute inset-0 z-0" quantity={50} />
      
      {/* Header */}
      <div className="relative z-10 border-b border-[#181825] bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <button className="p-2 rounded-lg bg-[#B8B8FF]/10 hover:bg-[#B8B8FF]/20 text-[#B8B8FF] transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#B8B8FF] to-white bg-clip-text text-transparent">
                  Cross-Slab Router v0
                </h1>
                <p className="text-sm text-gray-400">Proof of Concept - Multi-Slab Execution Engine</p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold">
              LIVE POC
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* What is This? */}
        <div className="bg-gradient-to-r from-[#B8B8FF]/10 to-[#B8B8FF]/5 border border-[#B8B8FF]/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3 text-[#B8B8FF]">🚀 What is Cross-Slab Routing?</h2>
          <p className="text-gray-300 mb-4">
            Instead of trading on a single order book, the Cross-Slab Router <strong>splits your order across multiple slabs</strong> to get you the best price and deepest liquidity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Optimal Execution</p>
                <p className="text-sm text-gray-400">Automatically routes to slabs with best prices</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Layers className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Deep Liquidity</p>
                <p className="text-sm text-gray-400">Access liquidity across all markets simultaneously</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Atomic Settlement</p>
                <p className="text-sm text-gray-400">All-or-nothing execution via Router Program</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Database className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Cross-Margin</p>
                <p className="text-sm text-gray-400">Single portfolio tracks exposure across all slabs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coin Selector */}
        <div className="flex items-center space-x-4 mb-6">
          <p className="text-sm text-gray-400 font-medium">Select Asset:</p>
          <div className="flex space-x-2">
            {(['ethereum', 'bitcoin', 'solana'] as const).map((coin) => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  selectedCoin === coin
                    ? "bg-[#B8B8FF]/20 border-2 border-[#B8B8FF] text-white"
                    : "bg-[#181825] border border-[#181825] text-gray-400 hover:text-white hover:border-[#B8B8FF]/30"
                )}
              >
                {coin === 'ethereum' && '🔷 ETH'}
                {coin === 'bitcoin' && '₿ BTC'}
                {coin === 'solana' && '◎ SOL'}
              </button>
            ))}
          </div>
        </div>

        {/* Available Slabs */}
        <div className="bg-[#0a0a0f] border border-[#181825] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#B8B8FF]" />
            <span>Available Slabs for {selectedCoin.toUpperCase()}</span>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B8B8FF]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {slabs.map((slab) => (
                <div 
                  key={slab.id} 
                  className="bg-[#181825]/30 border border-[#181825] rounded-lg p-5 hover:border-[#B8B8FF]/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#B8B8FF] transition-colors">
                      {slab.name}
                    </h3>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold",
                      slab.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    )}>
                      {slab.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Liquidity:</span>
                      <span className="text-white font-medium">{slab.liquidity} {selectedCoin.slice(0,3).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">VWAP:</span>
                      <span className="text-green-400 font-medium">${slab.vwap.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fee:</span>
                      <span className="text-white font-medium">{(slab.fee * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">24h Volume:</span>
                      <span className="text-white font-medium">${(slab.volume_24h / 1000).toFixed(0)}K</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#181825]">
                    <p className="text-xs text-gray-500 mb-2">Instruments:</p>
                    <div className="flex flex-wrap gap-1">
                      {slab.instruments.map((inst: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#B8B8FF]/10 text-[#B8B8FF] text-xs">
                          {inst}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#181825]">
                    <p className="text-xs text-gray-500">Slab ID:</p>
                    <code className="text-xs font-mono text-gray-400">{slab.slab_id}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-[#0a0a0f] border border-[#181825] rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">How Cross-Slab Routing Works</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#B8B8FF]/20 flex items-center justify-center flex-shrink-0 text-[#B8B8FF] font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-white mb-1">User submits order</p>
                <p className="text-sm text-gray-400">You want to buy 10 ETH at market price</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#B8B8FF]/20 flex items-center justify-center flex-shrink-0 text-[#B8B8FF] font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-white mb-1">Router analyzes all slabs</p>
                <p className="text-sm text-gray-400">Checks liquidity, VWAP, and fees across Slab A, B, C</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#B8B8FF]/20 flex items-center justify-center flex-shrink-0 text-[#B8B8FF] font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-white mb-1">Optimal routing calculated</p>
                <p className="text-sm text-gray-400">
                  Example: 6 ETH from Slab C ($3881.81), 3 ETH from Slab A ($3882.19), 1 ETH from Slab B ($3882.31)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-green-400">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-white mb-1">Atomic execution via Router Program</p>
                <p className="text-sm text-gray-400">
                  Router Program CPIs to all 3 slabs in one transaction. Either all fills succeed or all revert.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Implementation Status */}
        <div className="bg-[#0a0a0f] border border-[#181825] rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Implementation Status (v0)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#B8B8FF] mb-2">✅ Completed</h3>
              <div className="space-y-2">
                {[
                  'Router Program deployed to Devnet',
                  'Slab Program deployed to Devnet',
                  'Multi-slab discovery API',
                  'Smart routing algorithm',
                  'Execution plan visualization',
                  'Frontend Multi-Asset toggle',
                  'Transaction building logic',
                  'Phantom wallet integration'
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-yellow-400 mb-2">⏳ Pending</h3>
              <div className="space-y-2">
                {[
                  'Initialize Slab state accounts (~73 SOL needed)',
                  'Initialize Router state accounts',
                  'Create Portfolio accounts for users',
                  'Deploy Capability Token system',
                  'On-chain Reserve execution',
                  'On-chain Commit execution',
                  'Cross-slab atomic settlement',
                  'Real orderbook from blockchain'
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-yellow-400 mt-0.5 flex-shrink-0"></div>
                    <span className="text-sm text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-[#0a0a0f] border border-[#181825] rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Architecture Flow</h2>
          <div className="space-y-6">
            {/* Frontend → Router */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-3 flex-1">
                <p className="text-sm font-medium text-blue-400">Frontend</p>
                <p className="text-xs text-gray-400">User submits trade</p>
              </div>
              <div className="text-[#B8B8FF]">→</div>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-3 flex-1">
                <p className="text-sm font-medium text-purple-400">Client SDK</p>
                <p className="text-xs text-gray-400">Builds instruction</p>
              </div>
            </div>

            {/* Router → Slabs */}
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-3 flex-1">
                <p className="text-sm font-medium text-green-400">Router Program</p>
                <p className="text-xs text-gray-400">Validates & routes</p>
              </div>
              <div className="text-[#B8B8FF]">→</div>
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-3 flex-1">
                <p className="text-sm font-medium text-orange-400">Slab Programs (A, B, C)</p>
                <p className="text-xs text-gray-400">Parallel execution via CPI</p>
              </div>
            </div>

            {/* Settlement */}
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-3 flex-1">
                <p className="text-sm font-medium text-yellow-400">Portfolio Update</p>
                <p className="text-xs text-gray-400">Net exposure calculated</p>
              </div>
              <div className="text-[#B8B8FF]">→</div>
              <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg px-4 py-3 flex-1">
                <p className="text-sm font-medium text-pink-400">User Dashboard</p>
                <p className="text-xs text-gray-400">Updated positions & P&L</p>
              </div>
            </div>
          </div>
        </div>

        {/* Program IDs */}
        <div className="bg-[#0a0a0f] border border-[#181825] rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Deployed Programs (Devnet)</h2>
          <div className="space-y-3">
            <div className="bg-[#181825]/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Slab Program</p>
              <code className="text-xs font-mono text-[#B8B8FF] break-all">
                6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz
              </code>
              <a
                href="https://explorer.solana.com/address/6EF2acRfPejnxXYd9apKc2wb3p2NLG8rKgWbCfp5G7Uz?cluster=devnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 mt-2"
              >
                <span>View on Solana Explorer</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </a>
            </div>

            <div className="bg-[#181825]/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Router Program</p>
              <code className="text-xs font-mono text-[#B8B8FF] break-all">
                9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG
              </code>
              <a
                href="https://explorer.solana.com/address/9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG?cluster=devnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 mt-2"
              >
                <span>View on Solana Explorer</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </a>
            </div>
          </div>
        </div>

        {/* Try It Out */}
        <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-3 text-green-400">🎯 Try It Out!</h2>
          <p className="text-gray-300 mb-4">
            Go to the main dashboard and toggle <strong>"Multi-Asset"</strong> to activate cross-slab routing.
          </p>
          <Link href="/dashboard">
            <button className="px-6 py-3 rounded-lg bg-[#B8B8FF]/20 hover:bg-[#B8B8FF]/30 border border-[#B8B8FF] text-white font-bold transition-all">
              Open Trading Dashboard →
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

