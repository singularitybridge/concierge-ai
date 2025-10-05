import { Mic, Phone, MessageSquare, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">AI Voice Chat</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gray-900">
              Talk to Your AI Agent
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Click the phone button in the bottom right corner to start a voice conversation with your AI assistant
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <FeatureCard
              icon={<Mic className="w-8 h-8" />}
              title="Voice Input"
              description="Speak naturally to your AI agent"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Real-time"
              description="Get instant responses"
            />
            <FeatureCard
              icon={<Phone className="w-8 h-8" />}
              title="Phone Support"
              description="Call from any phone"
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="Multi-platform"
              description="WhatsApp, Slack & more"
            />
          </div>

          {/* Status */}
          <div className="mt-16 p-6 bg-gray-50 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <ol className="text-left space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                <span>Get your VAPI account at <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vapi.ai</a></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                <span>Add your API keys to <code className="bg-gray-200 px-2 py-1 rounded text-sm">.env.local</code></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                <span>Configure your AI agent API endpoint</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                <span>Click the phone button to start talking!</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
