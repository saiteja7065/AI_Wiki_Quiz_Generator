import { useState } from 'react';
import GenerateQuizTab from './tabs/GenerateQuizTab';
import HistoryTab from './tabs/HistoryTab';

function App() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AI Quiz Generator
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Generate Quiz
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'generate' ? <GenerateQuizTab /> : <HistoryTab />}
        </div>
      </div>
    </div>
  );
}

export default App;
