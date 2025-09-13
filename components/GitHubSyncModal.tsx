'use client'

import { useState, useEffect } from 'react'
import { X, Github, Settings, CheckCircle, AlertCircle, RefreshCw, Cloud, Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import { githubSync } from '@/lib/github-sync'

interface GitHubSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onSync?: () => void
}

export function GitHubSyncModal({ isOpen, onClose, onSync }: GitHubSyncModalProps) {
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [repo, setRepo] = useState('dream-vault-data')
  const [isConfigured, setIsConfigured] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    user?: any
    error?: string
  } | null>(null)
  const [syncStatus, setSyncStatus] = useState<{
    lastSync?: string
    remoteVersion?: number
    localVersion: number
    needsSync: boolean
  } | null>(null)

  // Load configuration on mount
  useEffect(() => {
    if (isOpen) {
      const config = githubSync.getConfig()
      if (config) {
        setToken(config.token)
        setUsername(config.username)
        setRepo(config.repo)
        setIsConfigured(true)
        loadSyncStatus()
      } else {
        setIsConfigured(false)
      }
    }
  }, [isOpen])

  const loadSyncStatus = async () => {
    if (githubSync.isConfigured()) {
      try {
        const status = await githubSync.getSyncStatus()
        setSyncStatus(status)
      } catch (error) {
        console.error('Failed to get sync status:', error)
      }
    }
  }

  const testConnection = async () => {
    if (!token.trim()) {
      setConnectionStatus({ success: false, error: 'Please enter a GitHub token' })
      return
    }

    setIsConnecting(true)
    setConnectionStatus(null)

    try {
      // Save config temporarily for testing
      githubSync.saveConfig({
        token: token.trim(),
        username: username.trim() || '',
        repo: repo.trim() || 'dream-vault-data'
      })

      const result = await githubSync.testConnection()
      setConnectionStatus(result)

      if (result.success && result.user) {
        setUsername(result.user.login)
        setIsConfigured(true)
      }
    } catch (error) {
      setConnectionStatus({ success: false, error: (error as Error).message })
    } finally {
      setIsConnecting(false)
    }
  }

  const saveConfiguration = async () => {
    if (!token.trim() || !username.trim()) {
      setConnectionStatus({ success: false, error: 'Token and username are required' })
      return
    }

    try {
      const config = {
        token: token.trim(),
        username: username.trim(),
        repo: repo.trim() || 'dream-vault-data'
      }

      githubSync.saveConfig(config)

      // Create repository if it doesn't exist
      try {
        await githubSync.createRepository(config.repo, 'Dream Vault - Personal Shopping Tracker Data')
      } catch (error) {
        console.warn('Repository creation warning:', error)
      }

      setIsConfigured(true)
      await loadSyncStatus()
      
      setConnectionStatus({ 
        success: true, 
        user: { login: username },
        error: undefined 
      })
    } catch (error) {
      setConnectionStatus({ success: false, error: (error as Error).message })
    }
  }

  const clearConfiguration = () => {
    githubSync.clearConfig()
    setToken('')
    setUsername('')
    setRepo('dream-vault-data')
    setIsConfigured(false)
    setConnectionStatus(null)
    setSyncStatus(null)
  }

  const handleSync = async () => {
    if (onSync) {
      onSync()
      await loadSyncStatus()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-blue-600 to-teal-600 rounded-3xl blur-xl opacity-40"></div>
          <div className="relative bg-gray-900/95 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">GitHub Sync</h2>
                  <p className="text-gray-400">Sync your data across all devices for free</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!isConfigured ? (
              <>
                {/* Setup Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    One-time Setup Required
                  </h3>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <p><strong>Step 1:</strong> Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</a></p>
                    <p><strong>Step 2:</strong> Click "Generate new token (classic)"</p>
                    <p><strong>Step 3:</strong> Select scopes: <code className="bg-gray-800 px-1 rounded">repo</code> (for private repos) or <code className="bg-gray-800 px-1 rounded">public_repo</code> (for public repos)</p>
                    <p><strong>Step 4:</strong> Copy the token and paste it below</p>
                  </div>
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      GitHub Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="dream-vault-data"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">A new private repository will be created if it doesn't exist</p>
                  </div>

                  {/* Test Connection */}
                  <div className="flex gap-3">
                    <button
                      onClick={testConnection}
                      disabled={isConnecting || !token.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4" />
                          Test Connection
                        </>
                      )}
                    </button>

                    {connectionStatus?.success && (
                      <button
                        onClick={saveConfiguration}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Save Configuration
                      </button>
                    )}
                  </div>

                  {/* Connection Status */}
                  {connectionStatus && (
                    <div className={cn(
                      "p-4 rounded-xl border",
                      connectionStatus.success
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    )}>
                      <div className="flex items-center gap-2">
                        {connectionStatus.success ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">
                          {connectionStatus.success 
                            ? `Connected as ${connectionStatus.user?.login || username}` 
                            : connectionStatus.error
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Configured State */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="text-lg font-bold text-green-400">GitHub Sync Configured</h3>
                      <p className="text-gray-300 text-sm">Connected as @{username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Repository:</span>
                      <p className="text-white font-medium">{username}/{repo}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className="text-green-400 font-medium">✓ Active</p>
                    </div>
                  </div>
                </div>

                {/* Sync Status */}
                {syncStatus && (
                  <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Cloud className="w-5 h-5" />
                      Sync Status
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Local Version:</span>
                        <p className="text-white font-medium">v{syncStatus.localVersion}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Remote Version:</span>
                        <p className="text-white font-medium">v{syncStatus.remoteVersion || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Sync:</span>
                        <p className="text-white font-medium">
                          {syncStatus.lastSync 
                            ? new Date(syncStatus.lastSync).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Sync Needed:</span>
                        <p className={cn(
                          "font-medium",
                          syncStatus.needsSync ? "text-yellow-400" : "text-green-400"
                        )}>
                          {syncStatus.needsSync ? '⚠ Yes' : '✓ Up to date'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSync}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Sync Now
                  </button>
                  
                  <button
                    onClick={clearConfiguration}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>

                {/* Repository Link */}
                <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
                  <p className="text-gray-400 text-sm mb-2">Your data is stored in:</p>
                  <a
                    href={`https://github.com/${username}/${repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    github.com/{username}/{repo}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
