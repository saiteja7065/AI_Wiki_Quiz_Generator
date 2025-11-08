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
    <div className="glass-card p-8 space-y-8">
      {/* Quiz Header */}
      <div className="border-b-2 border-primary-500/30 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-4xl font-bold gradient-text mb-3">{quiz.title}</h2>
            {quiz.url && (
              <a
                href={quiz.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 text-sm inline-flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Source Article
              </a>
            )}
          </div>
          <div className="ml-4 bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-3 rounded-xl text-white font-bold shadow-glow">
            {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
          </div>
        </div>
      </div>

      {/* View Mode Info */}
      {viewMode && (
        <div className="glass-card border-primary-500/50 p-5">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-primary-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-300 font-medium">
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
            className={`btn-neon px-12 py-4 text-lg ${
              !allAnswered || isSaving ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
            }`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : allAnswered ? (
              <span className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Quiz
              </span>
            ) : (
              `Answer All Questions (${Object.keys(selectedAnswers).length}/${questionCount})`
            )}
          </button>
        </div>
      )}

      {/* Results Display */}
      {isSubmitted && !viewMode && (
        <div className="space-y-6">
          <div className="glass-card bg-gradient-to-br from-primary-600/20 to-accent-600/20 border-primary-500/50 p-8">
            <h3 className="text-3xl font-bold mb-6 text-center gradient-text">Quiz Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Score</p>
                <p className="text-5xl font-bold gradient-text">{getScore()} / {questionCount}</p>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Percentage</p>
                <p className="text-5xl font-bold gradient-text">{Math.round((getScore() / questionCount) * 100)}%</p>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Grade</p>
                <p className="text-5xl font-bold gradient-text">
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
            <div className="mt-8 text-center">
              <button
                onClick={handleReset}
                className="btn-neon-outline px-8 py-3"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake Quiz
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
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
              className={`glass-card-hover p-6 ${
                viewMode
                  ? 'border-primary-500/50'
                  : isSubmitted
                    ? isCorrect
                      ? 'border-neon-green/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'border-neon-pink/50 shadow-[0_0_20px_rgba(255,0,110,0.3)]'
                    : ''
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start mb-5">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 ${
                  viewMode
                    ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-glow'
                    : isSubmitted
                      ? isCorrect
                        ? 'bg-gradient-to-br from-neon-green to-green-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'bg-gradient-to-br from-neon-pink to-pink-600 text-white shadow-[0_0_15px_rgba(255,0,110,0.5)]'
                      : 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-glow'
                }`}>
                  {!viewMode && isSubmitted ? (
                    isCorrect ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )
                  ) : (
                    index + 1
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-200 flex-1 pt-1.5">
                  {question.question}
                </h3>
              </div>
              
              {/* Options */}
              <div className="space-y-3 mb-5 ml-14">
                {question.options && question.options.map((option, optIndex) => {
                  const isThisCorrect = option === correctAnswer;
                  const isSelected = option === selectedAnswer;
                  
                  let optionClass = 'quiz-option';
                  
                  if (viewMode) {
                    optionClass = isThisCorrect
                      ? 'quiz-option-correct'
                      : 'quiz-option opacity-50';
                  } else if (!isSubmitted) {
                    optionClass = isSelected
                      ? 'quiz-option-selected'
                      : 'quiz-option';
                  } else {
                    if (isThisCorrect) {
                      optionClass = 'quiz-option-correct';
                    } else if (isSelected && !isThisCorrect) {
                      optionClass = 'quiz-option-incorrect';
                    } else {
                      optionClass = 'quiz-option opacity-50';
                    }
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleOptionClick(index, option)}
                      className={optionClass}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-bold text-gray-200 mr-3 text-sm bg-dark-800 px-3 py-1.5 rounded-lg">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="text-gray-200">{option}</span>
                        </div>
                        {showResults && isThisCorrect && (
                          <span className="ml-3 text-neon-green font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Correct
                          </span>
                        )}
                        {!viewMode && isSubmitted && isSelected && !isThisCorrect && (
                          <span className="ml-3 text-neon-pink font-semibold flex items-center">
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
                <div className="ml-14 glass-card border-primary-500/50 p-5">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-primary-300 mb-1">Explanation</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
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
