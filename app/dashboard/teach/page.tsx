'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function TeachPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<UnansweredQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/workspace?type=questions');
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleSaveAnswer = async () => {
    if (!selectedQuestion || !answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setSaving(true);
    try {
      // In production, this would:
      // 1. Save the answer to the workspace
      // 2. Update the integration-expert agent's knowledge
      // 3. Mark the question as answered
      // 4. Optionally notify the lead

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Remove question from list
      setQuestions(prev => prev.filter(q => q.id !== selectedQuestion.id));
      setSelectedQuestion(null);
      setAnswer('');

      alert('Answer saved successfully! The agent will now be able to answer this question.');
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = filter === 'all'
    ? questions
    : questions.filter(q => q.priority === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Teaching Interface</h1>
                <p className="text-sm text-gray-600 mt-1">Help the agent learn by answering unanswered questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {questions.length} questions waiting
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Unanswered Questions</h2>

              {/* Priority Filter */}
              <div className="flex space-x-2">
                {['all', 'high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilter(priority as any)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      filter === priority
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  onClick={() => setSelectedQuestion(question)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedQuestion?.id === question.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      question.priority === 'high' ? 'bg-red-100 text-red-800' :
                      question.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {question.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{question.question}</p>
                  {question.context && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{question.context}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(question.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No questions found</p>
                </div>
              )}
            </div>
          </div>

          {/* Answer Form */}
          <div className="lg:col-span-2">
            {selectedQuestion ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-gray-900 mb-2">
                        {selectedQuestion.question}
                      </h2>
                      {selectedQuestion.context && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                          <p className="text-sm text-blue-900">
                            <strong>Context:</strong> {selectedQuestion.context}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Category</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedQuestion.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Asked On</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(selectedQuestion.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide a comprehensive answer that the agent can use to help users in the future...

You can include:
• Step-by-step instructions
• Code examples
• Links to documentation
• Best practices
• Common pitfalls to avoid"
                  />

                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-900">
                      <strong>Tip:</strong> Write your answer as if you're teaching the agent. Be clear, comprehensive, and include examples where helpful.
                    </p>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleSaveAnswer}
                      disabled={saving || !answer.trim()}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Answer
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuestion(null);
                        setAnswer('');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Question</h3>
                <p className="text-gray-600">Choose a question from the list to provide an answer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
