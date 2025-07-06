import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import AdminNavbar from './AdminNavbar';

function TestResultPage() {
  const { testId } = useParams();
  const { user } = useAuth();
  const token = user?.token;
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSubmissions() {
      if (!token || !testId) {
        setError('Missing token or test ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        console.log('Fetching submissions for test ID:', testId);
        
        const config = { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        };
        
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/submissions/by-test/${testId}`, 
          config
        );
        
        console.log('Submissions response:', res.data);
        if (Array.isArray(res.data)) {
          setSubmissions(res.data);
        } else {
          console.error('Unexpected response format:', res.data);
          setError('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to fetch submissions: ' + (err.response?.data || err.message));
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [token, testId]);

  // Excel Download Function
  const downloadExcel = () => {
    // Create CSV content
    const headers = ['User', 'Question', 'Marks', 'Submitted At', 'Time Taken', 'Code'];
    const csvContent = [
      headers.join(','),
      ...submissions.map(sub => {
        let timeTaken = '';
        if (typeof sub.timeTaken === 'number') {
          const mins = Math.floor(sub.timeTaken / 60000);
          const secs = Math.floor((sub.timeTaken % 60000) / 1000);
          timeTaken = `${mins}m ${secs}s`;
        }
        
        // Escape commas and quotes in the data
        const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const escaped = String(str).replace(/"/g, '""');
          return `"${escaped}"`;
        };

        return [
          escapeCsv(sub.userName || sub.userId),
          escapeCsv(sub.questionTitle || sub.questionId),
          escapeCsv(sub.marks),
          escapeCsv(new Date(sub.submittedAt).toLocaleString()),
          escapeCsv(timeTaken),
          escapeCsv(sub.code)
        ].join(',');
      })
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Test-Results-${testId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get test start time from submissions if available
  const getTestStartTime = () => {
    if (submissions.length > 0 && submissions[0].test && submissions[0].test.startDateTime) {
      return new Date(submissions[0].test.startDateTime);
    }
    // fallback: try to get from first submission's submittedAt minus a guess, or null
    return null;
  };
  const testStartTime = getTestStartTime();

  const toggleRow = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Test Results</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Test ID: {testId}</p>
              </div>
              <button
                onClick={downloadExcel}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download Excel
              </button>
            </div>
            <div className="border-t border-gray-200">
              {submissions.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                  No submissions found for this test.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission, index) => {
                        let timeTaken = '';
                        if (typeof submission.timeTaken === 'number') {
                          const mins = Math.floor(submission.timeTaken / 60000);
                          const secs = Math.floor((submission.timeTaken % 60000) / 1000);
                          timeTaken = `${mins}m ${secs}s`;
                        } else if (testStartTime && submission.submittedAt) {
                          const start = testStartTime;
                          const end = new Date(submission.submittedAt);
                          const diff = Math.max(0, end - start);
                          const mins = Math.floor(diff / 60000);
                          const secs = Math.floor((diff % 60000) / 1000);
                          timeTaken = `${mins}m ${secs}s`;
                        }
                        const isExpanded = expandedRows.has(index);
                        return (
                          <React.Fragment key={index}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.userName || submission.userId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.questionTitle || submission.questionId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.marks}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(submission.submittedAt).toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{timeTaken}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <button
                                  onClick={() => toggleRow(index)}
                                  className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center space-x-1"
                                >
                                  <span>{isExpanded ? 'Hide' : 'Show'} Code</span>
                                  <svg
                                    className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                                    <pre className="text-sm whitespace-pre-wrap font-mono">{submission.code}</pre>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestResultPage;