'use client'

import { useState } from 'react'
import { useDreamVault } from '@/hooks/useDreamVault'
import { DreamItem } from '@/lib/types'
import { DreamStatsCards } from './DreamStatsCards'
import { DreamItemCard } from './DreamItemCard'
import { AddDreamForm } from './AddDreamForm'
import { FilterSortBar } from './FilterSortBar'
import { ItemDetailModal } from './ItemDetailModal'
import { EDCChecklist } from './EDCChecklist'
import { GitHubSyncModal } from './GitHubSyncModal'
import { Plus, ShoppingCart, X, Zap, Cloud, CloudOff, RefreshCw } from 'lucide-react'

export function DreamVault() {
  const {
    dreams,
    allDreams,
    stats,
    filter,
    sortBy,
    setFilter,
    setSortBy,
    addDream,
    deleteDream,
    togglePurchased,
    syncWithGitHub,
    isSyncing,
    lastSyncTime,
    syncError,
    isGitHubConfigured
  } = useDreamVault()

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DreamItem | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showEDCChecklist, setShowEDCChecklist] = useState(false)
  const [showGitHubSyncModal, setShowGitHubSyncModal] = useState(false)

  const handleAddDream = (dreamData: Omit<DreamItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    addDream(dreamData)
    setShowAddForm(false)
  }

  const handleViewItem = (item: DreamItem) => {
    console.log('View clicked for:', item.name) // Debug log
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const handleCloseModal = () => {
    setShowItemModal(false)
    setSelectedItem(null)
  }

  const handleDeleteDream = (id: string) => {
    console.log('Delete clicked for ID:', id) // Debug log
    
    const item = allDreams.find(d => d.id === id)
    const itemName = item ? item.name : 'this item'
    
    console.log('Found item:', item) // Debug log
    
    // Simple confirmation first
    const confirmed = confirm(`Delete "${itemName}"?`)
    
    if (confirmed) {
      deleteDream(id)
      alert(`"${itemName}" has been deleted from your vault`) // Visual feedback
    }
  }

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm)
  }

  const handleSync = async () => {
    await syncWithGitHub(true)
    setShowGitHubSyncModal(false)
  }


  return (
    <div className="bg-black overflow-x-hidden min-h-screen">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black to-rose-900/20"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <header className="text-center py-8 sm:py-12 lg:py-16 px-4">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8 slide-in-up">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-rose-600 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-violet-600 to-rose-600 p-4 sm:p-5 rounded-3xl animate-glow">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 12l2-4h14l2 4-2 4H5zM12 8V4l-2-2h4l-2 2v4z"/>
                </svg>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-violet-200 to-rose-200 bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform duration-500">
                DREAM
              </h1>
              <p className="text-violet-400 text-base sm:text-lg font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase shimmer">VAULT</p>
            </div>
          </div>
          <p className="text-gray-400 text-lg sm:text-xl font-light max-w-3xl mx-auto leading-relaxed slide-in-up px-4" style={{ animationDelay: '0.2s' }}>
            Where luxury meets desire. Curate, track, and conquer your ultimate wishlist.
          </p>

          {/* Sync Status Indicator */}
          <div className="flex justify-center mt-6" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => setShowGitHubSyncModal(true)}
              className="group relative flex items-center gap-3 px-6 py-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 backdrop-blur-sm"
              title={isGitHubConfigured ? "GitHub Sync Active" : "Configure GitHub Sync"}
            >
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              ) : isGitHubConfigured ? (
                <Cloud className="w-5 h-5 text-green-400" />
              ) : (
                <CloudOff className="w-5 h-5 text-gray-400" />
              )}
              
              <div className="text-left">
                <div className={`text-sm font-medium ${
                  syncError ? 'text-red-400' : 
                  isGitHubConfigured ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {isSyncing ? 'Syncing data...' : 
                   syncError ? 'Sync error' :
                   isGitHubConfigured ? 'Cloud sync active' : 'Cloud sync disabled'}
                </div>
                {lastSyncTime && !isSyncing && (
                  <div className="text-xs text-gray-500">
                    Last sync: {lastSyncTime.toLocaleString()}
                  </div>
                )}
              </div>
              
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full ${
                syncError ? 'bg-red-500' : 
                isGitHubConfigured ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`}></div>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <DreamStatsCards stats={stats} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <button 
            onClick={toggleAddForm} 
            className="group relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 rounded-full p-1 hover:shadow-2xl hover:shadow-violet-600/25 transition-all duration-500"
          >
            <div className="bg-black rounded-full px-8 py-4 group-hover:bg-transparent transition-all duration-300">
              <div className="flex items-center gap-3">
                {showAddForm ? (
                  <X className="w-6 h-6 text-white transition-transform duration-500" />
                ) : (
                  <Plus className="w-6 h-6 text-white transition-transform duration-500" />
                )}
                <span className="text-white font-bold text-lg">
                  {showAddForm ? 'Cancel' : 'Add Dream Item'}
                </span>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShowEDCChecklist(true)} 
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-full p-1 hover:shadow-2xl hover:shadow-emerald-600/25 transition-all duration-500"
          >
            <div className="bg-black rounded-full px-8 py-4 group-hover:bg-transparent transition-all duration-300">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-white transition-transform duration-500" />
                <span className="text-white font-bold text-lg">EDC Checklist</span>
              </div>
            </div>
          </button>

          {/* GitHub Sync Button */}
          <button 
            onClick={() => setShowGitHubSyncModal(true)} 
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full p-1 hover:shadow-2xl hover:shadow-blue-600/25 transition-all duration-500"
          >
            <div className="bg-black rounded-full px-8 py-4 group-hover:bg-transparent transition-all duration-300">
              <div className="flex items-center gap-3">
                {isSyncing ? (
                  <RefreshCw className="w-6 h-6 text-white animate-spin transition-transform duration-500" />
                ) : isGitHubConfigured ? (
                  <Cloud className="w-6 h-6 text-white transition-transform duration-500" />
                ) : (
                  <CloudOff className="w-6 h-6 text-white transition-transform duration-500" />
                )}
                <span className="text-white font-bold text-lg">
                  {isSyncing ? 'Syncing...' : isGitHubConfigured ? 'Cloud Sync' : 'Setup Sync'}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Add Form */}
        <AddDreamForm
          onSubmit={handleAddDream}
          onCancel={() => setShowAddForm(false)}
          isVisible={showAddForm}
        />

        {/* Items Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <ShoppingCart className="w-7 h-7 text-violet-400" />
            <h2 className="text-3xl font-bold text-white">Your Collection</h2>
            <span className="px-4 py-2 bg-gray-800 rounded-full text-gray-400 text-sm font-bold">
              {dreams.length} items
            </span>
          </div>

          {/* Filter and Sort Bar */}
          {dreams.length > 0 && (
            <FilterSortBar
              filter={filter}
              sortBy={sortBy}
              onFilterChange={setFilter}
              onSortChange={setSortBy}
              itemCount={dreams.length}
            />
          )}

          <div className="space-y-6">
            {dreams.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Your vault is empty
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Start building your dream collection by adding your first item.
                  </p>
                  {!showAddForm && (
                    <button 
                      onClick={() => setShowAddForm(true)}
                      className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-600/25"
                    >
                      Add Your First Dream
                    </button>
                  )}
                </div>
              </div>
            ) : (
              dreams.map((dream) => (
                <DreamItemCard
                  key={dream.id}
                  item={dream}
                  onTogglePurchased={togglePurchased}
                  onDelete={handleDeleteDream}
                  onView={handleViewItem}
                />
              ))
            )}
          </div>
        </div>

        {/* Progress Summary */}
        {dreams.length > 0 && (
          <div className="mt-20">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gray-900/80 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-12 text-center hover:scale-105 transition-all duration-700">
                <h3 className="text-4xl font-bold text-white mb-8 flex items-center justify-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-rose-400 rounded-full blur opacity-60 animate-pulse"></div>
                    <svg className="relative w-10 h-10 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 16L3 12l2-4h14l2 4-2 4H5zM12 8V4l-2-2h4l-2 2v4z"/>
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-white via-violet-200 to-rose-200 bg-clip-text text-transparent">
                    Your Journey
                  </span>
                </h3>
                <div className="mb-10">
                  <div className="flex justify-between text-white mb-6 text-xl font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span>{stats.purchasedItems} dreams realized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{stats.totalItems} total dreams</span>
                      <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-800 rounded-full overflow-hidden shadow-inner relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-700/30 rounded-full"></div>
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 via-violet-400 to-rose-400 rounded-full transition-all duration-3000 ease-out shadow-lg relative overflow-hidden"
                      style={{ width: `${stats.completionPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>${stats.purchasedValue.toLocaleString()} acquired</span>
                    <span>${stats.remainingValue.toLocaleString()} remaining</span>
                  </div>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-violet-400 to-rose-400 bg-clip-text text-transparent leading-relaxed mb-4">
                  {stats.completionPercentage.toFixed(1)}% of your dreams within reach
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-emerald-400">{stats.purchasedItems}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Conquered</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-violet-400">${(stats.totalValue / stats.totalItems).toFixed(0)}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Value</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-rose-400">{stats.remainingItems}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Item Detail Modal */}
        <ItemDetailModal
          item={selectedItem}
          isOpen={showItemModal}
          onClose={handleCloseModal}
        />

        {/* EDC Checklist */}
        <EDCChecklist
          isOpen={showEDCChecklist}
          onClose={() => setShowEDCChecklist(false)}
        />

        {/* GitHub Sync Modal */}
        <GitHubSyncModal
          isOpen={showGitHubSyncModal}
          onClose={() => setShowGitHubSyncModal(false)}
          onSync={handleSync}
        />
      </div>
    </div>
  )
}
