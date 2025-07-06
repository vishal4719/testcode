import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import UserNavbar from '../components/UserNavbar';

function SubmissionsPage() {
  const { testId } = useParams();
  const { user } = useAuth();
  const token = user?.token;
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState('');
  const [test, setTest] = useState(null);
  const navigate = useNavigate();
  const [selectedQuestionId, setSelectedQuestionId] = useState('all');

  const fetchTest = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tests/${testId}`, config);
      setTest(res.data);
    } catch (err) {
      setTest(null);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    setSubmissionsError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/submissions/by-test-user/${testId}`, config);
      setSubmissions(res.data);
    } catch (err) {
      setSubmissionsError('Failed to fetch submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTest();
    fetchSubmissions();
  };

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (testId && token) fetchTest();
  }, [testId, token]);

  useEffect(() => {
    if (testId && token) fetchSubmissions();
  }, [testId, token]);

  const handleLogout = async () => {
    // You may want to use your logout logic here
    navigate('/');
  };

  // Check if the current user has any submission for this test
  const hasUserSubmission = submissions.some(sub => sub.userId === user?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <UserNavbar
        showSubmission={false}
        user={user}
        onLogout={handleLogout}
      />
      <div className="max-w-4xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-2xl border-2 border-orange-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-orange-600">Submissions</h2>
          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={submissionsLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className={`w-4 h-4 ${submissionsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{submissionsLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        {test && test.questions && test.questions.length > 1 && (
          <div className="mb-6 flex items-center space-x-4">
            <label className="font-semibold text-orange-700">Filter by Question:</label>
            <select
              className="border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={selectedQuestionId}
              onChange={e => setSelectedQuestionId(e.target.value)}
            >
              <option value="all">All Questions</option>
              {test.questions.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>
        )}
        {submissionsLoading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : submissionsError ? (
          <div className="text-center text-red-500 py-8">{submissionsError}</div>
        ) : !hasUserSubmission ? (
          <div className="text-center text-gray-500 py-8">You must submit at least one question to view submissions.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-orange-50 rounded-lg border border-orange-200">
              <thead>
                <tr className="bg-orange-100">
                  <th className="px-4 py-2 text-left text-orange-800 font-semibold border-b border-orange-200">Username</th>
                  <th className="px-4 py-2 text-left text-orange-800 font-semibold border-b border-orange-200">Question</th>
                  <th className="px-4 py-2 text-left text-orange-800 font-semibold border-b border-orange-200">Time Taken</th>
                  <th className="px-4 py-2 text-left text-orange-800 font-semibold border-b border-orange-200">Marks</th>
                </tr>
              </thead>
              <tbody>
                {submissions
                  .filter(sub => selectedQuestionId === 'all' || sub.questionId === selectedQuestionId)
                  .map((sub, idx) => {
                    let timeTaken = '';
                    if (typeof sub.timeTaken === 'number') {
                      const mins = Math.floor(sub.timeTaken / 60000);
                      const secs = Math.floor((sub.timeTaken % 60000) / 1000);
                      timeTaken = `${mins}m ${secs}s`;
                    } else if (test && test.startDateTime && sub.submittedAt) {
                      const start = new Date(test.startDateTime);
                      const end = new Date(sub.submittedAt);
                      const diff = Math.max(0, end - start);
                      const mins = Math.floor(diff / 60000);
                      const secs = Math.floor((diff % 60000) / 1000);
                      timeTaken = `${mins}m ${secs}s`;
                    }
                    return (
                      <tr key={sub.id || idx} className="border-b border-orange-200 hover:bg-orange-100 transition-colors">
                        <td className="px-4 py-2 text-orange-900">{sub.userName}</td>
                        <td className="px-4 py-2 text-orange-900">{sub.questionTitle}</td>
                        <td className="px-4 py-2 text-orange-900">{timeTaken}</td>
                        <td className="px-4 py-2 text-orange-900">{sub.marks}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {submissions.filter(sub => selectedQuestionId === 'all' || sub.questionId === selectedQuestionId).length === 0 && (
              <div className="text-center text-gray-500 py-8">No submissions yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmissionsPage; 