"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function V0Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/trade">
          <button className="mb-8 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Trading
          </button>
        </Link>

        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          v0.1 Proof of Concept
        </h1>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">✅ What's Working</h2>
            <ul className="space-y-2 text-zinc-300">
              <li>✅ <strong>Slab Program</strong> - Deployed on Devnet with Reserve/Commit/Cancel</li>
              <li>✅ <strong>Router Program</strong> - Initialized with Registry</li>
              <li>✅ <strong>Trading UI</strong> - Full Reserve → Commit workflow</li>
              <li>✅ <strong>Toast Notifications</strong> - Beautiful popup messages</li>
              <li>✅ <strong>Orderbook Display</strong> - Active orders and recent trades</li>
              <li>✅ <strong>Transaction History</strong> - All on-chain transactions</li>
              <li>✅ <strong>Wallet Integration</strong> - Phantom, Solflare support</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">⚠️ POC Limitations</h2>
            <ul className="space-y-2 text-zinc-300">
              <li>⚠️ <strong>Mock Execution</strong> - Transactions succeed but don't modify slab state</li>
              <li>⚠️ <strong>No Real Matching</strong> - Orders don't actually fill against each other</li>
              <li>⚠️ <strong>No Position Tracking</strong> - Balances not updated on-chain</li>
              <li>⚠️ <strong>No Settlement</strong> - No actual token transfers</li>
            </ul>
            <p className="mt-4 text-sm text-zinc-400">
              The v0.1 POC demonstrates the full transaction flow and UI/UX,
              but the actual trading logic will be implemented in v0.2+
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">📋 Deployed Addresses</h2>
            <div className="space-y-3 text-sm font-mono">
              <div>
                <div className="text-zinc-500">Slab Program</div>
                <div className="text-zinc-300">SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep</div>
              </div>
              <div>
                <div className="text-zinc-500">Slab Account</div>
                <div className="text-zinc-300">5Yd2fL7f1DhmNL3u82ptZ21CUpFJHYs1Fqfg2Qs9CLDB</div>
              </div>
              <div>
                <div className="text-zinc-500">Router Program</div>
                <div className="text-zinc-300">RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr</div>
              </div>
              <div>
                <div className="text-zinc-500">Router Registry</div>
                <div className="text-zinc-300">DK9uaWYienaQ6XEFBzsGCuKZ8ZapTMjw7Ht3s9HQMdUx</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">🎯 Try It Now</h2>
            <p className="text-zinc-300 mb-4">
              The trading system is fully functional for testing the user experience!
            </p>
            <Link href="/trade">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all">
                Go to Trading →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

