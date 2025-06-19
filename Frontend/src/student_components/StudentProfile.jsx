import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaBriefcase, FaBuilding, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const apiUrl = import.meta.env.VITE_API_URL;

const StudentProfile = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internships, setInternships] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loadingData, setLoadingData] = useState({
    internships: true,
    jobs: true,
    interviews: true
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/college-students/${studentId}`);
        setStudent(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchInternships = async () => {
      try {
        setLoadingData(prev => ({ ...prev, internships: true }));
        const response = await axios.get(`${apiUrl}/api/internships/student/${studentId}`);
        setInternships(response.data);
      } catch (err) {
        console.error('Error fetching internships:', err);
      } finally {
        setLoadingData(prev => ({ ...prev, internships: false }));
      }
    };

    const fetchJobs = async () => {
      try {
        setLoadingData(prev => ({ ...prev, jobs: true }));
        const response = await axios.get(`${apiUrl}/api/jobs/student/${studentId}`);
        setJobs(response.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoadingData(prev => ({ ...prev, jobs: false }));
      }
    };

    const fetchInterviews = async () => {
      try {
        setLoadingData(prev => ({ ...prev, interviews: true }));
        const response = await axios.get(`${apiUrl}/api/interviews/student/${studentId}`);
        setInterviews(response.data);
      } catch (err) {
        console.error('Error fetching interviews:', err);
      } finally {
        setLoadingData(prev => ({ ...prev, interviews: false }));
      }
    };

    fetchStudentData();
    fetchInternships();
    fetchJobs();
    fetchInterviews();
  }, [studentId]);

  const renderInternships = () => {
    if (loadingData.internships) {
      return <div className="loading">Loading internships...</div>;
    }

    if (!internships || internships.length === 0) {
      return (
        <div className="no-data">
          No internships found
        </div>
      );
    }

    return (
      <div className="internships-list">
        {internships.map((internship) => (
          <div key={internship._id} className="internship-card">
            <div className="internship-header">
              <h3>{internship.title}</h3>
              <span className={`status ${internship.status}`}>{internship.status}</span>
            </div>
            <div className="internship-details">
              <p><FaBuilding /> {internship.companyId?.name || 'Company'}</p>
              <p><FaCalendarAlt /> {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}</p>
              <p>Stipend: ₹{internship.stipend}</p>
              <p>Mode: {internship.mode}</p>
            </div>
            {internship.feedback && (
              <div className="feedback">
                <h4>Feedback</h4>
                <div className="scores">
                  <div>Technical: {internship.feedback.technicalScore || 'N/A'}</div>
                  <div>Communication: {internship.feedback.communicationScore || 'N/A'}</div>
                  <div>Problem Solving: {internship.feedback.problemSolvingScore || 'N/A'}</div>
                  <div>Overall: {internship.feedback.overallScore || 'N/A'}</div>
                </div>
                {internship.feedback.comments && (
                  <p className="comments">{internship.feedback.comments}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderJobs = () => {
    if (loadingData.jobs) {
      return <div className="loading">Loading jobs...</div>;
    }

    if (!jobs || jobs.length === 0) {
      return (
        <div className="no-data">
          No jobs found
        </div>
      );
    }

    return (
      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job._id} className="job-card">
            <div className="job-header">
              <h3>{job.title}</h3>
              <span className={`status ${job.status}`}>{job.status}</span>
            </div>
            <div className="job-details">
              <p><FaBuilding /> {job.companyId?.name || 'Company'}</p>
              <p><FaCalendarAlt /> {new Date(job.startDate).toLocaleDateString()}</p>
              <p>Salary: ₹{job.salary}</p>
              <p>Mode: {job.mode}</p>
            </div>
            {job.feedback && (
              <div className="feedback">
                <h4>Feedback</h4>
                <div className="scores">
                  <div>Technical: {job.feedback.technicalScore || 'N/A'}</div>
                  <div>Communication: {job.feedback.communicationScore || 'N/A'}</div>
                  <div>Problem Solving: {job.feedback.problemSolvingScore || 'N/A'}</div>
                  <div>Overall: {job.feedback.overallScore || 'N/A'}</div>
                </div>
                {job.feedback.comments && (
                  <p className="comments">{job.feedback.comments}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInterviews = () => {
    if (loadingData.interviews) {
      return <div className="loading">Loading interviews...</div>;
    }

    if (!interviews || interviews.length === 0) {
      return (
        <div className="no-data">
          No interviews scheduled
        </div>
      );
    }

    return (
      <div className="interviews-list">
        {interviews.map((interview) => (
          <div key={interview._id} className="interview-card">
            <div className="interview-header">
              <h3>{interview.role}</h3>
              <span className={`status ${interview.status}`}>{interview.status}</span>
            </div>
            <div className="interview-details">
              <p><FaBuilding /> {interview.companyId?.name || 'Company'}</p>
              <p><FaCalendarAlt /> {new Date(interview.date).toLocaleString()}</p>
              {interview.link && (
                <p><a href={interview.link} target="_blank" rel="noopener noreferrer">Join Interview</a></p>
              )}
            </div>
            {interview.feedback && (
              <div className="feedback">
                <h4>Feedback</h4>
                <div className="scores">
                  <div>Technical: {interview.feedback.technicalScore || 'N/A'}</div>
                  <div>Communication: {interview.feedback.communicationScore || 'N/A'}</div>
                  <div>Problem Solving: {interview.feedback.problemSolvingScore || 'N/A'}</div>
                  <div>Overall: {interview.feedback.overallScore || 'N/A'}</div>
                </div>
                {interview.feedback.comments && (
                  <p className="comments">{interview.feedback.comments}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="student-profile">
      <div className="profile-header">
        <img src={student?.profileImage} alt={student?.name} className="profile-image" />
        <div className="profile-info">
          <h1>{student?.name}</h1>
          <p>{student?.department} • Roll Number: {student?.rollNumber}</p>
          <p>Batch: {student?.batch} • CGPA: {student?.cgpa}</p>
        </div>
      </div>

      <div className="profile-sections">
        <section className="internships-section">
          <h2><FaBriefcase /> Internships</h2>
          {renderInternships()}
        </section>

        <section className="jobs-section">
          <h2><FaBriefcase /> Jobs</h2>
          {renderJobs()}
        </section>

        <section className="interviews-section">
          <h2><FaCalendarAlt /> Interviews</h2>
          {renderInterviews()}
        </section>
      </div>

      <style jsx>{`
        .student-profile {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .profile-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-info h1 {
          margin: 0;
          color: #1e293b;
        }

        .profile-info p {
          margin: 0.5rem 0;
          color: #64748b;
        }

        .profile-sections {
          display: grid;
          gap: 2rem;
        }

        section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        section h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          color: #1e293b;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 8px;
          color: #64748b;
        }

        .internship-card, .job-card, .interview-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .internship-header, .job-header, .interview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .internship-header h3, .job-header h3, .interview-header h3 {
          margin: 0;
          color: #1e293b;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status.offered { background: #dbeafe; color: #1e40af; }
        .status.accepted { background: #dcfce7; color: #166534; }
        .status.rejected { background: #fee2e2; color: #991b1b; }
        .status.completed { background: #f3e8ff; color: #6b21a8; }
        .status.scheduled { background: #fef3c7; color: #92400e; }
        .status.cancelled { background: #fee2e2; color: #991b1b; }

        .internship-details, .job-details, .interview-details {
          display: grid;
          gap: 0.5rem;
          color: #64748b;
        }

        .internship-details p, .job-details p, .interview-details p {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .feedback {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .feedback h4 {
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .scores {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .comments {
          color: #64748b;
          font-style: italic;
        }

        a {
          color: #3b82f6;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default StudentProfile; 