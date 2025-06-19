import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import * as XLSX from 'xlsx';
axios.defaults.withCredentials = true;
import { 
  FaUserGraduate, 
  FaChevronRight, 
  FaTicketAlt, 
  FaChartLine,
  FaPlus,
  FaTimes,
  FaFileExcel
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import CollegeSettingsModal from './CollegeSettingsModal';
import Loader from '../components/Loader';

const apiUrl = import.meta.env.VITE_API_URL;

const AddStudents = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [excelUploadSuccess, setExcelUploadSuccess] = useState(false);
  const [excelUploadError, setExcelUploadError] = useState(null);
  const [skipInserting, setSkipInserting] = useState(false);
  const [students, setStudents] = useState([{
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    batch: '',
    joiningYear: '',
    graduationYear: '',
    cgpa: '',
    password: ''
  }]);

  const navItems = [
    { label: 'Dashboard', href: `/college/${collegeId}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${collegeId}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${collegeId}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${collegeId}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${collegeId}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${collegeId}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: college?.name || 'College Admin',
    role: 'Administrator',
    initials: college?.name ? college.name.substring(0, 2).toUpperCase() : 'CA'
  };

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/colleges/${collegeId}`);
        setCollege(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading college information');
        setLoading(false);
      }
    };

    fetchCollege();
  }, [collegeId]);

  const handleAddStudent = () => {
    setStudents([...students, {
      name: '',
      email: '',
      rollNumber: '',
      department: '',
      batch: '',
      joiningYear: '',
      graduationYear: '',
      cgpa: '',
      password: ''
    }]);
  };

  const handleRemoveStudent = (index) => {
    const newStudents = [...students];
    newStudents.splice(index, 1);
    setStudents(newStudents);
  };

  const handleStudentChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
    setSuccess(false);
    setError(null);
  };

  const handleExcelSubmit = async (e, skipDuplicates = false) => {
    if (e) e.preventDefault();
    setExcelUploadLoading(true);
    setExcelUploadSuccess(false);
    setExcelUploadError(null);

    console.log('collegeId for Excel upload:', collegeId);
    if (!collegeId) {
      setExcelUploadError('College ID is missing. Please access this page from the correct college dashboard URL.');
      setExcelUploadLoading(false);
      return;
    }

    if (!excelFile) {
      setExcelUploadError('Please select an Excel file to upload.');
      setExcelUploadLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('collegeId', collegeId);
      const url = skipDuplicates
        ? `${apiUrl}/api/students/excel-sheet?query=skip-duplicates`
        : `${apiUrl}/api/students/excel-sheet`;
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.message && response.data.message.includes('No new students to insert')) {
        setExcelUploadError(response.data.message);
        setExcelUploadSuccess(false);
      } else if (response.data && response.data.message) {
        setExcelUploadSuccess(response.data.message);
        setExcelFile(null);
        setExcelUploadError(null);
      } else {
        setExcelUploadSuccess('Excel sheet uploaded successfully!');
        setExcelFile(null);
        setExcelUploadError(null);
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.existingStudents) {
        const duplicates = err.response.data.existingStudents
          .map(s => `<span style='color:#F59E0B'>• Email: <b>${s.email}</b>, Roll: <b>${s.rollNumber}</b></span>`)
          .join('<br/>');
        setExcelUploadError(
          `<div>Some students already exist:<br/>${duplicates}</div>`
        );
      } else {
        setExcelUploadError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Error uploading Excel sheet'
        );
      }
    } finally {
      setExcelUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Add college ID to each student
      const studentsWithCollege = students.map(student => ({
        ...student,
        college: collegeId
      }));

      await axios.post(`${apiUrl}/api/students/bulk`, studentsWithCollege);
      setSuccess(true);
      setStudents([{
        name: '',
        email: '',
        rollNumber: '',
        department: '',
        batch: '',
        joiningYear: '',
        graduationYear: '',
        cgpa: '',
        password: ''
      }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding students');
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeUpdate = (updatedCollege) => {
    setCollege(updatedCollege);
  };

  // Helper to check if error is a duplicate list
  const isDuplicateList = excelUploadError && /Some students already exist/.test(excelUploadError);
  const isAllDuplicatesInfo = typeof excelUploadError === 'string' && excelUploadError.includes('No new students to insert');

  if (loading && !college) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
        <div className='main-container' style={{ marginLeft: 260, padding: '2rem', width: '100%' }}>
          <SearchBar onSettingsClick={() => setShowSettings(true)} />
          <Loader message="Loading college data..." />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="CAMPUS SERVICES" />
      <div className='main-container' style={{ 
        marginLeft: 260, 
        padding: '1rem',
        width: 'calc(100% - 260px)',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <SearchBar onSettingsClick={() => setShowSettings(true)} />
        
        <div style={{ 
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Add Students
          </h1>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#dcfce7',
              color: '#059669',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              Students added successfully!
            </div>
          )}

          {/* Excel Upload Section */}
          <div style={{ 
            background: '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '2px dashed #d1d5db'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaFileExcel style={{ color: '#059669' }} />
              Upload Students from Excel
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Upload an Excel file with student information. The file should have the following columns:
              <b>Name, Email, Roll Number, Department, Batch, Joining Year, Graduation Year, CGPA, Password</b>
            </p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            />
            <button
              onClick={() => handleExcelSubmit(null)}
              disabled={excelUploadLoading || !excelFile}
              style={{
                background: '#059669',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: excelUploadLoading || !excelFile ? 'not-allowed' : 'pointer',
                opacity: excelUploadLoading || !excelFile ? 0.6 : 1
              }}
            >
              {excelUploadLoading ? 'Submitting...' : 'Submit Excel Sheet'}
            </button>
            {excelUploadSuccess && (
              <div style={{
                background: '#dcfce7',
                color: '#059669',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                fontWeight: 500
              }}>
                {excelUploadSuccess}
              </div>
            )}
            {excelUploadError && (
              <div style={{ position: 'relative', marginBottom: isDuplicateList ? '2.5rem' : undefined }}>
                <div
                  style={{
                    background: isAllDuplicatesInfo ? '#FEF08A' : '#fee2e2',
                    color: isAllDuplicatesInfo ? '#92400E' : '#dc2626',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginTop: '1rem',
                    maxHeight: isDuplicateList ? 220 : undefined,
                    overflowY: isDuplicateList ? 'auto' : undefined,
                    position: 'relative',
                    fontWeight: isAllDuplicatesInfo ? 500 : undefined
                  }}
                  dangerouslySetInnerHTML={{ __html: excelUploadError }}
                />
                {isDuplicateList && excelFile && (
                  <button
                    onClick={() => handleExcelSubmit(null, true)}
                    style={{
                      position: 'absolute',
                      right: '1.5rem',
                      bottom: '-2.2rem',
                      background: '#F59E0B',
                      color: '#fff',
                      padding: '0.6rem 1.2rem',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: excelUploadLoading ? 'not-allowed' : 'pointer',
                      opacity: excelUploadLoading ? 0.7 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                    disabled={excelUploadLoading}
                  >
                    Skip and Insert Non-Duplicates
                  </button>
                )}
              </div>
            )}
          </div>
           <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Add Manually
          </h1>
          <form onSubmit={handleSubmit}>
            {students.map((student, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                    Student {index + 1}
                  </h2>
                  {students.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={student.email}
                      onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={student.rollNumber}
                      onChange={(e) => handleStudentChange(index, 'rollNumber', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Department *
                    </label>
                    <select
                      value={student.department}
                      onChange={(e) => handleStudentChange(index, 'department', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    >
                      <option value="">Select Department</option>
                      {college?.departments?.map(dept => (
                        <option key={dept.code} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Batch *
                    </label>
                    <select
                      value={student.batch}
                      onChange={(e) => handleStudentChange(index, 'batch', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    >
                      <option value="">Select Batch</option>
                      {['1st', '2nd', '3rd', '4th'].map(year => (
                        <option key={year} value={year}>{year} Year</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Joining Year *
                    </label>
                    <input
                      type="number"
                      value={student.joiningYear}
                      onChange={(e) => handleStudentChange(index, 'joiningYear', e.target.value)}
                      required
                      min="2000"
                      max="2100"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      value={student.graduationYear}
                      onChange={(e) => handleStudentChange(index, 'graduationYear', e.target.value)}
                      required
                      min="2000"
                      max="2100"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4b5563' }}>
                      CGPA *
                    </label>
                    <input
                      type="number"
                      value={student.cgpa}
                      onChange={(e) => handleStudentChange(index, 'cgpa', e.target.value)}
                      required
                      min="0"
                      max="10"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        background: '#fff'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleAddStudent}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#F59E0B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <FaPlus /> Add Another Student
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <Loader message="Adding students..." />
                ) : 'Add Students'}
              </button>
            </div>
          </form>
        </div>

        {/* Settings Modal */}
        <CollegeSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          college={college}
          onUpdate={handleCollegeUpdate}
        />
      </div>
    </div>
  );
};

export default AddStudents; 