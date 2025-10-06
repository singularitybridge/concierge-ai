'use client';

import { useState, useEffect } from 'react';
import { File, FileCode, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface WorkspaceFileViewerProps {
  agentId: string;
  agentName?: string;
  sessionId?: string;
}

export default function WorkspaceFileViewer({ agentId, agentName = '', sessionId = 'default' }: WorkspaceFileViewerProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create base64 encoded documentId (agentId:path)
  const createDocumentId = (path: string) => {
    const plainText = `${agentId}:${path}`;
    return btoa(plainText);
  };

  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_AGENT_HUB_API_KEY || '';

  // Fetch workspace files list
  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/workspace-files?agentId=${agentId}&sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        if (data.files && data.files.length > 0 && !selectedFile) {
          setSelectedFile(data.files[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFiles();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [agentId, sessionId, selectedFile]);

  const getFileIcon = (path: string) => {
    if (path.endsWith('.html')) return <FileCode className="w-4 h-4" />;
    if (path.endsWith('.md')) return <FileText className="w-4 h-4" />;
    if (path.match(/\.(jpg|png|gif|svg)$/)) return <ImageIcon className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{agentName || 'Agent'}&apos;s Workspace</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-600 font-medium px-2 py-1 bg-indigo-50 rounded">{agentName || 'Loading...'}</span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh workspace"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* File address */}
        {selectedFile && (
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200">
            {getFileIcon(selectedFile)}
            <span className="font-mono">{selectedFile}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {selectedFile ? (
          <iframe
            src={`http://localhost:5173/embed/workspace/${createDocumentId(selectedFile)}?apiKey=${apiKey}`}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-same-origin"
            title={`${agentName} - ${selectedFile}`}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Select a file to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
