'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, HelpCircle, Phone, TrendingUp, Clock, Search, Activity } from 'lucide-react';

// Types
interface Lead {
  id: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  lastContact?: string;
  sessions?: string[];
  interests?: string[];
  notes?: string;
}

interface Session {
  id: string;
  leadId: string;
  title: string;
  content: string;
  timestamp: string;
}

interface UnansweredQuestion {
  id: string;
  leadId?: string;
  question: string;
  context?: string;
  timestamp: string;
  category?: string;
  priority?: string;
  status?: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from workspace
  useEffect(() => {
    loadData();
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // In production, this would call the Agent Hub API or MCP to load workspace data
      // For now, we'll use mock data that matches the workspace structure

      // Mock data that simulates workspace files
      const mockLeads: Lead[] = [
        {
          id: 'lead_example_123',
          phoneNumber: '+1234567890',
          firstName: 'Example',
          lastName: 'Lead',
          company: 'Demo Company',
          role: 'CTO',
          status: 'new',
          createdAt: '2025-10-10T12:00:00Z',
          lastContact: '2025-10-10T14:30:00Z',
          sessions: ['session_example_1'],
          interests: ['JIRA', 'SendGrid'],
          notes: 'Interested in integration capabilities'
        }
      ];

      const mockSessions: Session[] = [
        {
          id: 'session_example_1',
          leadId: 'lead_example_123',
          title: 'Initial Consultation - JIRA Integration',
          content: '# Initial Consultation\n\n**Date:** 2025-10-10\n\n## Discussion Points\n- Asked about JIRA integration capabilities\n- Interested in automated ticket creation\n- Wants to see code examples\n\n## Actions Taken\n- Provided overview of JIRA integration\n- Shared documentation links\n- Scheduled follow-up\n\n## Next Steps\n- Send implementation guide\n- Schedule technical demo',
          timestamp: '2025-10-10T14:30:00Z'
        }
      ];

      const mockQuestions: UnansweredQuestion[] = [
        {
          id: 'question_example_1',
          leadId: 'lead_example_123',
          question: 'How do I integrate with Salesforce CRM?',
          context: 'Customer asked about CRM integration options during initial call',
          timestamp: '2025-10-10T14:35:00Z',
          category: 'integration',
          priority: 'high',
          status: 'pending'
        }
      ];

      setLeads(mockLeads);
      setSessions(mockSessions);
      setQuestions(mockQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(searchLower) ||
      lead.lastName?.toLowerCase().includes(searchLower) ||
      lead.company?.toLowerCase().includes(searchLower) ||
      lead.phoneNumber?.includes(searchTerm)
    );
  });

  const selectedSessions = selectedLead
    ? sessions.filter(s => s.leadId === selectedLead.id)
    : sessions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">AI Agent Hub Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">VAPI Lead Generation & CRM System</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="http://localhost:3000/workspace/integration-expert/sessions/active-vapi-sessions.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium inline-flex items-center"
              >
                <Activity className="w-4 h-4 mr-2" />
                Active VAPI Sessions
              </a>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{leads.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{sessions.length}</p>
              </div>
              <Phone className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <a
            href="http://localhost:3000/workspace/integration-expert/sessions/active-vapi-sessions.html"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active VAPI</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">Live</p>
              </div>
              <Activity className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
          </a>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Questions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{questions.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">85%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Leads</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedLead?.id === lead.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{lead.company}</p>
                      <p className="text-xs text-gray-500 mt-1">{lead.phoneNumber}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'new' ? 'bg-green-100 text-green-800' :
                      lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  {lead.interests && lead.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {lead.interests.map((interest, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sessions & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sessions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedLead ? `Sessions - ${selectedLead.firstName} ${selectedLead.lastName}` : 'All Sessions'}
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                {selectedSessions.map((session) => (
                  <div key={session.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{session.title}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(session.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{session.content}</p>
                  </div>
                ))}
                {selectedSessions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No sessions found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Unanswered Questions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Unanswered Questions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {questions.map((question) => (
                  <div key={question.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{question.question}</p>
                        {question.context && (
                          <p className="mt-1 text-xs text-gray-600">{question.context}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            question.priority === 'high' ? 'bg-red-100 text-red-800' :
                            question.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {question.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(question.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
                        Answer
                      </button>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No unanswered questions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
