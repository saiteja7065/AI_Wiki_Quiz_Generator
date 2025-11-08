import { useState, useEffect } from 'react';
import QuizDisplay from './QuizDisplay';
import apiService from '../services/api';

function HistoryTable() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingQuizDetails, setLoadingQuizDetails] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiService.getHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = async (historyItem) => {
    setIsModalOpen(true);
    setLoadingQuizDetails(true);
    setSelectedQuiz(null);

    try {
      const quizId = historyItem.id || historyItem._id;
      const quizData = await apiService.getQuizById(quizId);
      setSelectedQuiz(quizData);
    } catch (err) {
      setError(err.message);
      setIsModalOpen(false);
    } finally {
      setLoadingQuizDetails(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="inline-block relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-900 border-t-primary-400 shadow-glow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-xl font-semibold text-gray-200">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card border-neon-pink/50 p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-neon-pink mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-neon-pink font-semibold">Error</p>
            <p className="text-gray-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 gradient-text">Quiz History</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-lg">No quiz history yet</p>
              <p className="text-gray-500 text-sm mt-2">Generate your first quiz to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary-500/30">
                    <th className="text-left py-4 px-4 font-semibold text-gray-300 uppercase text-sm tracking-wide">ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-300 uppercase text-sm tracking-wide">Title</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-300 uppercase text-sm tracking-wide">URL</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-300 uppercase text-sm tracking-wide">Generated At</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-300 uppercase text-sm tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id || item._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-gray-400 font-mono text-sm">
                        #{String(item.id || item._id).slice(-6)}
                      </td>
                      <td className="py-4 px-4 text-gray-200 font-medium">{item.title}</td>
                      <td className="py-4 px-4">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 truncate block max-w-xs text-sm transition-colors inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Wikipedia
                        </a>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(item.date_generated || item.createdAt)}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleViewQuiz(item)}
                          className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-2 rounded-lg hover:shadow-glow transition-all text-sm font-semibold"
                        >
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing quiz */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 glass-card border-b border-white/10 px-8 py-5 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold gradient-text">Quiz Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8">
              {loadingQuizDetails ? (
                <div className="text-center py-16">
                  <div className="inline-block relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-900 border-t-primary-400 shadow-glow"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="mt-6 text-xl font-semibold text-gray-200">Loading quiz details...</p>
                </div>
              ) : selectedQuiz ? (
                <QuizDisplay quiz={selectedQuiz} viewMode={true} />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HistoryTable;
