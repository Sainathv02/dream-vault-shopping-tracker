'use client'

import { useState } from 'react'
import { Bug, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import { githubSync } from '@/lib/github-sync'

export function GitHubSyncDebug() {
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isDebugging, setIsDebugging] = useState(false)

  const runDiagnostics = async () => {
    setIsDebugging(true)
    let log = '=== GitHub Sync Diagnostics ===\n\n'
    
    try {
      // Check if configured
      log += `1. Configuration Status: ${githubSync.isConfigured() ? '✅ Configured' : '❌ Not Configured'}\n`
      
      const config = githubSync.getConfig()
      if (config) {
        log += `   - Username: ${config.username}\n`
        log += `   - Repository: ${config.repo}\n`
        log += `   - Token: ${config.token ? config.token.substring(0, 10) + '...' : 'Not set'}\n`
      }
      
      log += '\n2. Testing GitHub API Connection...\n'
      
      if (config?.token) {
        // Test basic API access
        try {
          const response = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${config.token}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Dream-Vault-Debug'
            }
          })
          
          log += `   - API Response Status: ${response.status} ${response.statusText}\n`
          
          if (response.ok) {
            const user = await response.json()
            log += `   - ✅ Connected as: ${user.login}\n`
            log += `   - Account Type: ${user.type}\n`
            
            // Check repository access
            log += '\n3. Testing Repository Access...\n'
            const repoResponse = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}`, {
              headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            })
            
            log += `   - Repository Status: ${repoResponse.status} ${repoResponse.statusText}\n`
            
            if (repoResponse.status === 404) {
              log += '   - ⚠️ Repository does not exist. Will be created on first sync.\n'
            } else if (repoResponse.ok) {
              const repo = await repoResponse.json()
              log += `   - ✅ Repository found: ${repo.full_name}\n`
              log += `   - Private: ${repo.private}\n`
            }
          } else {
            const errorText = await response.text()
            log += `   - ❌ API Error: ${errorText}\n`
          }
        } catch (error) {
          log += `   - ❌ Network Error: ${error}\n`
        }
      }
      
      // Check localStorage
      log += '\n4. LocalStorage Check...\n'
      const stored = localStorage.getItem('github-sync-config')
      log += `   - Config Stored: ${stored ? '✅ Yes' : '❌ No'}\n`
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          log += `   - Stored Username: ${parsed.username || 'Not set'}\n`
          log += `   - Stored Repo: ${parsed.repo || 'Not set'}\n`
          log += `   - Stored Token: ${parsed.token ? 'Yes (hidden)' : 'No'}\n`
        } catch {
          log += '   - ❌ Invalid stored config\n'
        }
      }
      
      // Check sync status
      log += '\n5. Sync Status...\n'
      try {
        const syncStatus = await githubSync.getSyncStatus()
        log += `   - Local Version: ${syncStatus.localVersion}\n`
        log += `   - Remote Version: ${syncStatus.remoteVersion || 'Unknown'}\n`
        log += `   - Needs Sync: ${syncStatus.needsSync ? 'Yes' : 'No'}\n`
        log += `   - Last Sync: ${syncStatus.lastSync || 'Never'}\n`
      } catch (error) {
        log += `   - ❌ Sync Status Error: ${error}\n`
      }
      
      log += '\n=== End Diagnostics ===\n'
      
    } catch (error) {
      log += `\n❌ Diagnostic Error: ${error}\n`
    }
    
    setDebugInfo(log)
    setIsDebugging(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(debugInfo)
  }

  return (
    <div className="mt-6 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Bug className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">GitHub Sync Debug</h3>
      </div>
      
      <button
        onClick={runDiagnostics}
        disabled={isDebugging}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-xl transition-colors mb-4"
      >
        {isDebugging ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>
      
      {debugInfo && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-medium">Debug Report</h4>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-1 text-gray-400 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <pre className="bg-gray-900 p-4 rounded-xl text-green-400 text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
            {debugInfo}
          </pre>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <h4 className="text-blue-400 font-medium mb-2">Quick Fixes</h4>
        <div className="text-gray-300 text-sm space-y-1">
          <p>• Make sure your GitHub token has <strong>repo</strong> scope</p>
          <p>• Check if your username is correct (case-sensitive)</p>
          <p>• Repository will be created automatically on first sync</p>
          <p>• Try refreshing the page if you just added the token</p>
        </div>
      </div>
    </div>
  )
}
