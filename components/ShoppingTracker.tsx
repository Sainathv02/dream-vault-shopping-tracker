'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Check, ShoppingCart, DollarSign, ChevronDown, ChevronUp, Star, Heart, Zap, Gift, TrendingUp, Eye } from 'lucide-react';

interface Variation {
  id: number;
  spec: string;
  price: number;
  selected: boolean;
}

interface Item {
  id: number;
  name: string;
  purchased: boolean;
  expanded: boolean;
  variations: Variation[];
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface NewItem {
  name: string;
  spec: string;
  price: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

const ShoppingTracker: React.FC = () => {
  const [items, setItems] = useState<Item[]>([
    { 
      id: 1, 
      name: 'iPhone 15 Pro Max', 
      purchased: false,
      expanded: false,
      priority: 'high',
      category: 'Tech',
      variations: [
        { id: 11, spec: '256GB Natural Titanium', price: 1199, selected: false },
        { id: 12, spec: '512GB Blue Titanium', price: 1399, selected: true },
        { id: 13, spec: '1TB White Titanium', price: 1599, selected: false },
      ]
    },
    { 
      id: 2, 
      name: 'Nike Air Jordan 1 Retro High', 
      purchased: true,
      expanded: false,
      priority: 'medium',
      category: 'Fashion',
      variations: [
        { id: 21, spec: 'Size 9.5 - Bred Toe', price: 170, selected: true },
        { id: 22, spec: 'Size 10 - Royal Blue', price: 170, selected: false },
      ]
    },
    { 
      id: 3, 
      name: 'MacBook Pro 16" M3 Max', 
      purchased: false,
      expanded: false,
      priority: 'high',
      category: 'Tech',
      variations: [
        { id: 31, spec: '36GB RAM, 1TB SSD', price: 3499, selected: false },
        { id: 32, spec: '48GB RAM, 1TB SSD', price: 3999, selected: true },
        { id: 33, spec: '64GB RAM, 2TB SSD', price: 4999, selected: false },
      ]
    },
    { 
      id: 4, 
      name: 'Sony WH-1000XM5', 
      purchased: false,
      expanded: false,
      priority: 'low',
      category: 'Audio',
      variations: [
        { id: 41, spec: 'Midnight Black', price: 399, selected: true },
        { id: 42, spec: 'Silver', price: 399, selected: false },
      ]
    },
  ]);

  const [newItem, setNewItem] = useState<NewItem>({ 
    name: '', 
    spec: '', 
    price: '', 
    priority: 'medium',
    category: 'Tech'
  });

  const [filter, setFilter] = useState<'all' | 'purchased' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'priority' | 'name'>('priority');

  // Get selected price for each item
  const getSelectedPrice = (item: Item): number => {
    const selected = item.variations.find(v => v.selected);
    return selected ? selected.price : item.variations[0]?.price || 0;
  };

  // Calculations
  const totalWishlist = items.reduce((sum, item) => sum + getSelectedPrice(item), 0);
  const totalPurchased = items.filter(item => item.purchased).reduce((sum, item) => sum + getSelectedPrice(item), 0);
  const remainingBudget = totalWishlist - totalPurchased;
  const purchasedCount = items.filter(item => item.purchased).length;
  const highPriorityCount = items.filter(item => item.priority === 'high' && !item.purchased).length;

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      if (filter === 'purchased') return item.purchased;
      if (filter === 'pending') return !item.purchased;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return getSelectedPrice(b) - getSelectedPrice(a);
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.name.localeCompare(b.name);
    });

  const addItem = () => {
    if (newItem.name && newItem.spec && newItem.price) {
      const newId = Date.now();
      setItems([...items, {
        id: newId,
        name: newItem.name,
        purchased: false,
        expanded: false,
        priority: newItem.priority,
        category: newItem.category,
        variations: [{
          id: newId * 10,
          spec: newItem.spec,
          price: parseFloat(newItem.price) || 0,
          selected: true
        }]
      }]);
      setNewItem({ name: '', spec: '', price: '', priority: 'medium', category: 'Tech' });
    }
  };

