'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Check, Trash2, Zap, ShoppingCart, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EDCItem {
  id: string
  name: string
  description: string
  acquired: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

const defaultEDCItems: Omit<EDCItem, 'id' | 'createdAt'>[] = [
  { name: 'Wallet', description: 'Slim, RFID-blocking wallet', acquired: false, priority: 'high' },
  { name: 'Keys', description: 'House, car, work keys with organizer', acquired: false, priority: 'high' },
  { name: 'Phone', description: 'Smartphone with protective case', acquired: false, priority: 'high' },
  { name: 'Watch', description: 'Reliable timepiece or smartwatch', acquired: false, priority: 'medium' },
  { name: 'Pocket Knife/Multi-tool', description: 'Compact utility tool', acquired: false, priority: 'medium' },
  { name: 'Flashlight', description: 'Small, bright LED flashlight', acquired: false, priority: 'medium' },
  { name: 'Pen', description: 'Reliable writing instrument', acquired: false, priority: 'low' },
  { name: 'Tissues/Handkerchief', description: 'Personal hygiene essentials', acquired: false, priority: 'low' },
  { name: 'Cash', description: 'Emergency cash in small bills', acquired: false, priority: 'low' },
  { name: 'Earbuds/Headphones', description: 'Portable audio device', acquired: false, priority: 'low' }
]

interface EDCChecklistProps {
  isOpen: boolean
  onClose: () => void
}

export function EDCChecklist({ isOpen, onClose }: EDCChecklistProps) {
  const [edcItems, setEdcItems] = useState<EDCItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [showAddForm, setShowAddForm] = useState(false)

  // Load EDC items from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('edc-checklist')
    if (savedItems) {
      setEdcItems(JSON.parse(savedItems))
    } else {
      // Initialize with default items if none exist
      const initialItems = defaultEDCItems.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      }))
      setEdcItems(initialItems)
      localStorage.setItem('edc-checklist', JSON.stringify(initialItems))
    }
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (edcItems.length > 0) {
      localStorage.setItem('edc-checklist', JSON.stringify(edcItems))
    }
  }, [edcItems])

  const toggleAcquired = (id: string) => {
    setEdcItems(items => 
      items.map(item => 
        item.id === id ? { ...item, acquired: !item.acquired } : item
      )
    )
  }

  const deleteItem = (id: string) => {
    const item = edcItems.find(item => item.id === id)
    if (item && confirm(`Delete "${item.name}" from your EDC checklist?`)) {
      setEdcItems(items => items.filter(item => item.id !== id))
    }
  }

  const addItem = () => {
    if (!newItemName.trim()) return

    const newItem: EDCItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName.trim(),
      description: newItemDescription.trim(),
      acquired: false,
      priority: newItemPriority,
      createdAt: new Date().toISOString()
    }

    setEdcItems(items => [newItem, ...items])
    setNewItemName('')
    setNewItemDescription('')
    setNewItemPriority('medium')
    setShowAddForm(false)
  }

  const resetList = () => {
    if (confirm('Reset EDC checklist to default items? This will remove all custom items.')) {
      const resetItems = defaultEDCItems.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      }))
      setEdcItems(resetItems)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'low': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />
      case 'medium': return <ShoppingCart className="w-4 h-4" />
      case 'low': return <Check className="w-4 h-4" />
      default: return <Check className="w-4 h-4" />
    }
  }

  const stats = {
    total: edcItems.length,
    acquired: edcItems.filter(item => item.acquired).length,
    pending: edcItems.filter(item => !item.acquired).length
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl blur-xl opacity-40"></div>
          <div className="relative bg-gray-900/95 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">EDC Checklist</h2>
                  <p className="text-gray-400">Your everyday carry essentials reminder</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-gray-400 text-sm">Total Items</div>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.acquired}</div>
                <div className="text-gray-400 text-sm">Acquired</div>
              </div>
              <div className="bg-orange-500/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.pending}</div>
                <div className="text-gray-400 text-sm">Still Need</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
              >
                {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddForm ? 'Cancel' : 'Add Item'}
              </button>
              
              <button
                onClick={resetList}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Reset to Default
              </button>
            </div>

            {/* Add Item Form */}
            {showAddForm && (
              <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Add New EDC Item</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g., Backup Battery"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      placeholder="e.g., 10000mAh power bank with USB-C"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Priority
                    </label>
                    <select
                      value={newItemPriority}
                      onChange={(e) => setNewItemPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={addItem}
                    disabled={!newItemName.trim()}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                  >
                    Add to Checklist
                  </button>
                </div>
              </div>
            )}

            {/* EDC Items List */}
            <div className="space-y-3">
              {edcItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                    item.acquired
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleAcquired(item.id)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                      item.acquired
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-600 hover:border-emerald-500"
                    )}
                  >
                    {item.acquired && <Check className="w-4 h-4 text-white" />}
                  </button>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={cn(
                        "font-bold transition-all duration-300",
                        item.acquired 
                          ? "text-emerald-400 line-through" 
                          : "text-white"
                      )}>
                        {item.name}
                      </h3>
                      
                      {/* Priority Badge */}
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-white bg-gradient-to-r",
                        getPriorityColor(item.priority)
                      )}>
                        {getPriorityIcon(item.priority)}
                        <span>{item.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className={cn(
                        "text-sm transition-all duration-300",
                        item.acquired ? "text-gray-500 line-through" : "text-gray-400"
                      )}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {edcItems.length === 0 && (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No EDC items yet. Add your first essential item!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
