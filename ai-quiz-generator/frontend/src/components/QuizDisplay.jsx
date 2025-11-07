function QuizDisplay({ quiz }) {
  if (!quiz) return null;

  // Backend returns 'quiz' field containing the questions array
  const questions = quiz.quiz || quiz.questions || [];
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

      {/* Questions - Card Based Layout */}
      <div className="space-y-5">
        {questions.length > 0 && questions.map((question, index) => (
          <div 
            key={index} 
            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-200 hover:border-blue-300"
          >
            {/* Question Header */}
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 flex-1 pt-1">
                {question.question}
              </h3>
            </div>
            
            {/* Options */}
            <div className="space-y-3 mb-4 ml-11">
              {question.options && question.options.map((option, optIndex) => {
                // Backend uses 'answer' field, frontend was expecting 'correctAnswer'
                const correctAnswer = question.correctAnswer || question.answer;
                const isCorrect = option === correctAnswer;
                return (
                  <div
                    key={optIndex}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCorrect
                        ? 'bg-green-50 border-green-400 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-700 mr-3 text-sm bg-white px-2 py-1 rounded">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="text-gray-800">{option}</span>
                      </div>
                      {isCorrect && (
                        <span className="ml-3 text-green-600 font-semibold flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Correct
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {question.explanation && (
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
        ))}
      </div>
    </div>
  );
}

export default QuizDisplay;
