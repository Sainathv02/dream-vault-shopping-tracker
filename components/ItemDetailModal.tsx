import { DreamItem } from '@/lib/types'
import { formatPrice, getPriorityColor, getPriorityIcon } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { X, Calendar, DollarSign, Tag, CheckCircle, Circle } from 'lucide-react'

interface ItemDetailModalProps {
  item: DreamItem | null
  isOpen: boolean
  onClose: () => void
}

export function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  if (!isOpen || !item) return null

  const gradientClass = getPriorityColor(item.priority)
  const priorityIconPath = getPriorityIcon(item.priority)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 rounded-3xl blur-xl opacity-40"></div>
          <div className="relative bg-gray-900/95 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-2xl bg-gradient-to-r",
                  gradientClass
                )}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={priorityIconPath} />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{item.name}</h2>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r inline-flex items-center gap-1",
                    gradientClass
                  )}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d={priorityIconPath} />
                    </svg>
                    {item.priority.toUpperCase()} PRIORITY
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column - Details */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                    <Tag className="w-4 h-4" />
                    Specifications
                  </label>
                  <p className="text-white text-lg">
                    {item.specifications || 'No specifications provided'}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </label>
                  <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                    {item.purchased ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    Status
                  </label>
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold",
                    item.purchased
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  )}>
                    {item.purchased ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    {item.purchased ? 'Acquired' : 'In Wishlist'}
                  </div>
                </div>
              </div>

              {/* Right Column - Timeline */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4" />
                    Added to Vault
                  </label>
                  <p className="text-white">
                    {item.createdAt.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4" />
                    Last Updated
                  </label>
                  <p className="text-white">
                    {item.updatedAt.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Timeline Visual */}
                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-4 w-0.5 bg-gradient-to-b from-violet-500 to-rose-500"></div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Added to Dream Vault</p>
                        <p className="text-gray-400 text-sm">{item.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {item.purchased && (
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Dream Acquired!</p>
                          <p className="text-gray-400 text-sm">{item.updatedAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-600/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
