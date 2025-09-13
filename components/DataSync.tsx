'use client'

import { useState } from 'react'
import { Download, Upload, Cloud, Smartphone, X, Check, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import { DreamItem } from '@/lib/types'

interface DataSyncProps {
  isOpen: boolean
  onClose: () => void
  dreams: DreamItem[]
  onImportDreams: (dreams: DreamItem[]) => void
}

export function DataSync({ isOpen, onClose, dreams, onImportDreams }: DataSyncProps) {
  const [importData, setImportData] = useState('')
  const [showImportForm, setShowImportForm] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

  if (!isOpen) return null

  const exportData = () => {
    const exportObject = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      dreams: dreams,
      edcItems: JSON.parse(localStorage.getItem('edc-checklist') || '[]')
    }
    
    const dataStr = JSON.stringify(exportObject, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `dream-vault-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setSyncStatus('success')
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  const copyDataToClipboard = async () => {
    const exportObject = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      dreams: dreams,
      edcItems: JSON.parse(localStorage.getItem('edc-checklist') || '[]')
    }
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportObject, null, 2))
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (err) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const importFromClipboard = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText()
      setImportData(clipboardData)
      setShowImportForm(true)
    } catch (err) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const processImport = () => {
    try {
      const importObject = JSON.parse(importData)
      
      if (importObject.dreams && Array.isArray(importObject.dreams)) {
        onImportDreams(importObject.dreams)
        
        // Also import EDC items if they exist
        if (importObject.edcItems && Array.isArray(importObject.edcItems)) {
          localStorage.setItem('edc-checklist', JSON.stringify(importObject.edcItems))
        }
        
        setSyncStatus('success')
        setTimeout(() => {
          setSyncStatus('idle')
          setShowImportForm(false)
          setImportData('')
          onClose()
        }, 2000)
      } else {
        throw new Error('Invalid data format')
      }
    } catch (err) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportData(content)
        setShowImportForm(true)
      }
      reader.readAsText(file)
    }
  }

  const getStatusMessage = () => {
    switch (syncStatus) {
      case 'success': return '✅ Success!'
      case 'error': return '❌ Error occurred'
      default: return ''
    }
  }

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
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-xl opacity-40"></div>
          <div className="relative bg-gray-900/95 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-3xl p-8 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Data Sync</h2>
                  <p className="text-gray-400">Keep your vault synchronized across devices</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Status Message */}
            {syncStatus !== 'idle' && (
              <div className="mb-6 p-4 rounded-2xl bg-gray-800/50 text-center">
                <p className="text-white font-medium">{getStatusMessage()}</p>
              </div>
            )}

            {!showImportForm ? (
              <>
                {/* Export Options */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-400" />
                    Export Your Data
                  </h3>
                  
                  <div className="grid gap-3">
                    <button
                      onClick={exportData}
                      className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-blue-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">Download Backup File</div>
                          <div className="text-gray-400 text-sm">Save as JSON file to device</div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">→</div>
                    </button>

                    <button
                      onClick={copyDataToClipboard}
                      className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Copy className="w-5 h-5 text-blue-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">Copy to Clipboard</div>
                          <div className="text-gray-400 text-sm">Copy data for manual transfer</div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">→</div>
                    </button>
                  </div>
                </div>

                {/* Import Options */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    Import Data
                  </h3>
                  
                  <div className="grid gap-3">
                    <label className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200 group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">Upload Backup File</div>
                          <div className="text-gray-400 text-sm">Select JSON backup file</div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">→</div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={importFromClipboard}
                      className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">Paste from Clipboard</div>
                          <div className="text-gray-400 text-sm">Import copied data</div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">→</div>
                    </button>
                  </div>
                </div>

                {/* Sync Instructions */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    How to Sync Between Devices
                  </h4>
                  <ol className="text-gray-300 space-y-2 text-sm">
                    <li><strong>1.</strong> Export data from your current device</li>
                    <li><strong>2.</strong> Send the file or copied data to your other device</li>
                    <li><strong>3.</strong> Import the data on your target device</li>
                    <li><strong>4.</strong> Your vault will be perfectly synchronized!</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-xl">
                    <p className="text-blue-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Pro Tip:</strong> Use cloud storage (Google Drive, iCloud, etc.) or messaging apps to transfer files between devices easily!
                      </span>
                    </p>
                  </div>
                </div>
              <>) : (
                /* Import Form */
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Import Data</h3>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                      Paste your exported data:
                    </label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste your JSON backup data here..."
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={processImport}
                      disabled={!importData.trim() || syncStatus === 'success'}
                      className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {syncStatus === 'success' ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      {syncStatus === 'success' ? 'Imported!' : 'Import Data'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowImportForm(false)
                        setImportData('')
                        setSyncStatus('idle')
                      }}
                      className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
