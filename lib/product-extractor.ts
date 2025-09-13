interface ExtractedProduct {
  name?: string
  price?: number
  specifications?: string
  image?: string
  error?: string
}

interface SiteExtractor {
  domains: string[]
  selectors: {
    name: string[]
    price: string[]
    specs?: string[]
    image?: string[]
  }
  priceProcessor?: (text: string) => number
}

// Site-specific extractors for major e-commerce platforms
const siteExtractors: SiteExtractor[] = [
  {
    domains: ['amazon.com', 'amazon.ca', 'amazon.co.uk', 'amazon.de'],
    selectors: {
      name: ['#productTitle', '.product-title', '[data-testid="product-title"]'],
      price: ['.a-price-whole', '.a-price .a-offscreen', '.a-price-range'],
      specs: ['#feature-bullets ul', '.a-unordered-list.a-nostyle', '#productDetails_techSpec_section_1'],
      image: ['#landingImage', '.a-dynamic-image', '#imgTagWrapperId img']
    },
    priceProcessor: (text) => parseFloat(text.replace(/[^0-9.]/g, ''))
  },
  {
    domains: ['bestbuy.com', 'bestbuy.ca'],
    selectors: {
      name: ['.sku-title h1', '.product-title', '[data-testid="product-title"]'],
      price: ['.pricing-price__range', '.sr-only', '[data-testid="customer-price"]'],
      specs: ['.product-details', '.specifications-tab'],
      image: ['.primary-image img', '.product-image img']
    }
  },
  {
    domains: ['ebay.com'],
    selectors: {
      name: ['.x-item-title-text', '.it-ttl', 'h1[id="x-title-text-text"]'],
      price: ['.notranslate', '.u-flL.condText', '[data-testid="clipped-price"]'],
      specs: ['.product-details', '.itemAttr'],
      image: ['#icImg', '.imageContainer img']
    }
  },
  {
    domains: ['walmart.com'],
    selectors: {
      name: ['[data-automation-id="product-title"]', 'h1', '.prod-ProductTitle'],
      price: ['[data-automation-id="product-price"]', '.price-current', '[data-testid="price-current"]'],
      specs: ['.product-details', '.specifications'],
      image: ['.prod-hero-image img', '.product-image img']
    }
  },
  {
    domains: ['target.com'],
    selectors: {
      name: ['[data-test="product-title"]', 'h1', '.ProductTitle'],
      price: ['[data-test="product-price"]', '.Price', '[data-testid="price"]'],
      specs: ['.product-details', '.ItemDetails'],
      image: ['.ProductImages img', '.hero-image img']
    }
  },
  {
    domains: ['newegg.com'],
    selectors: {
      name: ['.product-title', 'h1', '[data-testid="product-title"]'],
      price: ['.price-current', '.product-price', '[data-testid="price"]'],
      specs: ['.product-bullets', '.spec-table'],
      image: ['.product-view-img img', '.main-image img']
    }
  }
]

// Generic fallback selectors for unknown sites
const genericSelectors = {
  name: [
    'h1', '[class*="title"]', '[class*="product-title"]', '[class*="name"]',
    '[id*="title"]', '[data-testid*="title"]', '.product-name'
  ],
  price: [
    '[class*="price"]', '[id*="price"]', '[data-testid*="price"]',
    '.cost', '.amount', '[class*="cost"]', '[class*="amount"]'
  ],
  specs: [
    '[class*="spec"]', '[class*="detail"]', '[class*="description"]',
    '[class*="feature"]', '.product-info', '[class*="product-info"]'
  ],
  image: [
    '[class*="product-image"] img', '[class*="main-image"] img',
    '[class*="hero-image"] img', '.product img', '[data-testid*="image"] img'
  ]
}

class ProductExtractor {
  private corsProxyUrl = 'https://api.allorigins.win/get?url='

  // Method 1: Client-side extraction via CORS proxy
  async extractViaProxy(url: string): Promise<ExtractedProduct> {
    try {
      const response = await fetch(`${this.corsProxyUrl}${encodeURIComponent(url)}`)
      const data = await response.json()
      const html = data.contents
      
      // Parse HTML in client
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      return this.extractFromDocument(doc, url)
    } catch (error) {
      console.error('Proxy extraction failed:', error)
      return { error: 'Failed to fetch page content' }
    }
  }

