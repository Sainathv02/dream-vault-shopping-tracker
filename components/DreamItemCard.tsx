import { DreamItem } from '@/lib/types'
import { formatPrice, getPriorityColor, getPriorityIcon } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Check, Eye, Trash2 } from 'lucide-react'

interface DreamItemCardProps {
  item: DreamItem
  onTogglePurchased: (id: string) => void
  onDelete: (id: string) => void
  onView: (item: DreamItem) => void
}

export function DreamItemCard({ item, onTogglePurchased, onDelete, onView }: DreamItemCardProps) {
  const gradientClass = getPriorityColor(item.priority)
  const priorityIconPath = getPriorityIcon(item.priority)
  
  return (
    <div className={cn(
      "group relative item-card premium-hover fade-in",
      item.purchased && "scale-95 opacity-70"
    )}>
      <div className={cn(
        "absolute -inset-1 rounded-3xl blur-lg transition-all duration-700",
        item.purchased 
          ? "bg-gradient-to-r from-emerald-600/30 to-green-600/30 animate-pulse" 
          : "bg-gradient-to-r from-violet-600/10 to-rose-600/10 group-hover:from-violet-600/40 group-hover:to-rose-600/40 group-hover:animate-pulse"
      )} />
      
      <div className={cn(
        "relative rounded-3xl border backdrop-filter backdrop-blur-lg transition-all duration-700 overflow-hidden",
        item.purchased 
          ? "bg-emerald-900/20 border-emerald-600/30" 
          : "bg-gray-900/60 border-gray-800 hover:border-gray-600 group-hover:bg-gray-900/90"
      )}>
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
            
            {/* Purchase Toggle Button */}
            <button
              onClick={() => onTogglePurchased(item.id)}
              className={cn(
                "relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 flex-shrink-0",
                item.purchased
                  ? "bg-emerald-500 border-emerald-500 shadow-2xl shadow-emerald-500/50 scale-110"
                  : "border-gray-600 hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/25 hover:scale-110 active:scale-95"
              )}
            >
              {item.purchased && (
                <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-bounce" />
              )}
            </button>
            
            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                <h3 className={cn(
                  "text-xl sm:text-2xl lg:text-3xl font-bold transition-all duration-300 truncate",
                  item.purchased 
                    ? "text-emerald-400 line-through" 
                    : "text-white group-hover:text-violet-300"
                )}>
                  {item.name}
                </h3>
                
                {/* Priority Badge */}
                <div className={cn(
                  "px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold flex items-center gap-1 text-white bg-gradient-to-r flex-shrink-0 w-fit",
                  gradientClass
                )}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d={priorityIconPath} />
                  </svg>
                  <span className="hidden sm:inline">{item.priority.toUpperCase()}</span>
                  <span className="sm:hidden">{item.priority.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              
              <div className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6",
                item.purchased && "line-through opacity-70"
              )}>
                {item.specifications && (
                  <span className="text-gray-400 text-sm sm:text-base lg:text-lg font-medium truncate">
                    {item.specifications}
                  </span>
                )}
                {item.specifications && (
                  <div className="hidden sm:block h-1 w-1 bg-gray-600 rounded-full flex-shrink-0"></div>
                )}
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex sm:flex-col lg:flex-row items-center gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0 relative z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  console.log('View button clicked for:', item.name)
                  alert(`View clicked for: ${item.name}`) // Test alert
                  onView(item)
                }}
                className="p-3 sm:p-4 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-lg hover:shadow-gray-800/30 cursor-pointer relative z-10"
                title="View Details"
                type="button"
              >
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  console.log('Delete button clicked for:', item.name)
                  alert(`Delete clicked for: ${item.name}`) // Test alert
                  onDelete(item.id)
                }}
                className="p-3 sm:p-4 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-red-500/30 cursor-pointer relative z-10"
                title="Delete Item"
                type="button"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
