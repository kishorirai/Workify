import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Filter, MapPin, Clock, DollarSign, Eye, X, Calendar, Users, Building, Award } from 'lucide-react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import API from '../../api';

const Jobs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationJob, setApplicationJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    availability: ''
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [currentPage, selectedFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError && setError(null);

      const params = {
        page: currentPage,
        limit: 10
      };

      if (selectedFilter !== 'all') {
        params.type = selectedFilter === 'internship' ? 'internship'
          : selectedFilter === 'part-time' ? 'part-time'
          : 'job';
      }

      const response = await API.get('/api/roles', { params });

      if (response.data.success) {
        setJobs(response.data.jobs);
        setPagination(response.data.pagination);
      } else {
        setError && setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError && setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (job) => {
    try {
      if (!job.responsibilities || job.responsibilities.length === 0) {
        const response = await API.get(`/api/studentJobs/${job._id}`);
        if (response.data.success) {
          setSelectedJob(response.data.job);
        } else {
          setSelectedJob(job);
        }
      } else {
        setSelectedJob(job);
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setSelectedJob(job);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const handleApplyNow = (job) => {
    setApplicationJob(job);
    setShowApplicationModal(true);
    if (showModal) {
      setShowModal(false);
    }
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setApplicationJob(null);
    setApplicationData({
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
      experience: '',
      availability: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      setApplying(true);

      const res = await API.post(
        `/api/studentJobs/${applicationJob._id}/apply`,
        applicationData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.success) {
        alert(`Application submitted successfully for ${applicationJob.title} at ${applicationJob.company}!`);
        closeApplicationModal();
        fetchJobs();
      } else {
        alert(res.data.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setSelectedFilter(newFilter);
    setCurrentPage(1);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
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
        <main className="flex-1 bg-gray-50 min-h-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center space-x-4">
              <Briefcase className="text-gray-600" size={20} />
              <h1 className="text-lg font-medium text-gray-900">Jobs & Internships</h1>
            </div>
          </div>

          <div className="p-8">
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={selectedFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="internship">Internships</option>
                    <option value="job">Full-time Jobs</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-lg text-gray-700 mb-2">{job.company}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin size={16} />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign size={16} />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{job.posted}</span>
                        </div>
                      </div>

                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        job.type === 'Internship' ? 'bg-green-100 text-green-800' :
                          job.type === 'Full-time' ? 'bg-blue-100 text-blue-800' :
                            job.type === 'Part-time' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                        }`}>
                        {job.type}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(job)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleApplyNow(job)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements && job.requirements.slice(0, 5).map((skill, i) => (
                        <span key={skill + i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                      {job.requirements && job.requirements.length > 5 && (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          +{job.requirements.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}

            {filteredJobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Job Details Modal */}
          {showModal && selectedJob && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-600">{selectedJob.company}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Job Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedJob.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Salary</p>
                        <p className="font-medium">{selectedJob.salary}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{selectedJob.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Applicants</p>
                        <p className="font-medium">{selectedJob.applicants}</p>
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {/* Key Responsibilities */}
                  {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h3>
                      <ul className="space-y-2">
                        {selectedJob.responsibilities.map((responsibility, i) => (
                          <li key={responsibility + i} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications */}
                  {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Qualifications</h3>
                      <ul className="space-y-2">
                        {selectedJob.qualifications.map((qualification, i) => (
                          <li key={qualification + i} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{qualification}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Skills */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requirements && selectedJob.requirements.map((skill, i) => (
                        <span key={skill + i} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedJob.benefits.map((benefit, i) => (
                          <div key={benefit + i} className="flex items-center space-x-2">
                            <Award size={16} className="text-green-600" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About Company */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Building size={20} />
                      <span>About {selectedJob.company}</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.aboutCompany}</p>
                  </div>

                  {/* Application Details */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Application Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Start Date: </span>
                        <span className="text-blue-800">{selectedJob.startDate}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Posted: </span>
                        <span className="text-blue-800">{selectedJob.posted}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Job Type: </span>
                        <span className="text-blue-800">{selectedJob.type}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Applications: </span>
                        <span className="text-blue-800">{selectedJob.applicants} received</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleApplyNow(selectedJob)}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Modal */}
          {showApplicationModal && applicationJob && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Application Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
                    <p className="text-lg text-gray-600">{applicationJob.title} at {applicationJob.company}</p>
                  </div>
                  <button
                    onClick={closeApplicationModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Application Form */}
                <form onSubmit={handleSubmitApplication} className="p-6">
                  {/* Personal Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={applicationData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={applicationData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={applicationData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Background</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relevant Experience
                      </label>
                      <textarea
                        name="experience"
                        value={applicationData.experience}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your relevant experience, projects, or skills..."
                      />
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why are you interested in this position?
                      </label>
                      <textarea
                        name="coverLetter"
                        value={applicationData.coverLetter}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us why you're the perfect fit for this role..."
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        When can you start?
                      </label>
                      <select
                        name="availability"
                        value={applicationData.availability}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select availability</option>
                        <option value="immediately">Immediately</option>
                        <option value="1-week">Within 1 week</option>
                        <option value="2-weeks">Within 2 weeks</option>
                        <option value="1-month">Within 1 month</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  {/* Job Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Job Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Position:</span> {applicationJob.title}</p>
                      <p><span className="font-medium">Company:</span> {applicationJob.company}</p>
                      <p><span className="font-medium">Location:</span> {applicationJob.location}</p>
                      <p><span className="font-medium">Type:</span> {applicationJob.type}</p>
                      <p><span className="font-medium">Salary:</span> {applicationJob.salary}</p>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={closeApplicationModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      disabled={applying}
                    >
                      {applying ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;