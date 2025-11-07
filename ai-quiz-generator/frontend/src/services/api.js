import { API_URL } from '../config/constants';

/**
 * API Service for handling all backend requests
 */

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
}

export default new ApiService();
