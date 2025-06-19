import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Target, ShieldAlert, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    if (!studentId) {
      window.location.href = '/student-login';
    }
  }, [studentId]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/api/studentsProfile/${studentId}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchProfileData();
  }, [studentId, isEditing]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl('');
    setProfilePicFile(null);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddArrayItem = (field, emptyObj) => {
    handleInputChange(field, [...(profileData[field] || []), emptyObj]);
  };

  const handleRemoveArrayItem = (field, idx) => {
    const arr = [...(profileData[field] || [])];
    arr.splice(idx, 1);
    handleInputChange(field, arr);
  };

  const handleArrayItemChange = (field, idx, key, value) => {
    const arr = [...(profileData[field] || [])];
    arr[idx][key] = value;
    handleInputChange(field, arr);
  };

  const handleSave = async () => {
    try {
      // Update main profile
      const response = await fetch(`${API_URL}/api/studentsProfile/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/auth';
        return;
      }
      if (!response.ok) throw new Error('Failed to update profile');
      let data = await response.json();

      // Upload profile pic if selected
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);
        const picRes = await fetch(`${API_URL}/api/studentsProfile/${studentId}/profile-pic`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (picRes.ok) {
          data = await picRes.json();
        }
      }

      setProfileData(data);
      setIsEditing(false);
      setPreviewUrl('');
      setProfilePicFile(null);
    } catch  {
      alert('Failed to update profile');
    }
  };

  // Handle complete verification button click
  const handleVerification = () => {
    window.location.href = '/profile?tab=verification';
  };

  if (loading) {
    return <div className="p-10 text-center text-lg">Loading...</div>;
  }

  if (!profileData) {
    return <div className="p-10 text-center text-gray-500">No profile data found.</div>;
  }

  // Get profile pic URL for <img> tag
  const getProfilePicUrl = () => {
    if (previewUrl) return previewUrl;
    if (profileData && profileData._id)
      return `${API_URL}/api/studentsProfile/${profileData._id}/profile-pic?${Date.now()}`;
    if (profileData && profileData.profileImage) return profileData.profileImage;
    return '';
  };

  // Helper to render array values nicely
  const renderArray = arr => Array.isArray(arr) ? arr.join(', ') : '';

  // Helper for sub-array rendering (projects, etc.)
  const renderSubArray = (arr, fields) =>
    Array.isArray(arr) && arr.length
      ? arr.map((item, idx) => (
          <div key={idx} className="mb-3 border-b border-gray-100 pb-2 last:pb-0 last:border-b-0">
            {fields.map(f => item[f] && (
              <div key={f}><span className="font-medium">{f}:</span> {Array.isArray(item[f]) ? item[f].join(', ') : item[f]}</div>
            ))}
          </div>
        ))
      : <span className="italic text-gray-400">None</span>;

  // Field definitions for dynamic array editing
  const PROJECT_FIELDS = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "technologies", label: "Technologies (comma separated)" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "link", label: "Link" }
  ];
  const ACHIEVEMENT_FIELDS = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "date", label: "Date", type: "date" },
    { key: "issuer", label: "Issuer" }
  ];
  const CERTIFICATION_FIELDS = [
    { key: "name", label: "Name" },
    { key: "issuer", label: "Issuer" },
    { key: "date", label: "Date", type: "date" },
    { key: "link", label: "Link" }
  ];
  const EXTRACURRICULAR_FIELDS = [
    { key: "activity", label: "Activity" },
    { key: "role", label: "Role" },
    { key: "achievement", label: "Achievement" }
  ];
  const RESEARCH_FIELDS = [
    { key: "title", label: "Title" },
    { key: "role", label: "Role" },
    { key: "year", label: "Year", type: "number" },
    { key: "description", label: "Description" }
  ];
  const HACKATHON_FIELDS = [
    { key: "name", label: "Name" },
    { key: "year", label: "Year", type: "number" },
    { key: "achievement", label: "Achievement" },
    { key: "description", label: "Description" }
  ];

  // Dynamic array input section
  function ArraySection({ label, field, fields, emptyObj }) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{label}</h3>
        {isEditing ? (
          <>
            {(profileData[field] || []).map((item, idx) => (
              <div key={idx} className="mb-4 p-3 bg-gray-50 rounded border relative">
                {fields.map(({ key, label, type }) => (
                  <div key={key} className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      type={type || "text"}
                      value={Array.isArray(item[key]) ? item[key].join(', ') : (item[key] || '')}
                      onChange={e =>
                        handleArrayItemChange(
                          field, idx, key,
                          type === "number"
                            ? Number(e.target.value)
                            : key === "technologies"
                              ? e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              : e.target.value
                        )
                      }
                      placeholder={label}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="absolute top-2 right-2 text-red-500 text-xs px-2 py-1 rounded hover:bg-red-100"
                  onClick={() => handleRemoveArrayItem(field, idx)}
                >Remove</button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-200 px-3 py-1 rounded"
              onClick={() => handleAddArrayItem(field, { ...emptyObj })}
            >+ Add {label.split(' ')[0]}</button>
          </>
        ) : (
          renderSubArray(profileData[field], fields.map(f => f.key))
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop and mobile */}
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
        <div className="bg-gray-50 min-h-full">
          <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <User className="text-gray-600" size={20} />
                <h1 className="text-lg font-medium text-gray-900">Complete Profile</h1>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Edit Profile</button>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                  {isEditing ? (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      {previewUrl || (profileData && (profileData._id || profileData.profileImage)) ? (
                        <img
                          src={getProfilePicUrl()}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white font-bold text-3xl">
                          {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : ''}
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfilePicFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <span className="text-xs mt-1 bg-white bg-opacity-60 rounded px-2 py-1 text-blue-700">Change</span>
                    </label>
                  ) : (
                    (profileData && (profileData._id || profileData.profileImage)) ? (
                      <img src={getProfilePicUrl()} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : ''}
                      </span>
                    )
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input type="text" value={profileData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your name" />
                      <input type="text" value={profileData.headline || ''} onChange={(e) => handleInputChange('headline', e.target.value)} className="text-lg text-gray-600 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none w-full" placeholder="Enter your profile headline" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h2>
                      <p className="text-lg text-gray-600 mb-4">{profileData.headline}</p>
                    </>
                  )}

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-4">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} />
                      {isEditing ? (
                        <input type="email" value={profileData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter email" />
                      ) : (
                        <span>{profileData.email}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} />
                      {isEditing ? (
                        <input type="tel" value={profileData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter phone" />
                      ) : (
                        <span>{profileData.phone}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      {isEditing ? (
                        <input type="text" value={profileData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className="bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none" placeholder="Enter location" />
                      ) : (
                        <span>{profileData.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Objective */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2 text-red-600" size={20} />
                Career Objective
              </h3>
              {isEditing ? (
                <textarea
                  value={profileData.careerObjective || ''}
                  onChange={(e) => handleInputChange('careerObjective', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Describe your career objectives and goals..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profileData.careerObjective}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Student ID', field: 'studentId', icon: '🆔' },
                    { label: 'Date of Birth', field: 'dateOfBirth', icon: '📅', type: 'date' },
                    { label: 'Gender', field: 'gender', icon: '👤' },
                    { label: 'Nationality', field: 'nationality', icon: '🌍' }
                  ].map(({ label, field, icon, type }) => (
                    <div key={field} className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </label>
                      {isEditing ? (
                        <input
                          type={type || "text"}
                          value={profileData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      ) : (
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">{profileData[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Academic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar className="mr-2 text-green-600" size={20} />
                  Academic Information
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Degree', field: 'degree', icon: '🎓' },
                    { label: 'Major', field: 'major', icon: '📚' },
                    { label: 'Batch', field: 'batch', icon: '🎒' },
                    { label: 'Joining Year', field: 'joiningYear', icon: '🔰', type: 'number' },
                    { label: 'Graduation Year', field: 'graduationYear', icon: '🎓', type: 'number' },
                    { label: 'Year', field: 'year', icon: '📖', type: 'number' },
                    { label: 'GPA', field: 'gpa', icon: '📊', type: 'number' },
                    { label: 'CGPA', field: 'cgpa', icon: '📈', type: 'number' }
                  ].map(({ label, field, icon, type }) => (
                    <div key={field} className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">{icon}</span>
                        {label}
                      </label>
                      {isEditing ? (
                        <input
                          type={type || (typeof profileData[field] === "number" ? "number" : "text")}
                          value={profileData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      ) : (
                        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                          {profileData[field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Skills & Tech */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills & Technologies</h3>
                <div className="space-y-2">
                  {['skills', 'programmingLanguages', 'technologies'].map(field =>
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={renderArray(profileData[field])}
                          onChange={e => handleInputChange(field, e.target.value.split(',').map(i => i.trim()))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                          placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} (comma separated)`}
                        />
                      ) : (
                        <p className="bg-gray-50 p-3 rounded">{renderArray(profileData[field])}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Resume & Portfolio */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Resume & Portfolio</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resume (link)</label>
                    {isEditing ? (
                      <input type="text" value={profileData.resume || ''} onChange={e => handleInputChange('resume', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://your-resume-link" />
                    ) : (
                      profileData.resume
                        ? <a className="text-blue-600 underline" href={profileData.resume} target="_blank" rel="noopener noreferrer">{profileData.resume}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                    {isEditing ? (
                      <input type="text" value={profileData.portfolioUrl || ''} onChange={e => handleInputChange('portfolioUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://your-portfolio-link" />
                    ) : (
                      profileData.portfolioUrl
                        ? <a className="text-blue-600 underline" href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer">{profileData.portfolioUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    {isEditing ? (
                      <input type="text" value={profileData.githubUrl || ''} onChange={e => handleInputChange('githubUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://github.com/your-profile" />
                    ) : (
                      profileData.githubUrl
                        ? <a className="text-blue-600 underline" href={profileData.githubUrl} target="_blank" rel="noopener noreferrer">{profileData.githubUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    {isEditing ? (
                      <input type="text" value={profileData.linkedinUrl || ''} onChange={e => handleInputChange('linkedinUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200" placeholder="https://linkedin.com/in/your-profile" />
                    ) : (
                      profileData.linkedinUrl
                        ? <a className="text-blue-600 underline" href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer">{profileData.linkedinUrl}</a>
                        : <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Projects, Achievements, Certifications, Extracurricular, Research, Hackathons */}
            <ArraySection
              label="Projects"
              field="projects"
              fields={PROJECT_FIELDS}
              emptyObj={{ title: "", description: "", technologies: [], startDate: "", endDate: "", link: "" }}
            />
            <ArraySection
              label="Achievements"
              field="achievements"
              fields={ACHIEVEMENT_FIELDS}
              emptyObj={{ title: "", description: "", date: "", issuer: "" }}
            />
            <ArraySection
              label="Certifications"
              field="certifications"
              fields={CERTIFICATION_FIELDS}
              emptyObj={{ name: "", issuer: "", date: "", link: "" }}
            />
            <ArraySection
              label="Extracurricular Activities"
              field="extracurricular"
              fields={EXTRACURRICULAR_FIELDS}
              emptyObj={{ activity: "", role: "", achievement: "" }}
            />
            <ArraySection
              label="Research"
              field="research"
              fields={RESEARCH_FIELDS}
              emptyObj={{ title: "", role: "", year: "", description: "" }}
            />
            <ArraySection
              label="Hackathons"
              field="hackathons"
              fields={HACKATHON_FIELDS}
              emptyObj={{ name: "", year: "", achievement: "", description: "" }}
            />

            {/* Complete Verification Button */}
            <div className="flex justify-center mt-12 mb-4">
              <button
                onClick={handleVerification}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-xl font-semibold border border-yellow-200 hover:bg-yellow-200 transition-colors text-lg shadow"
                style={{ outline: 'none' }}
              >
                <ShieldAlert className="w-6 h-6" />
                Complete Your Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;