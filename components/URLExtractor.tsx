'use client'

import { useState } from 'react'
import { ExternalLink, Loader2, CheckCircle, AlertCircle, Sparkles, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { productExtractor } from '@/lib/product-extractor'
import { DreamItem } from '@/lib/types'

interface URLExtractorProps {
  onExtracted: (data: Partial<Omit<DreamItem, 'id' | 'createdAt' | 'updatedAt'>>) => void
  className?: string
}

export function URLExtractor({ onExtracted, className }: URLExtractorProps) {
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionResult, setExtractionResult] = useState<{
    success: boolean
    message: string
    data?: Partial<Omit<DreamItem, 'id' | 'createdAt' | 'updatedAt'>>
  } | null>(null)
  const [preview, setPreview] = useState<{
    title?: string
    domain?: string
    favicon?: string
  } | null>(null)

  const handleUrlChange = async (value: string) => {
    setUrl(value)
    setExtractionResult(null)
    
    // Show URL preview for valid URLs
    if (value && isValidUrl(value)) {
      try {
        const previewData = await productExtractor.getUrlPreview(value)
        setPreview(previewData)
      } catch {
        setPreview(null)
      }
    } else {
      setPreview(null)
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleExtract = async () => {
    if (!url.trim() || !isValidUrl(url)) {
      setExtractionResult({
        success: false,
        message: 'Please enter a valid URL'
      })
      return
    }

    setIsExtracting(true)
    setExtractionResult(null)

    try {
      const result = await productExtractor.extract(url)
      
      if (result.error) {
        setExtractionResult({
          success: false,
          message: result.error
        })
      } else if (!result.name && !result.price) {
        setExtractionResult({
          success: false,
          message: 'No product data found. Try a product page URL from Amazon, Best Buy, eBay, etc.'
        })
      } else {
        // Map extracted data to dream item format
        const dreamData: Partial<Omit<DreamItem, 'id' | 'createdAt' | 'updatedAt'>> = {
          name: result.name || '',
          specifications: result.specifications || '',
          price: result.price || 0,
          priority: 'medium',
          purchased: false
        }

        setExtractionResult({
          success: true,
          message: `Successfully extracted: ${result.name}`,
          data: dreamData
        })

        // Auto-populate the form
        onExtracted(dreamData)
        
        // Clear URL after successful extraction
        setTimeout(() => {
          setUrl('')
          setPreview(null)
          setExtractionResult(null)
        }, 3000)
      }
    } catch {
      setExtractionResult({
        success: false,
        message: 'Extraction failed. Please try again or enter details manually.'
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const supportedSites = [
    { name: 'Amazon', domain: 'amazon.com', color: 'text-orange-400' },
    { name: 'Best Buy', domain: 'bestbuy.com', color: 'text-blue-400' },
    { name: 'eBay', domain: 'ebay.com', color: 'text-yellow-400' },
    { name: 'Walmart', domain: 'walmart.com', color: 'text-blue-300' },
    { name: 'Target', domain: 'target.com', color: 'text-red-400' },
    { name: 'Newegg', domain: 'newegg.com', color: 'text-orange-300' }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Smart URL Extractor</h3>
          <p className="text-gray-400 text-sm">Paste a product URL to auto-fill details</p>
        </div>
      </div>

      {/* URL Input */}
      <div className="relative">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="url"
            placeholder="https://amazon.com/product-link or any e-commerce URL..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
            className="w-full pl-10 pr-24 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            disabled={isExtracting}
          />
          <button
            onClick={handleExtract}
            disabled={!url.trim() || !isValidUrl(url) || isExtracting}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors duration-200"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Extract
              </>
            )}
          </button>
        </div>

        {/* URL Preview */}
        {preview && !isExtracting && !extractionResult && (
          <div className="mt-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              {preview.favicon && (
                <img src={preview.favicon} alt="Website favicon" className="w-4 h-4" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{preview.title}</p>
                <p className="text-gray-400 text-xs">{preview.domain}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Extraction Result */}
        {extractionResult && (
          <div className={cn(
            "mt-3 p-4 rounded-xl border flex items-start gap-3",
            extractionResult.success
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          )}>
            {extractionResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={cn(
                "font-medium mb-1",
                extractionResult.success ? "text-green-400" : "text-red-400"
              )}>
                {extractionResult.success ? "Success!" : "Extraction Failed"}
              </p>
              <p className="text-gray-300 text-sm">{extractionResult.message}</p>
              
              {extractionResult.success && extractionResult.data && (
                <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Extracted data:</p>
                  <div className="space-y-1 text-xs">
                    {extractionResult.data.name && (
                      <p><span className="text-gray-400">Name:</span> <span className="text-white">{extractionResult.data.name}</span></p>
                    )}
                    {extractionResult.data.price && extractionResult.data.price > 0 && (
                      <p><span className="text-gray-400">Price:</span> <span className="text-green-400">${extractionResult.data.price}</span></p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Supported Sites */}
      <div className="bg-gray-800/30 rounded-2xl p-4">
        <p className="text-gray-400 text-sm mb-3">✨ Works best with:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {supportedSites.map((site) => (
            <div key={site.domain} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={cn("font-medium", site.color)}>{site.name}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-3">
          💡 Also works with many other e-commerce sites. Paste any product page URL to try!
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
        <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Pro Tips
        </h4>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Use the main product page URL (not search results)</p>
          <p>• Works best with single product pages</p>
          <p>• Extracted data can be edited before saving</p>
          <p>• If extraction fails, you can still add items manually</p>
        </div>
      </div>
    </div>
  )
}