  // Method 2: Server-side extraction (if available)
  async extractViaServer(url: string): Promise<ExtractedProduct> {
    try {
      const response = await fetch('/api/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (!response.ok) {
        throw new Error('Server extraction failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Server extraction failed:', error)
      return { error: 'Server extraction unavailable' }
    }
  }

  // Method 3: OpenGraph/JSON-LD extraction
  async extractStructuredData(url: string): Promise<ExtractedProduct> {
    try {
      const response = await fetch(`${this.corsProxyUrl}${encodeURIComponent(url)}`)
      const data = await response.json()
      const html = data.contents
      
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      // Try JSON-LD first
      const jsonLdScript = doc.querySelector('script[type="application/ld+json"]')
      if (jsonLdScript) {
        try {
          const jsonData = JSON.parse(jsonLdScript.textContent || '')
          if (jsonData['@type'] === 'Product' || jsonData.product) {
            const product = jsonData.product || jsonData
            return {
              name: product.name,
              price: product.offers?.price || product.price,
              specifications: product.description,
              image: product.image?.[0] || product.image
            }
          }
        } catch (e) {
          console.warn('JSON-LD parsing failed:', e)
        }
      }
      
      // Fallback to OpenGraph
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
      const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
      
      return {
        name: ogTitle || '',
        specifications: ogDescription || '',
        image: ogImage || ''
      }
    } catch (error) {
      console.error('Structured data extraction failed:', error)
      return { error: 'Failed to extract structured data' }
    }
  }

  // Core extraction logic
  private extractFromDocument(doc: Document, url: string): ExtractedProduct {
    const domain = new URL(url).hostname.toLowerCase()
    
    // Find matching site extractor
    const extractor = siteExtractors.find(ext => 
      ext.domains.some(d => domain.includes(d))
    )
    
    const selectors = extractor?.selectors || genericSelectors
    
    // Extract name
    let name = ''
    for (const selector of selectors.name) {
      const element = doc.querySelector(selector)
      if (element?.textContent?.trim()) {
        name = element.textContent.trim()
        break
      }
    }
    
    // Extract price
    let price = 0
    for (const selector of selectors.price) {
      const element = doc.querySelector(selector)
      if (element?.textContent?.trim()) {
        const priceText = element.textContent.trim()
        const processor = extractor?.priceProcessor || this.defaultPriceProcessor
        price = processor(priceText)
        if (price > 0) break
      }
    }
    
    // Extract specifications
    let specifications = ''
    if (selectors.specs) {
      for (const selector of selectors.specs) {
        const element = doc.querySelector(selector)
        if (element?.textContent?.trim()) {
          specifications = element.textContent.trim().substring(0, 200) // Limit length
          break
        }
      }
    }
    
    // Extract image
    let image = ''
    if (selectors.image) {
      for (const selector of selectors.image) {
        const element = doc.querySelector(selector) as HTMLImageElement
        if (element?.src) {
          image = element.src
          break
        }
      }
    }
    
    return {
      name: name || undefined,
      price: price || undefined,
      specifications: specifications || undefined,
      image: image || undefined
    }
  }
  
  private defaultPriceProcessor(text: string): number {
    // Remove currency symbols and extract numeric value
    const cleaned = text.replace(/[^0-9.,]/g, '')
    const number = parseFloat(cleaned.replace(/,/g, ''))
    return isNaN(number) ? 0 : number
  }

  // Main extraction method - tries multiple approaches
  async extract(url: string): Promise<ExtractedProduct> {
    // Validate URL
    try {
      new URL(url)
    } catch {
      return { error: 'Invalid URL format' }
    }

    // Try methods in order of preference
    const methods = [
      () => this.extractViaServer(url),      // Server-side (best)
      () => this.extractStructuredData(url), // Structured data
      () => this.extractViaProxy(url)        // Client-side fallback
    ]

    for (const method of methods) {
      try {
        const result = await method()
        if (result && !result.error && (result.name || result.price)) {
          return result
        }
      } catch (error) {
        console.warn('Extraction method failed:', error)
        continue
      }
    }

    return { error: 'Unable to extract product data from this URL' }
  }

  // Quick URL preview (just title and domain)
  async getUrlPreview(url: string): Promise<{ title?: string; domain?: string; favicon?: string }> {
    try {
      const domain = new URL(url).hostname
      const response = await fetch(`${this.corsProxyUrl}${encodeURIComponent(url)}`)
      const data = await response.json()
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')
      
      const title = doc.querySelector('title')?.textContent?.trim() ||
                   doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                   'Unknown Product'
      
      return {
        title,
        domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      }
    } catch {
      return { domain: 'Unknown' }
    }
  }
}

export const productExtractor = new ProductExtractor()
