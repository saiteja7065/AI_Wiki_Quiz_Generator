import { useState } from 'react';
import QuizDisplay from '../components/QuizDisplay';
import apiService from '../services/api';

function GenerateQuizTab() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateWikipediaUrl = (url) => {
    if (!url || url.trim() === '') {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      const urlObj = new URL(url);
      const isWikipedia = urlObj.hostname.includes('wikipedia.org');
      
      if (!isWikipedia) {
        return {
          isValid: false,
          error: 'Please enter a valid Wikipedia URL (e.g., https://en.wikipedia.org/wiki/...)',
        };
      }

      if (!urlObj.pathname.includes('/wiki/')) {
        return {
          isValid: false,
          error: 'Please enter a Wikipedia article URL (must contain /wiki/)',
        };
      }

      return { isValid: true, error: null };
    } catch (e) {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setValidationError('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateWikipediaUrl(url);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setLoading(true);
    setError('');
    setValidationError('');
    setQuiz(null);

    try {
      const data = await apiService.generateQuiz(url);
      setQuiz(data);
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h2 className="text-3xl font-bold mb-6 gradient-text">
          Generate Quiz from Wikipedia
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-gray-300 mb-3">
              Wikipedia Article URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
              disabled={loading}
              className={`input-cyber ${
                validationError ? 'border-neon-pink ring-neon-pink/50' : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {validationError && (
              <p className="mt-3 text-sm text-neon-pink flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationError}
              </p>
            )}
            <p className="mt-3 text-xs text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Paste any Wikipedia article URL to generate an AI-powered quiz
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Quiz...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Quiz with AI
              </span>
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div className="glass-card p-12 text-center">
          <div className="inline-block relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-900 border-t-primary-400 shadow-glow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-200">Generating your quiz...</p>
          <p className="mt-2 text-sm text-gray-400">AI is analyzing the article and creating questions</p>
          <div className="loading-dots mt-4 justify-center">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {error && (
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
      )}

      {quiz && <QuizDisplay quiz={quiz} />}
    </div>
  );
}

export default GenerateQuizTab;
