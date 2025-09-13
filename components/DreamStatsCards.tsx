import { DreamStats } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface StatsCardsProps {
  stats: DreamStats
}

export function DreamStatsCards({ stats }: StatsCardsProps) {
  const purchasedProgressWidth = stats.totalValue > 0 ? (stats.purchasedValue / stats.totalValue) * 100 : 0
  const remainingProgressWidth = stats.totalValue > 0 ? (stats.remainingValue / stats.totalValue) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      
      {/* Total Wishlist */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
        <div className="relative bg-gray-900/80 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-2xl shadow-violet-600/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-violet-400 text-sm font-bold uppercase tracking-widest mb-1">Total Value</p>
              <p className="text-4xl font-black text-white">{formatPrice(stats.totalValue)}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full w-full transform origin-left animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Purchased */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
        <div className="relative bg-gray-900/80 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-2xl shadow-emerald-600/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-1">Acquired</p>
              <p className="text-4xl font-black text-white">{formatPrice(stats.purchasedValue)}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-green-600 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${purchasedProgressWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Remaining */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
        <div className="relative bg-gray-900/80 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl shadow-2xl shadow-rose-600/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div className="text-right">
              <p className="text-rose-400 text-sm font-bold uppercase tracking-widest mb-1">Dreams Left</p>
              <p className="text-4xl font-black text-white">{formatPrice(stats.remainingValue)}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-600 to-pink-600 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${remainingProgressWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
