'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Settings, Send, Loader2, Zap, AlertCircle } from 'lucide-react';

interface VapiConfig {
  assistantId: string;
  assistantName: string;
  firstMessage: string;
  toolUrl: string | null;
  serverMessages: string[];
  toolName?: string;
  toolTimeout?: number;
  tools?: any[];
  fullToolConfig?: any;
}

interface NgrokStatus {
  running: boolean;
  url: string | null;
  port: number;
}

export default function VapiConfigPage() {
  const [config, setConfig] = useState<VapiConfig | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Ngrok state
  const [ngrokStatus, setNgrokStatus] = useState<NgrokStatus | null>(null);
  const [checkingNgrok, setCheckingNgrok] = useState(false);
  const [startingNgrok, setStartingNgrok] = useState(false);

  // Testing state
  const [testMessage, setTestMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // Prompt state
  const [prompt, setPrompt] = useState<string>('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // First message and tool config state
  const [firstMessage, setFirstMessage] = useState<string>('');
  const [toolConfig, setToolConfig] = useState<string>('');
  const [showToolConfig, setShowToolConfig] = useState(false);

  // Check ngrok status
  const checkNgrok = async () => {
    setCheckingNgrok(true);
    try {
      const response = await fetch('/api/ngrok');
      const data = await response.json();

      if (data.success) {
        setNgrokStatus({
          running: data.running,
          url: data.url,
          port: data.port
        });

        // Auto-populate base URL if ngrok is running
        if (data.url && !baseUrl) {
          setBaseUrl(data.url);
        }
      }
    } catch (error) {
      console.error('Error checking ngrok:', error);
    } finally {
      setCheckingNgrok(false);
    }
  };

  // Start ngrok and auto-configure
  const autoConfigureWithNgrok = async () => {
    setStartingNgrok(true);
    setMessage(null);

    try {
      // Start/check ngrok
      const ngrokResponse = await fetch('/api/ngrok', { method: 'POST' });
      const ngrokData = await ngrokResponse.json();

      if (!ngrokData.success || !ngrokData.url) {
        setMessage({
          type: 'error',
          text: ngrokData.error || 'Failed to start ngrok'
        });
        return;
      }

      setNgrokStatus({
        running: true,
        url: ngrokData.url,
        port: 4024
      });

      // Update base URL
      setBaseUrl(ngrokData.url);

      setMessage({
        type: 'info',
        text: `Ngrok started at ${ngrokData.url}. Click "Update VAPI Configuration" to apply.`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to configure ngrok'
      });
    } finally {
      setStartingNgrok(false);
    }
  };

  // Load current configuration
  const loadConfig = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/vapi-config');
      const data = await response.json();

      if (data.success) {
        setConfig(data.config);

        // Extract base URL from tool URL
        if (data.config.toolUrl) {
          const match = data.config.toolUrl.match(/^(https?:\/\/[^\/]+)/);
          if (match) {
            setBaseUrl(match[1]);
          }
        }

        // Set first message
        setFirstMessage(data.config.firstMessage || '');

        // Set tool config as formatted JSON
        if (data.config.fullToolConfig) {
          setToolConfig(JSON.stringify(data.config.fullToolConfig, null, 2));
        }

        // Load prompt
        loadPrompt(data.config.assistantId);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  // Load assistant prompt
  const loadPrompt = async (assistantId: string) => {
    setLoadingPrompt(true);
    try {
      const response = await fetch(`/api/vapi-prompt?assistantId=${assistantId}`);
      const data = await response.json();

      if (response.ok && data.prompt) {
        setPrompt(data.prompt);
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Update configuration
  const updateConfig = async () => {
    if (!baseUrl && !firstMessage && !toolConfig) {
      setMessage({ type: 'error', text: 'Please enter at least one field to update' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      // Parse tool config if provided
      let parsedToolConfig = null;
      if (toolConfig) {
        try {
          parsedToolConfig = JSON.parse(toolConfig);
        } catch (e) {
          setMessage({ type: 'error', text: 'Invalid JSON in tool configuration' });
          setUpdating(false);
          return;
        }
      }

      const payload: any = {};
      if (baseUrl) payload.baseUrl = baseUrl;
      if (firstMessage !== config?.firstMessage) payload.firstMessage = firstMessage;
      if (parsedToolConfig) payload.toolConfig = parsedToolConfig;

      const response = await fetch('/api/vapi-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Configuration updated successfully!' });
        await loadConfig(); // Reload to show updated values
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setUpdating(false);
    }
  };

  // Test VAPI with a message
  const testVapi = async () => {
    if (!testMessage) {
      setMessage({ type: 'error', text: 'Please enter a test message' });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const requestBody: { userInput: string; previousChatId?: string } = {
        userInput: testMessage
      };

      if (chatId) {
        requestBody.previousChatId = chatId;
      }

      const response = await fetch('/api/test-vapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      let assistantResponse = '';
      if (data.content && Array.isArray(data.content) && data.content[0]?.text?.value) {
        assistantResponse = data.content[0].text.value;
      } else {
        assistantResponse = JSON.stringify(data, null, 2);
      }

      // Store chat ID for session persistence
      if (data.chatId) {
        setChatId(data.chatId);
      }

      // Add to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: testMessage },
        { role: 'assistant', content: assistantResponse }
      ]);

      // Clear test message input
      setTestMessage('');
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: testMessage },
        { role: 'assistant', content: errorMessage }
      ]);
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setTesting(false);
    }
  };

  // Clear session and conversation history
  const clearSession = () => {
    setChatId(null);
    setConversationHistory([]);
    setMessage({ type: 'success', text: 'Session cleared' });
  };

  useEffect(() => {
    loadConfig();
    checkNgrok();
  }, []);

  const previewToolUrl = baseUrl ? `${baseUrl}/api/assistant/integration-expert/execute` : '';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">VAPI Configuration</h1>
          <p className="text-gray-600 mt-1">Manage your VAPI assistant and tool endpoints</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`rounded-lg p-4 flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'info' ? 'bg-blue-50 border border-blue-200' :
            'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : message.type === 'info' ? (
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <span className={
              message.type === 'success' ? 'text-green-900' :
              message.type === 'info' ? 'text-blue-900' :
              'text-red-900'
            }>
              {message.text}
            </span>
          </div>
        )}

        {/* Unified Configuration Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </h2>
            <button
              onClick={loadConfig}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Config Display */}
              {config && (
                <div className="space-y-4 pb-6 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assistant Name</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{config.assistantName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assistant ID</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-600 text-sm font-mono">{config.assistantId}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Tool URL</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-600 text-sm font-mono break-all">
                      {config.toolUrl || <span className="text-red-600">Not configured</span>}
                    </div>
                  </div>

                  {/* Enabled Tools */}
                  {config.tools && config.tools.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enabled Tools</label>
                      <div className="space-y-2">
                        {config.tools.map((tool: any, idx: number) => (
                          <div key={idx} className="px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-900">
                                {tool.function?.name || 'Unnamed Tool'}
                              </span>
                              <span className="text-xs text-blue-700 px-2 py-1 bg-blue-100 rounded">
                                {tool.type || 'function'}
                              </span>
                            </div>
                            {tool.function?.description && (
                              <p className="text-xs text-blue-700 mt-1">{tool.function.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* First Message */}
              <div className="space-y-2 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700">
                  First Message
                  <span className="ml-2 text-xs text-gray-500">(What the assistant says when starting a call)</span>
                </label>
                <textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Tool Configuration */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Tool Configuration
                    <span className="ml-2 text-xs text-gray-500">(query_integration_expert tool settings)</span>
                  </label>
                  <button
                    onClick={() => setShowToolConfig(!showToolConfig)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showToolConfig ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showToolConfig && (
                  <textarea
                    value={toolConfig}
                    onChange={(e) => setToolConfig(e.target.value)}
                    placeholder="Paste tool configuration JSON here..."
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-mono"
                  />
                )}
              </div>

              {/* Base URL Configuration */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700">Base URL</label>

                {/* URL Input with buttons */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://your-url.ngrok-free.app"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={autoConfigureWithNgrok}
                    disabled={startingNgrok}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    title="Auto-configure with Ngrok"
                  >
                    {startingNgrok ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={updateConfig}
                    disabled={updating || (!baseUrl && !firstMessage && !toolConfig)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Publish'
                    )}
                  </button>
                </div>

                {/* Status */}
                {ngrokStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        ngrokStatus.running ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className={ngrokStatus.running ? 'text-green-700' : 'text-gray-500'}>
                        {ngrokStatus.running ? 'Running' : 'Not running'}
                      </span>
                    </div>
                    {ngrokStatus.running && ngrokStatus.url && (
                      <span className="text-gray-600 font-mono text-xs ml-2">{ngrokStatus.url}</span>
                    )}
                  </div>
                )}

                {/* Preview */}
                {baseUrl && (
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 min-w-[60px]">Preview:</span>
                      <div className="space-y-0.5 font-mono break-all">
                        <div>Tool: {previewToolUrl}</div>
                        <div>Webhook: {baseUrl}/api/vapi-webhook</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assistant Prompt */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Assistant Prompt</h2>
          </div>

          {loadingPrompt ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : prompt ? (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{prompt}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No prompt loaded</div>
          )}
        </div>

        {/* Test VAPI */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Test VAPI Assistant
            </h2>
            {conversationHistory.length > 0 && (
              <button
                onClick={clearSession}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
              >
                Clear Session
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                <div className="space-y-3">
                  {conversationHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTestMessage('What integrations are available?')}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
              >
                List Integrations
              </button>
              <button
                onClick={() => setTestMessage('How do I create a JIRA ticket?')}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
              >
                JIRA Question
              </button>
              <button
                onClick={() => setTestMessage('Can you integrate with Salesforce?')}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
              >
                Unknown Integration
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Message</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    testVapi();
                  }
                }}
                placeholder="Type your test message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={testVapi}
              disabled={testing || !testMessage}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Test Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