  const togglePurchased = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const deleteItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleExpanded = (itemId: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const selectVariation = (itemId: number, variationId: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          variations: item.variations.map(v => ({
            ...v,
            selected: v.id === variationId
          }))
        };
      }
      return item;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Zap className="w-4 h-4" />;
      case 'medium': return <Star className="w-4 h-4" />;
      case 'low': return <Heart className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  LUXE
                </h1>
                <p className="text-purple-300 text-lg font-semibold tracking-wide">WISHLIST</p>
              </div>
            </div>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Curate your dreams. Track your desires. Make it happen.
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            {/* Total Wishlist */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-purple-300 text-sm font-bold uppercase tracking-wider">Total</p>
                    <p className="text-3xl font-black text-white">${totalWishlist.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-full"></div>
                </div>
              </div>
            </div>

            {/* Purchased */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-green-300 text-sm font-bold uppercase tracking-wider">Owned</p>
                    <p className="text-3xl font-black text-white">${totalPurchased.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${totalWishlist > 0 ? (totalPurchased / totalWishlist) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Remaining */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-blue-300 text-sm font-bold uppercase tracking-wider">Remaining</p>
                    <p className="text-3xl font-black text-white">${remainingBudget.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                    style={{ width: `${totalWishlist > 0 ? (remainingBudget / totalWishlist) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* High Priority */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-red-300 text-sm font-bold uppercase tracking-wider">Priority</p>
                    <p className="text-3xl font-black text-white">{highPriorityCount}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as 'all' | 'purchased' | 'pending')}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Items</option>
                <option value="pending">Pending</option>
                <option value="purchased">Purchased</option>
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'price' | 'priority' | 'name')}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="priority">Priority</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Add New Item Form */}
          <div className="mb-12">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-lg opacity-30"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Plus className="w-8 h-8 text-purple-400" />
                  Add to Wishlist
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <input
                    type="text"
                    placeholder="Product name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="col-span-2 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-xl"
                  />
                  <input
                    type="text"
                    placeholder="Specifications"
                    value={newItem.spec}
                    onChange={(e) => setNewItem({...newItem, spec: e.target.value})}
                    className="col-span-2 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-xl"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-xl"
                  />
                  <button
                    onClick={addItem}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                  >
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <select 
                    value={newItem.priority} 
                    onChange={(e) => setNewItem({...newItem, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <select 
                    value={newItem.category} 
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Audio">Audio</option>
                    <option value="Home">Home</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`group relative transition-all duration-700 ${item.purchased ? 'scale-95 opacity-75' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute -inset-1 rounded-3xl blur-lg transition-all duration-300 ${
                  item.purchased 
                    ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30' 
                    : `bg-gradient-to-r ${getPriorityColor(item.priority)}/20 group-hover:${getPriorityColor(item.priority)}/40`
                }`}></div>
                
                <div className={`relative rounded-3xl border backdrop-blur-2xl transition-all duration-500 ${
                  item.purchased
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}>
                  
                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <button
                          onClick={() => togglePurchased(item.id)}
                          className={`relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                            item.purchased
                              ? 'bg-green-500 border-green-500 shadow-2xl shadow-green-500/50'
                              : 'border-white/30 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-110'
                          }`}
                        >
                          {item.purchased && (
                            <Check size={24} className="text-white animate-bounce" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className={`text-2xl font-bold transition-all duration-300 ${
                              item.purchased ? 'text-green-400 line-through' : 'text-white'
                            }`}>
                              {item.name}
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-gradient-to-r ${getPriorityColor(item.priority)}`}>
                              {getPriorityIcon(item.priority)}
                              {item.priority.toUpperCase()}
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                              {item.category}
                            </span>
                          </div>
                          <div className={`flex items-center gap-4 ${item.purchased ? 'line-through' : ''}`}>
                            <span className="text-slate-300">
                              {item.variations.find(v => v.selected)?.spec || item.variations[0]?.spec}
                            </span>
                            <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                              ${getSelectedPrice(item).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200"
                        >
                          {item.expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all duration-200 hover:scale-110"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Variations */}
                  {item.expanded && (
                    <div className="px-8 pb-8">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Variations
                        </h4>
                        <div className="space-y-3">
                          {item.variations.map((variation) => (
                            <div 
                              key={variation.id} 
                              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                                variation.selected 
                                  ? 'bg-purple-500/20 border border-purple-500/50' 
                                  : 'bg-white/5 border border-white/10 hover:border-white/20'
                              }`}
                            >
                              <button
                                onClick={() => selectVariation(item.id, variation.id)}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                  variation.selected 
                                    ? 'bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/50' 
                                    : 'border-white/30 hover:border-purple-400'
                                }`}
                              />
                              <span className="flex-1 text-white font-medium">{variation.spec}</span>
                              <span className="text-2xl font-bold text-cyan-400">${variation.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="mt-16">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center">
                <h3 className="text-3xl font-bold text-white mb-6">Your Progress</h3>
                <div className="mb-8">
                  <div className="flex justify-between text-white mb-4">
                    <span className="font-semibold">{purchasedCount} completed</span>
                    <span className="font-semibold">{items.length} total</span>
                  </div>
                  <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full transition-all duration-2000 ease-out shadow-lg"
                      style={{ width: `${items.length > 0 ? (purchasedCount / items.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">
                  {purchasedCount === items.length && items.length > 0 
                    ? "🎉 Mission Complete! You've got everything!" 
                    : `${Math.round((purchasedCount / items.length) * 100) || 0}% of your wishlist completed`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingTracker;