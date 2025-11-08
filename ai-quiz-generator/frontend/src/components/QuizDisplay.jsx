import { useState, useEffect } from 'react';
import apiService from '../services/api';

function QuizDisplay({ quiz, viewMode = false }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(viewMode);
  const [isSaving, setIsSaving] = useState(false);

  if (!quiz) return null;

  const questions = quiz.quiz || quiz.questions || [];
  const questionCount = questions.length;

  // Load saved answers if viewing from history
  useEffect(() => {
    if (viewMode && quiz.user_answers) {
      setSelectedAnswers(quiz.user_answers);
    }
  }, [viewMode, quiz.user_answers]);

  const handleOptionClick = (questionIndex, option) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      const correctAnswer = question.correctAnswer || question.answer;
      if (selectedAnswers[index] === correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length === questions.length) {
      setIsSubmitted(true);
      
      // Save answers to backend
      if (quiz.id) {
        setIsSaving(true);
        try {
          await apiService.submitAnswers(quiz.id, selectedAnswers);
        } catch (error) {
          console.error('Failed to save answers:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-6 space-y-6">
      {/* Quiz Header */}
      <div className="border-b-2 border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
            {quiz.url && (
              <a
                href={quiz.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Source: Wikipedia
              </a>
            )}
          </div>
          <div className="ml-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
          </div>
        </div>
      </div>

      {/* View Mode Info */}
      {viewMode && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-800 font-medium">
              Viewing quiz from history - All correct answers and explanations are shown below
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && !viewMode && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSaving}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
              allAnswered && !isSaving
                ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : allAnswered ? (
              'Submit Quiz'
            ) : (
              `Answer All Questions (${Object.keys(selectedAnswers).length}/${questionCount})`
            )}
          </button>
        </div>
      )}

      {/* Results Display */}
      {isSubmitted && !viewMode && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-center">Quiz Results</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90 mb-1">Score</p>
                <p className="text-3xl font-bold">{getScore()} / {questionCount}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90 mb-1">Percentage</p>
                <p className="text-3xl font-bold">{Math.round((getScore() / questionCount) * 100)}%</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90 mb-1">Grade</p>
                <p className="text-3xl font-bold">
                  {(() => {
                    const percentage = (getScore() / questionCount) * 100;
                    if (percentage >= 90) return 'A+';
                    if (percentage >= 80) return 'A';
                    if (percentage >= 70) return 'B';
                    if (percentage >= 60) return 'C';
                    if (percentage >= 50) return 'D';
                    return 'F';
                  })()}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={handleReset}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {questions.length > 0 && questions.map((question, index) => {
          const correctAnswer = question.correctAnswer || question.answer;
          const selectedAnswer = selectedAnswers[index];
          const isAnswered = selectedAnswer !== undefined;
          const isCorrect = isSubmitted && selectedAnswer === correctAnswer;
          const isWrong = isSubmitted && selectedAnswer !== correctAnswer;
          const showResults = isSubmitted || viewMode;

          return (
            <div 
              key={index} 
              className={`bg-white border-2 rounded-xl p-6 transition-all duration-200 ${
                viewMode
                  ? 'border-blue-300 shadow-lg'
                  : isSubmitted
                    ? isCorrect
                      ? 'border-green-400 shadow-lg'
                      : 'border-red-400 shadow-lg'
                    : 'border-gray-200 hover:shadow-xl'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                  viewMode
                    ? 'bg-blue-600 text-white'
                    : isSubmitted
                      ? isCorrect
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                }`}>
                  {!viewMode && isSubmitted ? (
                    isCorrect ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )
                  ) : (
                    index + 1
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 flex-1 pt-1">
                  {question.question}
                </h3>
              </div>
              
              {/* Options */}
              <div className="space-y-3 mb-4 ml-11">
                {question.options && question.options.map((option, optIndex) => {
                  const isThisCorrect = option === correctAnswer;
                  const isSelected = option === selectedAnswer;
                  
                  let optionClass = 'bg-gray-50 border-gray-200';
                  
                  if (viewMode) {
                    optionClass = isThisCorrect
                      ? 'bg-green-50 border-green-400'
                      : 'bg-gray-50 border-gray-200 opacity-60';
                  } else if (!isSubmitted) {
                    optionClass = isSelected
                      ? 'bg-blue-100 border-blue-400 cursor-pointer'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
                  } else {
                    if (isThisCorrect) {
                      optionClass = 'bg-green-50 border-green-400';
                    } else if (isSelected && !isThisCorrect) {
                      optionClass = 'bg-red-50 border-red-400';
                    } else {
                      optionClass = 'bg-gray-50 border-gray-200 opacity-60';
                    }
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleOptionClick(index, option)}
                      className={`p-4 rounded-lg border-2 transition-all ${optionClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-bold text-gray-700 mr-3 text-sm bg-white px-2 py-1 rounded">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="text-gray-800">{option}</span>
                        </div>
                        {showResults && isThisCorrect && (
                          <span className="ml-3 text-green-600 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Correct Answer
                          </span>
                        )}
                        {!viewMode && isSubmitted && isSelected && !isThisCorrect && (
                          <span className="ml-3 text-red-600 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Your Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation - Show after submission or in view mode */}
              {showResults && question.explanation && (
                <div className="ml-11 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">Explanation</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuizDisplay;
