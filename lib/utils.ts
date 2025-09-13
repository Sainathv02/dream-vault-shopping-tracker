import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DreamItem, DreamFilter, SortOption } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export function getPriorityColor(priority: DreamItem['priority']): string {
  switch (priority) {
    case 'high':
      return 'from-red-500 to-pink-500'
    case 'medium':
      return 'from-yellow-500 to-orange-500'
    case 'low':
      return 'from-green-500 to-emerald-500'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

export function getPriorityIcon(priority: DreamItem['priority']): string {
  switch (priority) {
    case 'high':
      return 'M13 10V3L4 14h7v7l9-11h-7z' // lightning bolt
    case 'medium':
      return 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' // star
    case 'low':
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' // check circle
    default:
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  }
}

export function filterDreamItems(items: DreamItem[], filter: DreamFilter): DreamItem[] {
  return items.filter(item => {
    if (filter.priority && item.priority !== filter.priority) return false
    if (filter.purchased !== undefined && item.purchased !== filter.purchased) return false
    if (filter.search) {
      const search = filter.search.toLowerCase()
      return item.name.toLowerCase().includes(search) || 
             item.specifications?.toLowerCase().includes(search)
    }
    return true
  })
}

export function sortDreamItems(items: DreamItem[], sortBy: SortOption): DreamItem[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime()
      default:
        return 0
    }
  })
}
