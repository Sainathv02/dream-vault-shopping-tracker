export interface DreamItem {
  id: string;
  name: string;
  specifications?: string;
  price: number;
  purchased: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface DreamStats {
  totalValue: number;
  purchasedValue: number;
  remainingValue: number;
  totalItems: number;
  purchasedItems: number;
  remainingItems: number;
  completionPercentage: number;
}

export type DreamFilter = {
  priority?: DreamItem['priority'];
  purchased?: boolean;
  search?: string;
}

export type SortOption = 'price' | 'name' | 'priority' | 'created';
