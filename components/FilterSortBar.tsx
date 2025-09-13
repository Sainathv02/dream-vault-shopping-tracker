import { DreamFilter, SortOption } from '@/lib/types'
import { Filter, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface FilterSortBarProps {
  filter: DreamFilter
  sortBy: SortOption
  onFilterChange: (filter: DreamFilter) => void
  onSortChange: (sort: SortOption) => void
  itemCount: number
}

export function FilterSortBar({ 
  filter, 
  sortBy, 
  onFilterChange, 
  onSortChange, 
  itemCount 
}: FilterSortBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filter, search: search || undefined })
  }

  const handlePriorityFilter = (priority: 'low' | 'medium' | 'high') => {
    onFilterChange({
      ...filter,
      priority: filter.priority === priority ? undefined : priority
    })
  }

  const handlePurchasedFilter = (purchased: boolean) => {
    onFilterChange({
      ...filter,
      purchased: filter.purchased === purchased ? undefined : purchased
    })
  }

  const clearFilters = () => {
    onFilterChange({})
  }

  const hasActiveFilters = !!(filter.priority || filter.purchased !== undefined || filter.search)

  return (
    <div className="space-y-4 mb-8">
      {/* Search and Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search your dreams..."
            value={filter.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
          />
        </div>

        <div className="flex gap-3">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300",
              showFilters || hasActiveFilters
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/25"
                : "bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 backdrop-blur-sm"
            )}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {[filter.priority, filter.purchased !== undefined, filter.search].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-300 hover:bg-gray-700/50"
          >
            <option value="created">Latest First</option>
            <option value="price">Price (High to Low)</option>
            <option value="name">Name (A-Z)</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-rose-600/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-lg">Filter Options</h3>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Priority Filter */}
              <div>
                <label className="block text-white text-sm font-medium mb-3">Priority Level</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'high', label: 'High', gradient: 'from-red-500 to-pink-500' },
                    { value: 'medium', label: 'Medium', gradient: 'from-yellow-500 to-orange-500' },
                    { value: 'low', label: 'Low', gradient: 'from-green-500 to-emerald-500' }
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => handlePriorityFilter(priority.value as 'low' | 'medium' | 'high')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                        filter.priority === priority.value
                          ? `bg-gradient-to-r ${priority.gradient} text-white shadow-lg scale-105`
                          : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                      )}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-white text-sm font-medium mb-3">Purchase Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePurchasedFilter(false)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                      filter.purchased === false
                        ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg scale-105"
                        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                    )}
                  >
                    Wishlist
                  </button>
                  <button
                    onClick={() => handlePurchasedFilter(true)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                      filter.purchased === true
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg scale-105"
                        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                    )}
                  >
                    Acquired
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Showing {itemCount} dream{itemCount === 1 ? '' : 's'}
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>
    </div>
  )
}
