import { useState } from 'react';

function InteractiveQuiz({ quiz }) {
  if (!quiz) return null;

  const questions = quiz.quiz || quiz.questions || [];
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionIndex, option) => {
    if (showResults) return; // Don't allow changes after showing results
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      const correctAnswer = question.correctAnswer || question.answer;
      if (selectedAnswers[index] === correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const score = showResults ? calculateScore() : 0;
  const questionCount = questions.length;

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

      {/* Score Display (if results shown) */}
      {showResults && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-4xl font-bold mb-2">{score} / {questionCount}</p>
          <p className="text-lg">
            {score === questionCount ? '🎉 Perfect Score!' : 
             score >= questionCount * 0.7 ? '👍 Great Job!' : 
             score >= questionCount * 0.5 ? '👌 Good Effort!' : 
             '💪 Keep Learning!'}
          </p>
          <button
            onClick={handleReset}
            className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {questions.length > 0 && questions.map((question, index) => {
          const correctAnswer = question.correctAnswer || question.answer;
          const userAnswer = selectedAnswers[index];
          const isAnswered = userAnswer !== undefined;
          const isCorrect = userAnswer === correctAnswer;

          return (
            <div 
              key={index} 
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-200"
            >
              {/* Question Header */}
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                  showResults && isAnswered
                    ? isCorrect 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {showResults && isAnswered ? (isCorrect ? '✓' : '✗') : index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 flex-1 pt-1">
                  {question.question}
                </h3>
              </div>
              
              {/* Options */}
              <div className="space-y-3 mb-4 ml-11">
                {question.options && question.options.map((option, optIndex) => {
                  const isSelected = userAnswer === option;
                  const isCorrectOption = option === correctAnswer;
                  
                  let optionClass = 'p-4 rounded-lg border-2 transition-all cursor-pointer ';
                  
                  if (showResults) {
                    if (isCorrectOption) {
                      optionClass += 'bg-green-50 border-green-400 shadow-sm';
                    } else if (isSelected && !isCorrectOption) {
                      optionClass += 'bg-red-50 border-red-400';
                    } else {
                      optionClass += 'bg-gray-50 border-gray-200';
                    }
                  } else {
                    if (isSelected) {
                      optionClass += 'bg-blue-50 border-blue-400 shadow-sm';
                    } else {
                      optionClass += 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                    }
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleAnswerSelect(index, option)}
                      className={optionClass}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-bold text-gray-700 mr-3 text-sm bg-white px-2 py-1 rounded">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="text-gray-800">{option}</span>
                        </div>
                        {showResults && isCorrectOption && (
                          <span className="ml-3 text-green-600 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Correct
                          </span>
                        )}
                        {showResults && isSelected && !isCorrectOption && (
                          <span className="ml-3 text-red-600 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Wrong
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation (only show after results) */}
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

      {/* Submit Button */}
      {!showResults && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== questionCount}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          >
            {Object.keys(selectedAnswers).length === questionCount 
              ? 'Submit Quiz' 
              : `Answer All Questions (${Object.keys(selectedAnswers).length}/${questionCount})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default InteractiveQuiz;
