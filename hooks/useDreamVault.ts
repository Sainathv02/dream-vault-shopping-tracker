import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DreamItem, DreamFilter, DreamStats, SortOption } from '@/lib/types'
import { filterDreamItems, sortDreamItems } from '@/lib/utils'
import { githubSync } from '@/lib/github-sync'

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
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout>()

  // Save to localStorage and auto-sync whenever dreams change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamVaultItems', JSON.stringify(dreams))
      
        // Auto-sync with debouncing if GitHub is configured (client-side only)
        if (typeof window !== 'undefined' && githubSync.isConfigured()) {
          // Clear existing timeout
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current)
          }
          
          // Set new timeout for auto-sync (5 seconds after last change)
          syncTimeoutRef.current = setTimeout(() => {
            syncWithGitHub()
          }, 5000)
        }
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

  // GitHub Sync Functions
  const syncWithGitHub = useCallback(async (force: boolean = false) => {
    if (!githubSync.isConfigured()) {
      setSyncError('GitHub sync not configured')
      return false
    }

    setIsSyncing(true)
    setSyncError(null)

    try {
      // Get current EDC items from localStorage
      const edcItems = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('edc-checklist') || '[]')
        : []
      
      // Sync with GitHub
      const syncResult = await githubSync.syncData(dreams, edcItems)
      
      // Update local state with synced data
      if (syncResult.dreams) {
        const convertedDreams = syncResult.dreams.map((dream: any) => ({
          ...dream,
          createdAt: new Date(dream.createdAt),
          updatedAt: new Date(dream.updatedAt)
        }))
        setDreams(convertedDreams)
      }
      
      // Update EDC items in localStorage
      if (typeof window !== 'undefined' && syncResult.edcItems) {
        localStorage.setItem('edc-checklist', JSON.stringify(syncResult.edcItems))
      }
      
      setLastSyncTime(new Date())
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastSyncTime', new Date().toISOString())
      }
      
      return true
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncError((error as Error).message)
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [dreams])

  const uploadToGitHub = useCallback(async () => {
    if (!githubSync.isConfigured()) {
      setSyncError('GitHub sync not configured')
      return false
    }

    setIsSyncing(true)
    setSyncError(null)

    try {
      const edcItems = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('edc-checklist') || '[]')
        : []
      const currentVersion = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('data-version') || '0')
        : 0
      
      await githubSync.uploadData({
        dreams,
        edcItems,
        lastSync: new Date().toISOString(),
        version: currentVersion + 1
      })
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('data-version', (currentVersion + 1).toString())
        localStorage.setItem('lastSyncTime', new Date().toISOString())
      }
      setLastSyncTime(new Date())
      
      return true
    } catch (error) {
      console.error('Upload failed:', error)
      setSyncError((error as Error).message)
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [dreams])

  const downloadFromGitHub = useCallback(async () => {
    if (!githubSync.isConfigured()) {
      setSyncError('GitHub sync not configured')
      return false
    }

    setIsSyncing(true)
    setSyncError(null)

    try {
      const remoteData = await githubSync.downloadData()
      
      if (remoteData) {
        // Update dreams
        if (remoteData.dreams) {
          const convertedDreams = remoteData.dreams.map((dream: any) => ({
            ...dream,
            createdAt: new Date(dream.createdAt),
            updatedAt: new Date(dream.updatedAt)
          }))
          setDreams(convertedDreams)
        }
        
        // Update EDC items
        if (typeof window !== 'undefined' && remoteData.edcItems) {
          localStorage.setItem('edc-checklist', JSON.stringify(remoteData.edcItems))
        }
        
        // Update version and sync time
        if (typeof window !== 'undefined' && remoteData.version) {
          localStorage.setItem('data-version', remoteData.version.toString())
          localStorage.setItem('lastSyncTime', new Date().toISOString())
        }
        
        setLastSyncTime(new Date())
      }
      
      return true
    } catch (error) {
      console.error('Download failed:', error)
      setSyncError((error as Error).message)
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Load last sync time on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastSync = localStorage.getItem('lastSyncTime')
      if (lastSync) {
        setLastSyncTime(new Date(lastSync))
      }
    }
  }, [])

  // Initial sync on mount if GitHub is configured (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && githubSync.isConfigured()) {
      // Small delay to allow component to mount properly
      setTimeout(() => {
        syncWithGitHub()
      }, 1000)
    }
  }, [])

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
    // GitHub Sync
    syncWithGitHub,
    uploadToGitHub,
    downloadFromGitHub,
    isSyncing,
    lastSyncTime,
    syncError,
    isGitHubConfigured: githubSync.isConfigured()
  }
}
