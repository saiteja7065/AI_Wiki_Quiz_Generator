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
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          <span className="font-semibold">Error:</span> {error}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quiz History</h2>
          
          {history.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No quiz history yet. Generate your first quiz!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">URL</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Generated At</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id || item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                        {String(item.id || item._id).slice(-8)}
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{item.title}</td>
                      <td className="py-3 px-4">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block max-w-xs text-sm"
                        >
                          {item.url}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(item.date_generated || item.createdAt)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewQuiz(item)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                          Details
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Quiz Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {loadingQuizDetails ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="mt-4 text-lg font-medium text-gray-700">Loading quiz details...</p>
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
