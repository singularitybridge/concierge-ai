import WorkspaceFileViewer from './components/WorkspaceFileViewer';
import VoiceSessionChat from './components/VoiceSessionChat';
import { Sparkles } from 'lucide-react';

const AGENT_NAME = 'john';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white flex-shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Session Manager</h1>
              <p className="text-sm text-gray-600">Voice-powered workspace for AI-generated apps & documents</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: Workspace File Viewer (3/4) */}
        <div className="flex-[3] min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
            <WorkspaceFileViewer agentId={AGENT_NAME} agentName={AGENT_NAME} sessionId="default" />
          </div>
        </div>

        {/* Right: Voice Session Chat (1/4) */}
        <div className="flex-[1] min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
            <VoiceSessionChat agentId={AGENT_NAME} sessionId="default" />
          </div>
        </div>
      </div>
    </div>
  );
}
