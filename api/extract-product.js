// Vercel Serverless Function for Product Data Extraction
// Install: npm install puppeteer-core @sparticuz/chromium

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Dynamic imports for Vercel serverless
    const puppeteer = await import('puppeteer-core')
    const chromium = await import('@sparticuz/chromium')

    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    console.log('Extracting from:', url)

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
    })

    const page = await browser.newPage()
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Set timeout
    page.setDefaultNavigationTimeout(15000)
    
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      })

      // Wait a bit for dynamic content to load
      await page.waitForTimeout(2000)

      // Extract data using site-specific and generic selectors
      const data = await page.evaluate(() => {
        // Site-specific extraction functions
        const extractors = {
          'amazon.com': () => ({
            name: document.querySelector('#productTitle, .product-title')?.textContent?.trim(),
            price: document.querySelector('.a-price-whole, .a-price .a-offscreen')?.textContent?.trim(),
            specifications: document.querySelector('#feature-bullets ul, .a-unordered-list.a-nostyle')?.textContent?.trim()?.substring(0, 300),
            image: document.querySelector('#landingImage, .a-dynamic-image')?.src
          }),
          
          'bestbuy.com': () => ({
            name: document.querySelector('.sku-title h1, .product-title')?.textContent?.trim(),
            price: document.querySelector('.pricing-price__range, .sr-only')?.textContent?.trim(),
            specifications: document.querySelector('.product-details, .specifications-tab')?.textContent?.trim()?.substring(0, 300),
            image: document.querySelector('.primary-image img, .product-image img')?.src
          }),
          
          'ebay.com': () => ({
            name: document.querySelector('.x-item-title-text, .it-ttl')?.textContent?.trim(),
            price: document.querySelector('.notranslate, .u-flL.condText')?.textContent?.trim(),
            specifications: document.querySelector('.product-details, .itemAttr')?.textContent?.trim()?.substring(0, 300),
            image: document.querySelector('#icImg, .imageContainer img')?.src
          }),
          
          'walmart.com': () => ({
            name: document.querySelector('[data-automation-id="product-title"], h1')?.textContent?.trim(),
            price: document.querySelector('[data-automation-id="product-price"], .price-current')?.textContent?.trim(),
            specifications: document.querySelector('.product-details, .specifications')?.textContent?.trim()?.substring(0, 300),
            image: document.querySelector('.prod-hero-image img, .product-image img')?.src
          })
        }

        // Get domain
        const domain = window.location.hostname.toLowerCase()
        
        // Try site-specific extractor first
        let result = null
        for (const [siteDomain, extractor] of Object.entries(extractors)) {
          if (domain.includes(siteDomain)) {
            result = extractor()
            break
          }
        }

        // If no site-specific extractor worked, try generic extraction
        if (!result || (!result.name && !result.price)) {
          // Generic extraction
          const genericName = 
            document.querySelector('h1')?.textContent?.trim() ||
            document.querySelector('[class*="title"], [class*="product-title"], [class*="name"]')?.textContent?.trim() ||
            document.querySelector('[id*="title"], [data-testid*="title"]')?.textContent?.trim()

          const genericPrice = 
            document.querySelector('[class*="price"], [id*="price"], [data-testid*="price"]')?.textContent?.trim() ||
            document.querySelector('.cost, .amount, [class*="cost"], [class*="amount"]')?.textContent?.trim()

          const genericSpecs = 
            document.querySelector('[class*="spec"], [class*="detail"], [class*="description"]')?.textContent?.trim()?.substring(0, 300) ||
            document.querySelector('[class*="feature"], .product-info')?.textContent?.trim()?.substring(0, 300)

          const genericImage = 
            document.querySelector('[class*="product-image"] img, [class*="main-image"] img')?.src ||
            document.querySelector('[class*="hero-image"] img, .product img')?.src

          result = {
            name: genericName,
            price: genericPrice, 
            specifications: genericSpecs,
            image: genericImage
          }
        }

        // Also try to get structured data (JSON-LD)
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]')
        if (jsonLdScript && (!result?.name || !result?.price)) {
          try {
            const jsonData = JSON.parse(jsonLdScript.textContent)
            if (jsonData['@type'] === 'Product' || jsonData.product) {
              const product = jsonData.product || jsonData
              result = result || {}
              result.name = result.name || product.name
              result.price = result.price || product.offers?.price || product.price
              result.specifications = result.specifications || product.description?.substring(0, 300)
              result.image = result.image || (Array.isArray(product.image) ? product.image[0] : product.image)
            }
          } catch (e) {
            console.warn('JSON-LD parsing failed:', e)
          }
        }

        // Clean up price - extract numeric value
        if (result?.price) {
          const priceMatch = result.price.match(/[\d,]+\.?\d*/);
          if (priceMatch) {
            result.price = parseFloat(priceMatch[0].replace(/,/g, ''))
          } else {
            result.price = null
          }
        }

        return result
      })

      await browser.close()

      // Validate extracted data
      if (!data || (!data.name && !data.price)) {
        return res.status(200).json({ 
          error: 'No product data found. Make sure you\'re using a product page URL.' 
        })
      }

      console.log('Extracted data:', data)
      return res.status(200).json(data)

    } catch (pageError) {
      await browser.close()
      console.error('Page error:', pageError)
      return res.status(500).json({ 
        error: 'Failed to load the webpage. The site might be blocking automated access.' 
      })
    }

  } catch (error) {
    console.error('Extraction error:', error)
    return res.status(500).json({ 
      error: 'Server error during extraction. Please try again.' 
    })
  }
}
