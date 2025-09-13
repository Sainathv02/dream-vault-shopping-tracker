interface GitHubSyncConfig {
  token: string
  username: string
  repo: string
  branch?: string
}

interface SyncData {
  dreams: any[]
  edcItems: any[]
  lastSync: string
  version: number
}

export class GitHubSyncService {
  private config: GitHubSyncConfig | null = null
  private readonly fileName = 'dream-vault-data.json'

  constructor() {
    this.loadConfig()
  }

  // Load configuration from localStorage
  private loadConfig(): void {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('github-sync-config')
      if (stored) {
        this.config = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load GitHub config:', error)
      this.config = null
    }
  }

  // Save configuration to localStorage
  public saveConfig(config: GitHubSyncConfig): void {
    this.config = config
    if (typeof window !== 'undefined') {
      localStorage.setItem('github-sync-config', JSON.stringify(config))
    }
  }

  // Check if sync is configured
  public isConfigured(): boolean {
    return !!(this.config?.token && this.config?.username && this.config?.repo)
  }

  // Get current configuration
  public getConfig(): GitHubSyncConfig | null {
    return this.config
  }

  // Clear configuration
  public clearConfig(): void {
    this.config = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('github-sync-config')
    }
  }

  // Create repository if it doesn't exist
  public async createRepository(repoName: string, description: string = 'Dream Vault Data Storage'): Promise<void> {
    if (!this.config?.token) {
      throw new Error('GitHub token not configured')
    }

    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: true,
        auto_init: true
      })
    })

    if (!response.ok) {
      if (response.status === 422) {
        // Repository already exists
        return
      }
      const error = await response.json()
      throw new Error(`Failed to create repository: ${error.message}`)
    }
  }

  // Check if file exists
  private async fileExists(): Promise<{ exists: boolean; sha?: string }> {
    if (!this.isConfigured()) {
      throw new Error('GitHub sync not configured')
    }

    const { username, repo, branch = 'main' } = this.config!
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${this.fileName}?ref=${branch}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config!.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        return { exists: true, sha: data.sha }
      }
      
      return { exists: false }
    } catch (error) {
      console.error('Error checking file existence:', error)
      return { exists: false }
    }
  }

  // Upload data to GitHub
  public async uploadData(data: SyncData): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('GitHub sync not configured')
    }

    const { username, repo, branch = 'main' } = this.config!
    const { exists, sha } = await this.fileExists()

    // Add metadata
    const syncData: SyncData = {
      ...data,
      lastSync: new Date().toISOString(),
      version: (data.version || 0) + 1
    }

    const content = btoa(JSON.stringify(syncData, null, 2))
    const message = `Update Dream Vault data - ${new Date().toLocaleDateString()}`

    const body: any = {
      message,
      content,
      branch
    }

    if (exists && sha) {
      body.sha = sha
    }

    const response = await fetch(
      `https://api.github.com/repos/${username}/${repo}/contents/${this.fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config!.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to upload data: ${error.message}`)
    }
  }

  // Download data from GitHub
  public async downloadData(): Promise<SyncData | null> {
    if (!this.isConfigured()) {
      throw new Error('GitHub sync not configured')
    }

    const { username, repo, branch = 'main' } = this.config!

    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${this.fileName}?ref=${branch}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config!.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null // File doesn't exist yet
        }
        const error = await response.json()
        throw new Error(`Failed to download data: ${error.message}`)
      }

      const fileData = await response.json()
      const content = atob(fileData.content)
      return JSON.parse(content)
    } catch (error) {
      console.error('Error downloading data:', error)
      throw error
    }
  }

  // Sync local data with GitHub (smart merge)
  public async syncData(localDreams: any[], localEdcItems: any[]): Promise<{ dreams: any[], edcItems: any[] }> {
    try {
      // Download remote data
      const remoteData = await this.downloadData()
      
      if (!remoteData) {
        // No remote data, upload local data
        await this.uploadData({
          dreams: localDreams,
          edcItems: localEdcItems,
          lastSync: new Date().toISOString(),
          version: 1
        })
        return { dreams: localDreams, edcItems: localEdcItems }
      }

      // Compare versions and merge
      const localVersion = parseInt(localStorage.getItem('data-version') || '0')
      const remoteVersion = remoteData.version || 0

      if (remoteVersion > localVersion) {
        // Remote is newer, use remote data
        localStorage.setItem('data-version', remoteVersion.toString())
        return { dreams: remoteData.dreams, edcItems: remoteData.edcItems }
      } else if (localVersion > remoteVersion) {
        // Local is newer, upload local data
        await this.uploadData({
          dreams: localDreams,
          edcItems: localEdcItems,
          lastSync: new Date().toISOString(),
          version: localVersion + 1
        })
        return { dreams: localDreams, edcItems: localEdcItems }
      } else {
        // Same version, merge by timestamp
        const mergedDreams = this.mergeArraysByTimestamp(localDreams, remoteData.dreams)
        const mergedEdcItems = this.mergeArraysByTimestamp(localEdcItems, remoteData.edcItems)
        
        // Upload merged data
        await this.uploadData({
          dreams: mergedDreams,
          edcItems: mergedEdcItems,
          lastSync: new Date().toISOString(),
          version: Math.max(localVersion, remoteVersion) + 1
        })
        
        return { dreams: mergedDreams, edcItems: mergedEdcItems }
      }
    } catch (error) {
      console.error('Sync failed:', error)
      throw error
    }
  }

  // Merge arrays by timestamp (newer wins, unique by ID)
  private mergeArraysByTimestamp(localItems: any[], remoteItems: any[]): any[] {
    const merged = new Map()

    // Add all remote items first
    remoteItems.forEach(item => {
      if (item.id) {
        merged.set(item.id, item)
      }
    })

    // Add local items, overwriting if they're newer
    localItems.forEach(item => {
      if (item.id) {
        const existing = merged.get(item.id)
        if (!existing || (item.updatedAt && (!existing.updatedAt || item.updatedAt > existing.updatedAt))) {
          merged.set(item.id, item)
        }
      }
    })

    return Array.from(merged.values())
  }

  // Test GitHub connection
  public async testConnection(): Promise<{ success: boolean; user?: any; error?: string }> {
    if (!this.config?.token) {
      return { success: false, error: 'No token configured' }
    }

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.message }
      }

      const user = await response.json()
      return { success: true, user }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get sync status
  public async getSyncStatus(): Promise<{ 
    lastSync?: string
    remoteVersion?: number
    localVersion: number
    needsSync: boolean 
  }> {
    const localVersion = typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('data-version') || '0')
      : 0
    
    try {
      const remoteData = await this.downloadData()
      const remoteVersion = remoteData?.version || 0
      const lastSync = remoteData?.lastSync
      
      return {
        lastSync,
        remoteVersion,
        localVersion,
        needsSync: localVersion !== remoteVersion
      }
    } catch (error) {
      return {
        localVersion,
        needsSync: true
      }
    }
  }
}

// Export singleton instance
export const githubSync = new GitHubSyncService()
