import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const TakeQuiz = () => {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId, fetchAssignment]);

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(`https://eduspark-nxre.onrender.com/api/assignments/${assignmentId}`);
      setAssignment(response.data.assignment);

      // Initialize answers object
      const initialAnswers = {};
      response.data.assignment.questions.forEach((question, index) => {
        if (question.type === 'mcq') {
          initialAnswers[index] = '';
        } else if (question.type === 'fill-blank') {
          initialAnswers[index] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      alert('Error loading quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate that all questions are answered
      const unansweredQuestions = assignment.questions
        .map((q, index) => ({ question: q, index }))
        .filter(({ question, index }) => !answers[index] || answers[index].trim() === '');

      if (unansweredQuestions.length > 0) {
        alert(`Please answer all questions before submitting. You have ${unansweredQuestions.length} unanswered question(s).`);
        return;
      }

      // Prepare submission data
      const submissionData = {
        assignmentId,
        answers: Object.entries(answers).map(([questionIndex, answer]) => ({
          questionIndex: parseInt(questionIndex),
          answer: answer.trim()
        }))
      };

      console.log('Submitting quiz answers:', submissionData);

      const response = await axios.post(`https://eduspark-nxre.onrender.com/api/assignments/${assignmentId}/submit-quiz`, submissionData);

      console.log('Quiz submitted successfully:', response.data);
      setSubmissionResult(response.data);

      // Update the assignment state to include the new submission
      setAssignment(prev => ({
        ...prev,
        submissions: [...prev.submissions, {
          student: { _id: user._id, name: user.name },
          submissionText: JSON.stringify(response.data.gradedAnswers || []),
          submittedAt: new Date().toISOString(),
          grade: response.data.grade
        }]
      }));

      // Show success message and navigate back to assignments after 5 seconds
      alert(`Quiz submitted successfully! Your grade: ${response.data.correctAnswers}/${response.data.totalQuestions} (${response.data.grade}/${response.data.maxPoints} points)`);
      setTimeout(() => {
        navigate('/assignments', { state: { refresh: true } });
      }, 5000);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Server error'}`);
      } else {
        alert('Error submitting quiz. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600">The quiz you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  // Check if student has already submitted
  const existingSubmission = assignment.submissions.find(s => (s.student._id || s.student).toString() === user._id);
  if (existingSubmission) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-8 text-center"
          >
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Already Submitted</h1>
            <p className="text-gray-600 mb-6">
              You have already submitted this quiz on {new Date(existingSubmission.submittedAt).toLocaleDateString()}.
            </p>
            {existingSubmission.grade !== undefined && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Your Grade</h3>
                <p className="text-2xl font-bold text-green-600">
                  {existingSubmission.grade}/{assignment.maxPoints} points
                </p>
                {existingSubmission.feedback && (
                  <p className="text-sm text-green-700 mt-2">Feedback: {existingSubmission.feedback}</p>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/assignments')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Assignments
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
            <p className="text-gray-600 mb-4">{assignment.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-4">📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              <span className="mr-4">⭐ {assignment.maxPoints} points</span>
              <span>❓ {assignment.questions.length} questions</span>
            </div>
            {assignment.instructions && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <p className="text-blue-800">{assignment.instructions}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {assignment.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {question.question}
                      </h3>

                      {question.type === 'mcq' && question.options && question.options.length > 0 && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={optionIndex}
                                checked={answers[index] === optionIndex.toString()}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                required
                                className="mr-3 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'fill-blank' && (
                        <div>
                          <input
                            type="text"
                            value={answers[index] || ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder="Enter your answer here"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Type your answer in the blank space above.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/assignments')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </form>

          {submissionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">Quiz Submitted Successfully!</h2>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <h3 className="text-lg font-semibold text-green-900 mb-1">Your Grade</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {submissionResult.correctAnswers}/{submissionResult.totalQuestions} points
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {submissionResult.correctAnswers} out of {submissionResult.totalQuestions} correct
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Review Your Answers:</h3>
                <div className="space-y-4">
                  {(() => {
                    try {
                      const gradedAnswers = JSON.parse(assignment.submissions.find(s => (s.student._id || s.student).toString() === user._id)?.submissionText || '[]');
                      return assignment.questions.map((question, index) => {
                        const userAnswer = gradedAnswers.find(a => a.questionIndex === index);
                        return (
                          <div key={index} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-start mb-3">
                              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3 ${
                                userAnswer?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>

                                {question.type === 'mcq' && (
                                  <div className="space-y-1">
                                    {question.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className={`p-2 rounded ${
                                        optionIndex === question.correctAnswer ? 'bg-green-100 text-green-800 font-medium' :
                                        optionIndex === parseInt(userAnswer?.answer) && !userAnswer?.isCorrect ? 'bg-red-100 text-red-800' :
                                        'text-gray-700'
                                      }`}>
                                        {option}
                                        {optionIndex === question.correctAnswer && ' ✓ (Correct)'}
                                        {optionIndex === parseInt(userAnswer?.answer) && !userAnswer?.isCorrect && ' ✗ (Your answer)'}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {question.type === 'fill-blank' && (
                                  <div className="space-y-2">
                                    <div className={`p-2 rounded ${userAnswer?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      Your answer: {userAnswer?.answer}
                                    </div>
                                    {!userAnswer?.isCorrect && (
                                      <div className="p-2 bg-green-100 text-green-800 rounded">
                                        Correct answer: {question.correctText}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    } catch (e) {
                      return <p className="text-gray-600">Unable to load answer review.</p>;
                    }
                  })()}
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/assignments')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Assignments
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TakeQuiz;
