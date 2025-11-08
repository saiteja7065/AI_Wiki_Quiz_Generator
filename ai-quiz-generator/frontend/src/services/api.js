/**
 * API Service for handling all backend requests
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  /**
   * Generate a quiz from a Wikipedia URL
   * @param {string} url - Wikipedia URL
   * @returns {Promise<Object>} Quiz data
   */
  async generateQuiz(url) {
    const response = await fetch(`${API_URL}/api/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate quiz');
    }

    return data;
  }

  /**
   * Fetch all quiz history
   * @returns {Promise<Array>} Array of quiz history items
   */
  async getHistory() {
    const response = await fetch(`${API_URL}/api/history`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch history');
    }

    return data;
  }

  /**
   * Fetch a specific quiz by ID
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} Quiz data
   */
  async getQuizById(quizId) {
    const response = await fetch(`${API_URL}/api/quiz/${quizId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch quiz details');
    }

    return data;
  }

  /**
   * Submit user's answers for a quiz
   * @param {number} quizId - Quiz ID
   * @param {Object} answers - User's answers {"0": "Option A", "1": "Option B"}
   * @returns {Promise<Object>} Success response
   */
  async submitAnswers(quizId, answers) {
    const response = await fetch(`${API_URL}/api/submit-answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quiz_id: quizId, answers }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit answers');
    }

    return data;
  }
}

export default new ApiService();
