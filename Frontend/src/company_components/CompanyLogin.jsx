import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import './CompanyLogin.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialRegisterData = {
  name: '',
  type: '',
  industry: '',
  website: '',
  location: '',
  contactEmail: '',
  contactPhone: '',
  adminContact: { name: '', email: '', phone: '', designation: '' },
  companySize: '',
  foundedYear: '',
  description: ''
};

const demoCompanyData = {
  name: 'Techori Solutions',
  type: 'Startup',
  industry: 'Technology',
  website: 'https://techorisolutions.com',
  location: 'Bangalore, Karnataka',
  contactEmail: 'contact@techorisolutions.com',
  contactPhone: '+91 9876543210',
  adminContact: {
    name: 'John Doe',
    email: 'john@techorisolutions.com',
    phone: '+91 9876543211',
    designation: 'CEO'
  },
  companySize: '51-200',
  foundedYear: '2023',
  description: 'Techori Solutions is a cutting-edge technology company specializing in AI and machine learning solutions. We focus on developing innovative software products and providing digital transformation services to businesses worldwide.'
};

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState(initialRegisterData);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerStep, setRegisterStep] = useState(1);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTime, setResendTime] = useState(60);
  const [otpInputs, setOtpInputs] = useState(Array(6).fill(''));
  const otpInputRefs = useRef([]);
  const [otpStatus, setOtpStatus] = useState('idle');
  const [registerType, setRegisterType] = useState('company');

  useEffect(() => {
    let timer;
    if (showRegister && registerStep === 2) {
      setResendDisabled(true);
      setResendTime(60);
      timer = setInterval(() => {
        setResendTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [showRegister, registerStep]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/auth/company-admin`, formData, { withCredentials: true });
      const { _id, name, role } = response.data;

      localStorage.setItem('companyId', _id);
      localStorage.setItem('companyName', name);
      localStorage.setItem('userRole', role);

      navigate(`/company/${_id}/dashboard`);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setRegisterData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setRegisterData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOtpInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = value;
      setOtpInputs(newOtpInputs);

      if (value && index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }

      if (newOtpInputs.every(input => input !== '')) {
        checkOtpVerificationStatus(newOtpInputs.join(''));
      }
    }
  };

  const checkOtpVerificationStatus = async (otp) => {
    setOtpStatus('verifying');
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const res = await axios.post(`${apiUrl}/api/auth/register/check-otp`, {
        email: registerData.contactEmail,
        otp: otp,
        type: 'company'
      });

      if (res.data.valid) {
        setOtpStatus('verified');
      } else {
        setOtpStatus('error');
        setRegisterError(res.data.error || 'Invalid OTP.');
        setOtpInputs(Array(6).fill(''));
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }
    } catch (err) {
      setOtpStatus('error');
      setRegisterError(err.response?.data?.error || 'Error verifying OTP.');
      setOtpInputs(Array(6).fill(''));
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendTime(60);
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const res = await axios.post(`${apiUrl}/api/${registerType}/register/initiate`, {
        ...registerData,
        type: registerType
      });
      setRegisterSuccess('New OTP sent to your email.');
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Error resending OTP.');
    }
  };

  const handleRegisterInfoSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setEmailCheckLoading(true);
    try {
      // Only send the necessary fields for the first step
      const registrationData = {
        name: registerData.name,
        type: registerData.type,
        industry: registerData.industry,
        website: registerData.website,
        location: registerData.location,
        contactEmail: registerData.contactEmail,
        contactPhone: registerData.contactPhone,
        adminContact: registerData.adminContact,
        companySize: registerData.companySize,
        foundedYear: registerData.foundedYear,
        description: registerData.description
      };

      const res = await axios.post(`${apiUrl}/api/company/register/initiate`, registrationData);

      setRegisterSuccess(res.data.message || 'OTP sent to your email.');
      setRegisterStep(2);
    } catch (err) {
      console.error('Error initiating registration:', err);
      setRegisterError(err.response?.data?.error || 'Error initiating registration. Please try again.');
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);
    try {
      const password = e.target.password.value;
      const confirmPassword = e.target.confirmPassword.value;

      if (!password || !confirmPassword) {
        setRegisterError('Please enter both password and confirm password.');
        return;
      }

      if (password !== confirmPassword) {
        setRegisterError('Password and Confirm Password do not match.');
        return;
      }

      const res = await axios.post(`${apiUrl}/api/company/register/verify`, {
        email: registerData.contactEmail,
        otp: otpInputs.join(''),
        password: password,
        confirmPassword: confirmPassword
      });

      setRegisterSuccess('Registration successful! Redirecting to login...');
      
      // Wait for 2 seconds to show the success message
      setTimeout(() => {
        setShowRegister(false);
        setRegisterStep(1);
        setRegisterData(initialRegisterData);
        setOtpInputs(Array(6).fill(''));
        setOtpStatus('idle');
      }, 2000);

    } catch (err) {
      console.error('Error completing registration:', err);
      setRegisterError(err.response?.data?.error || 'Error completing registration. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLoadDemoData = () => {
    setRegisterData(demoCompanyData);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F3F4F6',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            color: '#10B981',
            fontSize: '4rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <FaBuilding />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1F2937',
            marginBottom: '1rem'
          }}>
            {showRegister ? (registerStep === 1 ? `Register ${registerType === 'company' ? 'Company' : 'Employee'}` : 'Verify Email & Set Password') : 'Company Admin Login'}
          </h1>
          <p style={{
            color: '#6B7280',
            fontSize: '1.1rem'
          }}>
            {showRegister ? (registerStep === 1 ? `Fill the form to register your ${registerType}` : 'Enter the OTP sent to your email and set a secure password') : 'Sign in to access your company dashboard'}
          </p>
        </div>

        {!showRegister && (
          <>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#374151',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Enter your company admin email"
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  color: '#374151',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div style={{
                  color: '#DC2626',
                  fontSize: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  padding: '1rem',
                  background: '#FEE2E2',
                  borderRadius: '0.5rem'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setShowRegister(true); setRegisterType('company'); }}
                style={{
                  background: '#510bf5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'background 0.2s'
                }}
              >
                Register Company
              </button>
              <button
                type="button"
                onClick={() => { setShowRegister(true); setRegisterType('employee'); }}
                style={{
                  background: '#be0bf5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginLeft: '1rem',
                  transition: 'background 0.2s'
                }}
              >
                Register Employee
              </button>
            </div>
          </>
        )}

        {showRegister && (
          <div className={`register-form-anim ${showRegister ? 'show' : ''}`}>
            <form
              onSubmit={handleRegisterInfoSubmit}
              style={{
                display: registerStep === 1 ? 'block' : 'none',
                opacity: registerStep === 1 ? 1 : 0,
                transition: 'opacity 0.5s',
                marginTop: '1rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {registerType === 'company' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, color: '#374151' }}>Company Details</h3>
                      <button
                        type="button"
                        onClick={handleLoadDemoData}
                        style={{
                          background: '#F3F4F6',
                          color: '#374151',
                          border: '1px solid #D1D5DB',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Load Demo Data
                      </button>
                    </div>
                    <input name="name" value={registerData.name} onChange={handleRegisterChange} required placeholder="Company Name" style={inputStyle} />
                    <select name="type" value={registerData.type} onChange={handleRegisterChange} required style={inputStyle}>
                      <option value="">Select Company Type</option>
                      <option value="MNC">MNC</option>
                      <option value="Startup">Startup</option>
                      <option value="SME">SME</option>
                      <option value="Government">Government</option>
                      <option value="NGO">NGO</option>
                      <option value="Other">Other</option>
                    </select>
                    <input name="industry" value={registerData.industry} onChange={handleRegisterChange} required placeholder="Industry" style={inputStyle} />
                    <input name="website" value={registerData.website} onChange={handleRegisterChange} placeholder="Website" style={inputStyle} />
                    <input name="location" value={registerData.location} onChange={handleRegisterChange} required placeholder="Location" style={inputStyle} />
                    <input name="contactEmail" value={registerData.contactEmail} onChange={handleRegisterChange} required placeholder="Contact Email" style={inputStyle} />
                    <input name="contactPhone" value={registerData.contactPhone} onChange={handleRegisterChange} required placeholder="Contact Phone" style={inputStyle} />
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#f9fafb' }}>
                      <h4 style={{ margin: 0, color: '#10B981' }}>Admin Contact</h4>
                      <input name="adminContact.name" value={registerData.adminContact.name} onChange={handleRegisterChange} required placeholder="Admin Name" style={inputStyle} />
                      <input name="adminContact.email" value={registerData.adminContact.email} onChange={handleRegisterChange} required placeholder="Admin Email" style={inputStyle} />
                      <input name="adminContact.phone" value={registerData.adminContact.phone} onChange={handleRegisterChange} required placeholder="Admin Phone" style={inputStyle} />
                      <input name="adminContact.designation" value={registerData.adminContact.designation} onChange={handleRegisterChange} required placeholder="Admin Designation" style={inputStyle} />
                    </div>
                    <select name="companySize" value={registerData.companySize} onChange={handleRegisterChange} required style={inputStyle}>
                      <option value="">Select Company Size</option>
                      <option value="1-50">1-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    <input name="foundedYear" value={registerData.foundedYear} onChange={handleRegisterChange} required placeholder="Founded Year" style={inputStyle} />
                    <textarea name="description" value={registerData.description} onChange={handleRegisterChange} required placeholder="Company Description" style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
                  </>
                ) : (
                  <>
                    <input name="name" value={registerData.name} onChange={handleRegisterChange} required placeholder="Full Name" style={inputStyle} />
                    <input name="contactEmail" value={registerData.contactEmail} onChange={handleRegisterChange} required placeholder="Email" style={inputStyle} />
                    <input name="contactPhone" value={registerData.contactPhone} onChange={handleRegisterChange} required placeholder="Phone" style={inputStyle} />
                    <input name="department" value={registerData.department} onChange={handleRegisterChange} required placeholder="Department" style={inputStyle} />
                    <input name="position" value={registerData.position} onChange={handleRegisterChange} required placeholder="Position" style={inputStyle} />
                  </>
                )}
                {registerError && <div style={{ color: '#DC2626', background: '#FEE2E2', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>{registerError}</div>}
                <button type="submit" disabled={emailCheckLoading} style={{ ...inputStyle, background: '#10B981', color: 'white', fontWeight: 'bold', cursor: emailCheckLoading ? 'not-allowed' : 'pointer', opacity: emailCheckLoading ? 0.7 : 1 }}>
                  {emailCheckLoading ? 'Verifying...' : 'Next: Set Password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRegister(false); setRegisterStep(1); }}
                  style={{
                    background: '#510bf5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    transition: 'background 0.2s'
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>

            <form
              onSubmit={handleRegisterSubmit}
              style={{
                display: registerStep === 2 ? 'block' : 'none',
                opacity: registerStep === 2 ? 1 : 0,
                transition: 'opacity 0.5s',
                marginTop: '1rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {Array(6).fill('').map((_, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
                      type="text"
                      maxLength="1"
                      value={otpInputs[index]}
                      onChange={(e) => handleOtpInputChange(e, index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
                          otpInputRefs.current[index - 1].focus();
                        }
                      }}
                      style={{
                        ...inputStyle,
                        width: '40px',
                        height: '40px',
                        textAlign: 'center',
                        padding: '0.5rem 0',
                        marginBottom: '0',
                        borderColor: otpStatus === 'error' ? '#EF4444' : (otpStatus === 'verified' ? '#10B981' : '#D1D5DB')
                      }}
                    />
                  ))}
                  <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {otpStatus === 'verifying' && <span style={{ fontSize: '1.2rem' }}>...</span>}
                    {otpStatus === 'verified' && <span style={{ color: '#10B981', fontSize: '1.5rem' }}>✅</span>}
                    {otpStatus === 'error' && <span style={{ color: '#EF4444', fontSize: '1.5rem' }}>❌</span>}
                  </div>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
                    style={{
                      background: resendDisabled ? '#D1D5DB' : '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: resendDisabled ? 'not-allowed' : 'pointer',
                      marginTop: '0',
                      width: 'fit-content'
                    }}
                  >
                    {resendDisabled ? `Resend OTP (${resendTime}s)` : 'Resend OTP'}
                  </button>
                </div>

                {registerError && <div style={{ color: '#DC2626', background: '#FEE2E2', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>{registerError}</div>}
                {registerSuccess && <div style={{ color: '#059669', background: '#D1FAE5', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>{registerSuccess}</div>}

                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Set Password</h4>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Set Password"
                    style={inputStyle}
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm Password"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={registerLoading || otpStatus !== 'verified'}
                  style={{
                    ...inputStyle,
                    background: '#10B981',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: (registerLoading || otpStatus !== 'verified') ? 'not-allowed' : 'pointer',
                    opacity: (registerLoading || otpStatus !== 'verified') ? 0.7 : 1
                  }}
                >
                  {registerLoading ? 'Registering...' : `Register ${registerType === 'company' ? 'Company' : 'Employee'}`}
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterStep(1)}
                  style={{
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    transition: 'background 0.2s'
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '1rem',
          color: '#6B7280'
        }}>
          <p>Don't have an account? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #D1D5DB',
  fontSize: '1rem',
  outline: 'none',
  marginBottom: '0.5rem',
  transition: 'border-color 0.2s'
};

export default CompanyLogin; 