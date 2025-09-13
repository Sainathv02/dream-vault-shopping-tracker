import { useState, useEffect, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DreamItem, DreamFilter, DreamStats, SortOption } from '@/lib/types'
import { filterDreamItems, sortDreamItems } from '@/lib/utils'

const sampleDreams: DreamItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    specifications: '512GB Blue Titanium',
    price: 1399,
    purchased: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Air Jordan 1 Retro High',
    specifications: 'Size 9.5 Bred Toe',
    price: 170,
    purchased: true,
    priority: 'medium',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'MacBook Pro 16" M3 Max',
    specifications: '48GB RAM, 1TB SSD',
    price: 3999,
    purchased: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
]

export function useDreamVault() {
  const [dreams, setDreams] = useState<DreamItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dreamVaultItems')
      if (saved) {
        try {
          const parsedDreams = JSON.parse(saved)
          // Convert date strings back to Date objects
          return parsedDreams.map((dream: any) => ({
            ...dream,
            createdAt: new Date(dream.createdAt),
            updatedAt: new Date(dream.updatedAt)
          }))
        } catch (error) {
          console.error('Error loading saved dreams:', error)
        }
      }
    }
    return sampleDreams
  })
  const [filter, setFilter] = useState<DreamFilter>({})
  const [sortBy, setSortBy] = useState<SortOption>('created')

  // Save to localStorage whenever dreams change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamVaultItems', JSON.stringify(dreams))
    }
  }, [dreams])

  // Filtered and sorted dreams
  const filteredDreams = useMemo(() => {
    const filtered = filterDreamItems(dreams, filter)
    return sortDreamItems(filtered, sortBy)
  }, [dreams, filter, sortBy])

  // Statistics
  const stats = useMemo(() => {
    const totalValue = dreams.reduce((sum, dream) => sum + dream.price, 0)
    const purchasedValue = dreams.filter(d => d.purchased).reduce((sum, dream) => sum + dream.price, 0)
    const remainingValue = totalValue - purchasedValue
    const purchasedItems = dreams.filter(d => d.purchased).length
    const completionPercentage = totalValue > 0 ? (purchasedValue / totalValue) * 100 : 0

    return {
      totalValue,
      purchasedValue,
      remainingValue,
      totalItems: dreams.length,
      purchasedItems,
      remainingItems: dreams.length - purchasedItems,
      completionPercentage
    }
  }, [dreams])

  // CRUD operations
  const addDream = (dreamData: Omit<DreamItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDream: DreamItem = {
      ...dreamData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setDreams(prev => [newDream, ...prev])
  }

  const updateDream = (id: string, updates: Partial<DreamItem>) => {
    setDreams(prev => 
      prev.map(dream => 
        dream.id === id 
          ? { ...dream, ...updates, updatedAt: new Date() }
          : dream
      )
    )
  }

  const deleteDream = (id: string) => {
    setDreams(prev => prev.filter(dream => dream.id !== id))
  }

  const togglePurchased = (id: string) => {
    updateDream(id, { 
      purchased: !dreams.find(d => d.id === id)?.purchased 
    })
  }

  const importDreams = (importedDreams: DreamItem[]) => {
    // Merge imported dreams with existing ones, avoiding duplicates by name
    setDreams(prev => {
      const existingNames = new Set(prev.map(dream => dream.name.toLowerCase()))
      const newDreams = importedDreams.filter(dream => 
        !existingNames.has(dream.name.toLowerCase())
      ).map(dream => ({
        ...dream,
        id: uuidv4(), // Generate new ID to avoid conflicts
        createdAt: new Date(dream.createdAt),
        updatedAt: new Date(dream.updatedAt)
      }))
      return [...prev, ...newDreams]
    })
  }

  return {
    dreams: filteredDreams,
    allDreams: dreams,
    stats,
    filter,
    sortBy,
    setFilter,
    setSortBy,
    addDream,
    updateDream,
    deleteDream,
    togglePurchased,
    importDreams
  }
}
