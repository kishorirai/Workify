import React, { useState, useEffect } from 'react';
import {
  Star, Building2, Users, Calendar, Filter, Search, Plus, Eye, MessageSquare, ThumbsUp, Trash2, X, Check, Menu
} from 'lucide-react';
import Sidebar from './Sidebar';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${apiUrl}/api/feedback`;

const FeedbackCenter = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [receivedFeedbackList, setReceivedFeedbackList] = useState([]);
  const [givenFeedbackList, setGivenFeedbackList] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    company: '',
    type: '',
    rating: 5,
    feedback: ''
  });
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [editId, setEditId] = useState(null);
  const [editFeedback, setEditFeedback] = useState({
    company: '',
    type: '',
    rating: 5,
    feedback: ''
  });

  // Fetch feedback lists from backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/received`, {
        credentials: 'include'
      }).then(res => res.json()),
      fetch(`${API_BASE}/given`, {
        credentials: 'include'
      }).then(res => res.json())
    ])
      .then(([received, given]) => {
        setReceivedFeedbackList(
          (received.feedbacks || []).map(item => ({
            ...item,
            icon: item.type && item.type.toLowerCase().includes('mock') ? Users : Building2,
            date: new Date(item.date).toLocaleDateString('en-GB')
          }))
        );
        setGivenFeedbackList(
          (given.feedbacks || []).map(item => ({
            ...item,
            icon: Building2,
            date: new Date(item.date).toLocaleDateString('en-GB')
          }))
        );
      })
      .finally(() => setLoading(false));
    // Only run on mount
    // eslint-disable-next-line
  }, []);

  const filteredReceived = receivedFeedbackList.filter(item => {
    const matchesSearch = item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || item.rating?.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const filteredGiven = givenFeedbackList.filter(item => {
    const matchesSearch = item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || item.rating?.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const StarRating = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const InteractiveStarRating = ({ rating, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );

  const handleSubmitFeedback = async () => {
    if (!newFeedback.company.trim() || !newFeedback.type.trim() || !newFeedback.feedback.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/give`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newFeedback)
      });
      const data = await res.json();
      if (data.success) {
        const item = {
          ...data.feedback,
          icon: Building2,
          date: new Date(data.feedback.date).toLocaleDateString('en-GB')
        };
        setGivenFeedbackList(prev => [item, ...prev]);
        setNewFeedback({ company: '', type: '', rating: 5, feedback: '' });
        setActiveTab('given');
        alert('Feedback submitted successfully!');
      } else {
        alert(data.message || "Failed to submit feedback.");
      }
    } catch  {
      alert("Could not submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  const getSentiment = rating =>
    rating >= 4 ? 'Positive' : 'Constructive';

  // --- Edit Feedback Handlers ---
  const handleEditClick = (item) => {
    setEditId(item._id);
    setEditFeedback({
      company: item.company,
      type: item.type,
      rating: item.rating,
      feedback: item.feedback
    });
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/given/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFeedback)
      });
      const data = await res.json();
      if (data.success) {
        setGivenFeedbackList(prev =>
          prev.map(item => item._id === editId ? {
            ...item,
            ...data.feedback,
            date: new Date(data.feedback.date).toLocaleDateString('en-GB')
          } : item)
        );
        setEditId(null);
        setEditFeedback({ company: '', type: '', rating: 5, feedback: '' });
        alert('Feedback updated successfully!');
      } else {
        alert(data.message || 'Failed to update feedback.');
      }
    } catch  {
      alert('Could not update feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditFeedback({ company: '', type: '', rating: 5, feedback: '' });
  };

  // --- Delete Feedback Handler ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/given/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setGivenFeedbackList(prev => prev.filter(item => item._id !== id));
        alert('Feedback deleted.');
      } else {
        alert(data.message || 'Failed to delete feedback.');
      }
    } catch  {
      alert('Could not delete feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop & mobile */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sectionLabel="CAMPUS SERVICES"
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold">Rojgar Setu</span>
        </div>
        <div className="min-h-screen bg-gray-50 p-6 flex-1">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Center</h1>
              <p className="text-gray-600">View feedback received and provide your own feedback</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-6 w-fit">
              {[
                { id: 'received', label: 'Received Feedback' },
                { id: 'given', label: 'Given Feedback' },
                { id: 'give', label: 'Give Feedback' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filter Bar */}
            {activeTab !== 'give' && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by company or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            )}

            {/* Content Area */}
            {activeTab === 'received' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">Loading...</div>
                ) : filteredReceived.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Received Yet</h3>
                    <p className="text-gray-600 mb-6">Feedback you receive will appear here.</p>
                  </div>
                ) : (
                  filteredReceived.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <item.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.company}</h3>
                            <p className="text-sm text-gray-600">{item.type} • {item.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarRating rating={item.rating} />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            getSentiment(item.rating) === 'Positive' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getSentiment(item.rating)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{item.feedback}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          Mark as Helpful
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'given' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">Loading...</div>
                ) : filteredGiven.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Given Yet</h3>
                    <p className="text-gray-600 mb-6">Start giving feedback to help others improve!</p>
                    <button
                      onClick={() => setActiveTab('give')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Give Your First Feedback
                    </button>
                  </div>
                ) : (
                  filteredGiven.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <item.icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.company}</h3>
                            <p className="text-sm text-gray-600">{item.type} • {item.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarRating rating={item.rating} />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            getSentiment(item.rating) === 'Positive' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getSentiment(item.rating)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{item.feedback}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Edit Feedback
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Feedback
                        </button>
                      </div>
                      {/* Edit Modal */}
                      {editId === item._id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                            <button
                              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                              onClick={handleEditCancel}
                            >
                              <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-semibold mb-4">Edit Feedback</h2>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                                <input
                                  type="text"
                                  value={editFeedback.company}
                                  onChange={e => setEditFeedback({ ...editFeedback, company: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Position/Role</label>
                                <input
                                  type="text"
                                  value={editFeedback.type}
                                  onChange={e => setEditFeedback({ ...editFeedback, type: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <InteractiveStarRating
                                  rating={editFeedback.rating}
                                  onChange={rating => setEditFeedback({ ...editFeedback, rating })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                                <textarea
                                  rows="4"
                                  value={editFeedback.feedback}
                                  onChange={e => setEditFeedback({ ...editFeedback, feedback: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                              <button
                                onClick={handleEditSave}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                disabled={loading}
                              >
                                <Check className="w-4 h-4" /> Save
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                                disabled={loading}
                              >
                                <X className="w-4 h-4" /> Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'give' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Give Feedback</h2>
                    <p className="text-gray-600">Share your experience to help others</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                      <input
                        type="text"
                        value={newFeedback.company}
                        onChange={(e) => setNewFeedback({...newFeedback, company: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position/Role</label>
                      <input
                        type="text"
                        value={newFeedback.type}
                        onChange={(e) => setNewFeedback({...newFeedback, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter position or role"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <InteractiveStarRating
                      rating={newFeedback.rating}
                      onChange={(rating) => setNewFeedback({...newFeedback, rating})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                    <textarea
                      rows="4"
                      value={newFeedback.feedback}
                      onChange={(e) => setNewFeedback({...newFeedback, feedback: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Share your detailed feedback..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmitFeedback}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      disabled={loading}
                    >
                      Submit Feedback
                    </button>
                    <button
                      onClick={() => setNewFeedback({ company: '', type: '', rating: 5, feedback: '' })}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      disabled={loading}
                    >
                      Reset Form
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Received Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">{receivedFeedbackList.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Given Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">{givenFeedbackList.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating Received</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {receivedFeedbackList.length > 0 ? (receivedFeedbackList.reduce((acc, item) => acc + (item.rating || 0), 0) / receivedFeedbackList.length).toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating Given</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {givenFeedbackList.length > 0 ? (givenFeedbackList.reduce((acc, item) => acc + (item.rating || 0), 0) / givenFeedbackList.length).toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCenter;