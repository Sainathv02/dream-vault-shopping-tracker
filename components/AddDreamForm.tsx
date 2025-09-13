import { useState } from 'react'
import { DreamItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AddDreamFormProps {
  onSubmit: (dreamData: Omit<DreamItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  isVisible: boolean
}

export function AddDreamForm({ onSubmit, onCancel, isVisible }: AddDreamFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    specifications: '',
    price: '',
    priority: 'medium' as DreamItem['priority']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price) return

    onSubmit({
      name: formData.name.trim(),
      specifications: formData.specifications.trim() || undefined,
      price: parseFloat(formData.price),
      priority: formData.priority,
      purchased: false
    })

    // Reset form
    setFormData({
      name: '',
      specifications: '',
      price: '',
      priority: 'medium'
    })
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isVisible) return null

  return (
    <div className="mb-12">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 rounded-3xl blur-xl opacity-30"></div>
        <div className="relative bg-gray-900/90 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <input
                type="text"
                placeholder="What's your dream?"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="col-span-2 px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-filter backdrop-blur-sm transition-all duration-300"
                required
              />
              
              <input
                type="text"
                placeholder="Specifications"
                value={formData.specifications}
                onChange={(e) => handleInputChange('specifications', e.target.value)}
                className="px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-filter backdrop-blur-sm transition-all duration-300"
              />
              
              <input
                type="number"
                placeholder="Price ($)"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-filter backdrop-blur-sm transition-all duration-300"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            {/* Priority Selection */}
            <div className="mt-6">
              <label className="block text-white text-sm font-medium mb-3">Priority Level</label>
              <div className="flex gap-3">
                {(['high', 'medium', 'low'] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleInputChange('priority', priority)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                      formData.priority === priority
                        ? priority === 'high'
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                          : priority === 'medium'
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                    )}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-6 gap-4">
              <button 
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-600/25"
              >
                Add to Vault
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
