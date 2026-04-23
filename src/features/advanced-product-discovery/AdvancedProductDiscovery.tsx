'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Star, Heart, ShoppingCart, Eye, TrendingUp, Zap } from 'lucide-react'

// Types for product discovery
interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  tags: string[]
  inStock: boolean
  trending: boolean
  aiRecommendation: boolean
  discount?: number
}

interface SearchFilters {
  category: string
  priceRange: [number, number]
  rating: number
  inStock: boolean
  tags: string[]
}

interface AISuggestion {
  query: string
  products: Product[]
  reasoning: string
}

export default function AdvancedProductDiscovery() {
  // Sample products data
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Smart Property Management Suite',
      category: 'Software',
      price: 299.99,
      originalPrice: 399.99,
      rating: 4.8,
      reviews: 1247,
      image: '/api/placeholder/300/200',
      tags: ['AI-powered', 'Property', 'Management'],
      inStock: true,
      trending: true,
      aiRecommendation: true,
      discount: 25
    },
    {
      id: '2',
      name: 'IoT Sensor Network Kit',
      category: 'Hardware',
      price: 149.99,
      rating: 4.6,
      reviews: 892,
      image: '/api/placeholder/300/200',
      tags: ['IoT', 'Sensors', 'Smart'],
      inStock: true,
      trending: false,
      aiRecommendation: true
    },
    {
      id: '3',
      name: 'Enterprise Analytics Dashboard',
      category: 'Software',
      price: 499.99,
      rating: 4.9,
      reviews: 2156,
      image: '/api/placeholder/300/200',
      tags: ['Analytics', 'Dashboard', 'Enterprise'],
      inStock: false,
      trending: true,
      aiRecommendation: false
    },
    {
      id: '4',
      name: 'Cloud Security Platform',
      category: 'Security',
      price: 399.99,
      rating: 4.7,
      reviews: 1432,
      image: '/api/placeholder/300/200',
      tags: ['Security', 'Cloud', 'Compliance'],
      inStock: true,
      trending: false,
      aiRecommendation: true
    },
    {
      id: '5',
      name: 'AI Workflow Automation Tool',
      category: 'Software',
      price: 199.99,
      rating: 4.5,
      reviews: 987,
      image: '/api/placeholder/300/200',
      tags: ['AI', 'Automation', 'Workflow'],
      inStock: true,
      trending: true,
      aiRecommendation: true
    },
    {
      id: '6',
      name: 'Blockchain Integration Service',
      category: 'Services',
      price: 999.99,
      rating: 4.8,
      reviews: 756,
      image: '/api/placeholder/300/200',
      tags: ['Blockchain', 'Integration', 'Web3'],
      inStock: true,
      trending: false,
      aiRecommendation: false
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All',
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    tags: []
  })
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // AI-powered search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      // Simulate AI processing
      const suggestions: AISuggestion[] = [
        {
          query: searchQuery,
          products: products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          ),
          reasoning: `Based on your search for "${searchQuery}", I found products with matching features and capabilities.`
        }
      ]
      setAiSuggestions(suggestions)
    } else {
      setAiSuggestions([])
    }
  }, [searchQuery, products])

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Category filter
      if (filters.category !== 'All' && product.category !== filters.category) return false

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false

      // Rating filter
      if (product.rating < filters.rating) return false

      // In stock filter
      if (filters.inStock && !product.inStock) return false

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => product.tags.includes(tag))) return false

      // Search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) return false

      return true
    })

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        // In real app, would sort by date
        filtered.reverse()
        break
      case 'trending':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
        break
      default:
        // relevance - keep original order for AI recommendations first
        filtered.sort((a, b) => (b.aiRecommendation ? 1 : 0) - (a.aiRecommendation ? 1 : 0))
    }

    return filtered
  }, [products, filters, sortBy, searchQuery])

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  const allTags = Array.from(new Set(products.flatMap(p => p.tags)))

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Advanced Product Discovery</h1>
        </div>
        <p className="text-lg opacity-90">
          AI-powered search and personalized product recommendations for enterprise solutions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, features, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {aiSuggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Zap className="w-4 h-4" />
                  AI Suggestion: {aiSuggestions[0].reasoning}
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {aiSuggestions[0].products.slice(0, 3).map(product => (
                  <div key={product.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.category} • ${product.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[0]}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [Number(e.target.value), prev.priceRange[1]] }))}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Number(e.target.value)] }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilters(prev => ({
                ...prev,
                tags: prev.tags.includes(tag)
                  ? prev.tags.filter(t => t !== tag)
                  : [...prev.tags, tag]
              }))}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{filteredProducts.length} products found</span>
            {aiSuggestions.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <Zap className="w-3 h-3" />
                AI Enhanced
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredProducts.map(product => (
          <div key={product.id} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${product.aiRecommendation ? 'ring-2 ring-blue-200' : ''}`}>
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {product.discount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
                  -{product.discount}%
                </div>
              )}
              {product.trending && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </div>
              )}
              {product.aiRecommendation && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  AI Recommended
                </div>
              )}
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-2 right-2 p-2 rounded-full ${favorites.has(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-500'}`}
              >
                <Heart className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{product.category}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  )
}