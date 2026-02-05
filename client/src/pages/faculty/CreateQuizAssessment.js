 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
// ...existing code...
// ...existing code...

const CreateQuizAssessment = () => {
  // ...existing code...
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  // ...existing code...
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    maxPoints: '',
    instructions: '',
    questions: [{ type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: 0, correctText: '' }],
    pdfFile: null,
    imageFile: null
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://eduspark-nxre.onrender.com/api/courses/faculty/my-courses');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    if (field === 'type') {
      updatedQuestions[index].type = value;
      // Reset fields when changing type
      if (value === 'fill-blank') {
        updatedQuestions[index].options = [];
        updatedQuestions[index].correctAnswer = null;
      } else if (value === 'mcq') {
        updatedQuestions[index].options = ['', '', '', ''];
        updatedQuestions[index].correctAnswer = 0;
        updatedQuestions[index].correctText = '';
      }
    } else if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = parseInt(value);
    } else if (field === 'correctText') {
      updatedQuestions[index].correctText = value;
    }
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: 0, correctText: '' }]
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.courseId) {
        alert('Please select a course');
        return;
      }
      if (!formData.title.trim()) {
        alert('Please enter a title');
        return;
      }
      if (!formData.description.trim()) {
        alert('Please enter a description');
        return;
      }
      if (!formData.dueDate) {
        alert('Please select a due date');
        return;
      }
      if (!formData.maxPoints || formData.maxPoints < 1) {
        alert('Please enter valid max points');
        return;
      }

      // Validate questions
      for (let i = 0; i < formData.questions.length; i++) {
        const q = formData.questions[i];
        if (!q.question.trim()) {
          alert(`Please enter question text for question ${i + 1}`);
          return;
        }
        if (q.type === 'mcq') {
          if (!q.options || q.options.some(opt => !opt.trim())) {
            alert(`Please fill all options for MCQ question ${i + 1}`);
            return;
          }
          if (q.correctAnswer === null || q.correctAnswer === undefined) {
            alert(`Please select correct answer for MCQ question ${i + 1}`);
            return;
          }
        } else if (q.type === 'fill-blank') {
          if (!q.correctText.trim()) {
            alert(`Please enter correct answer for fill-in-the-blank question ${i + 1}`);
            return;
          }
        }
      }

      // Clean up questions data
      const cleanedQuestions = formData.questions.map(q => {
        if (q.type === 'mcq') {
          return {
            type: q.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          };
        } else {
          return {
            type: q.type,
            question: q.question,
            correctText: q.correctText
          };
        }
      });

      const submitData = {
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        maxPoints: parseInt(formData.maxPoints),
        instructions: formData.instructions,
        isQuiz: 'true',
        questions: cleanedQuestions
      };

      console.log('Submitting quiz assessment:', submitData);

      const response = await axios.post('https://eduspark-nxre.onrender.com/api/assignments/quiz', submitData);

      console.log('Quiz assessment created successfully:', response.data);
      navigate('/faculty/dashboard');
    } catch (error) {
      console.error('Error creating quiz assessment:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Server error'}`);
      } else {
        alert('Error creating quiz assessment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Quiz Assessment</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Points
                </label>
                <input
                  type="number"
                  name="maxPoints"
                  value={formData.maxPoints}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File (Optional)
                </label>
                <input
                  type="file"
                  name="pdfFile"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image File (Optional)
                </label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Question
                </button>
              </div>

              {formData.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Question {index + 1}</h4>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mcq">Multiple Choice Question (MCQ)</option>
                      <option value="fill-blank">Fill in the Blank</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {question.type === 'mcq' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Option {optionIndex + 1}
                            </label>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleQuestionChange(index, `option-${optionIndex}`, e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer
                        </label>
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {question.options.map((_, optionIndex) => (
                            <option key={optionIndex} value={optionIndex}>
                              Option {optionIndex + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {question.type === 'fill-blank' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer (Fill in the blank)
                      </label>
                      <input
                        type="text"
                        value={question.correctText}
                        onChange={(e) => handleQuestionChange(index, 'correctText', e.target.value)}
                        required
                        placeholder="Enter the correct answer for the blank"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Students will see a blank space and need to fill in this exact answer.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/faculty/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Quiz Assessment'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateQuizAssessment;
