// import React from 'react';
import { FaUserGraduate } from 'react-icons/fa';
import LoginForm from '../components/LoginForm';

// const StudentLogin = () => {
//   return (
//     <LoginForm
//       type="Student"
//       icon={FaUserGraduate}
//       color="#3B82F6"
//       title="Student Login"
//       description="Sign in to access your student dashboard"
//       apiEndpoint="https://campusadmin.onrender.com/api/college-students/email"
//       redirectPath="/student-dashboard"
//     />
//   );
// };

// export default StudentLogin; 

import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../college_components/CollegeLogin.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// const apiUrl = 'http://localhost:5000';

const initialRegisterData = {
  university: '',
  name: '',
  studentName: '',
  rollno: '',
  contactEmail: '',
  contactPhone: '',
  gender: '',
  currentSem: '',
  adress: '',
  branch: ''
};

const demoCollegeData = {
  university: "RI University",
  name: "Techori Institute of Technology",
  studentName: "ABCD",
  rollno: "TIT2024",
  contactEmail: "contact@techoritech.edu",
  contactPhone: "+91 9876543210",
  gender: "Male",
  currentSem: "3/4",
  adress: "A-123, Techori Street, Silicon Valley",
  branch: "CSE"
};

const StudentLogin = () => {
  // const navigate = useNavigate();
  // const [formData, setFormData] = useState({
  //   email: '',
  //   password: ''
  // });
  // const [error, setError] = useState('');
  // const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState(initialRegisterData);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerStep, setRegisterStep] = useState(1); // 1: info, 2: password
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTime, setResendTime] = useState(60); // 60 seconds cooldown
  const [otpInputs, setOtpInputs] = useState(Array(6).fill(''));
  const otpInputRefs = useRef([]);
  const [otpStatus, setOtpStatus] = useState('idle'); // 'idle', 'verifying', 'verified', 'error'

  useEffect(() => {
    let timer;
    if (showRegister && registerStep === 2) {
      setResendDisabled(true);
      setResendTime(60); // Start cooldown when entering step 2
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
  }, [showRegister, registerStep]); // Depend on showRegister and registerStep

  // const handleChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value
  //   });
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   setLoading(true);

  //   try {
  //     const response = await axios.post(`${apiUrl}/api/auth/college-admin`, formData);
  //     const { _id, name, role } = response.data;

  //     // Store admin data in localStorage
  //     localStorage.setItem('collegeId', _id);
  //     localStorage.setItem('collegeName', name);
  //     localStorage.setItem('userRole', role);

  //     // Navigate to specific college dashboard
  //     navigate(`/college/${_id}/dashboard`);
  //   } catch (err) {
  //     console.error('Login error:', err);
  //     setError(err.response?.data?.error || 'Error during login. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
    
  };

  // const handleAddDepartment = () => {
  //   setRegisterData({
  //     ...registerData,
  //     departments: [...registerData.departments, { name: '', code: '' }]
  //   });
  // };

  // const handleRemoveDepartment = (idx) => {
  //   const departments = registerData.departments.filter((_, i) => i !== idx);
  //   setRegisterData({ ...registerData, departments });
  // };

  const handleRegisterInfoSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setEmailCheckLoading(true);
    try {
      // Send all registration data (except password) to initiate endpoint
      const res = await axios.post(`${apiUrl}/api/student/register/initiate`, {
        university: registerData.university,
        name: registerData.name,
        studentName: registerData.studentName,
        rollno: registerData.rollno,
        contactEmail: registerData.contactEmail,
        contactPhone: registerData.contactPhone,
        gender: registerData.gender,
        currentSem: registerData.currentSem,
        adress: registerData.adress,
        branch: registerData.branch
      });

      setRegisterSuccess(res.data.message || 'OTP sent to your email.');
      setRegisterStep(2); // Move to password/OTP step
    } catch (err) {
      console.error('Error initiating student registration:', err);
      setRegisterError(err.response?.data?.error || 'Error initiating registration. Please try again.');
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleLoadDemoData = () => {
    setRegisterData(demoCollegeData);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    const { contactEmail, password, confirmPassword } = registerData;
    const otp = otpInputs.join('');

    if (password !== confirmPassword) {
      setRegisterError('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 8) {
      setRegisterError('Password must be at least 8 characters long.');
      return;
    }

    if (otp.length !== 6) {
      setRegisterError('Please enter the complete 6-digit OTP.');
      return;
    }

    setRegisterLoading(true);
    try {
      await axios.post(`${apiUrl}/api/student/register/verify`, {
        email: contactEmail,
        otp: otp,
        password,
        confirmPassword
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
      console.error('Registration verification error:', err);
      setRegisterError(err.response?.data?.error || 'Error completing registration. Please try again.');
      setOtpInputs(Array(6).fill(''));
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
      setOtpStatus('error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true); // Disable button immediately
    setResendTime(60); // Reset timer
    setRegisterError(''); // Clear previous error
    setRegisterSuccess(''); // Clear previous success message

    try {
      // Send minimal data required by initiate endpoint to resend OTP
      await axios.post(`${apiUrl}/api/student/register/initiate`, {
        contactEmail: registerData.contactEmail,
        // Include other necessary identification if your backend initiate endpoint requires it, like type
        type: 'student', // Ensure type is sent
        // Send minimal data needed for re-initiation if backend allows
        // If backend initiate requires full data, send like in handleRegisterInfoSubmit
        university: registerData.university,
        name: registerData.name,
        studentName: registerData.studentName,
        rollno: registerData.rollno,
        contactPhone: registerData.contactPhone,
        gender: registerData.gender,
        currentSem: registerData.currentSem,
        adress: registerData.adress,
        branch: registerData.branch
      });
      setRegisterSuccess('New OTP sent to your email.');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setRegisterError(err.response?.data?.error || 'Error resending OTP. Please try again.');
      // If resend failed, maybe re-enable button after a shorter delay or based on error type
      // For now, let the timer handle re-enabling.
    }
  };

  const handleOtpInputChange = (e, index) => {
    const { value } = e.target;
    const newOtpInputs = [...otpInputs];

    // Ensure only a single digit is entered
    const digit = value.replace(/[^0-9]/g, ''); // Remove non-digits
    if (digit.length > 0) {
      newOtpInputs[index] = digit.slice(-1); // Take only the last digit entered
    } else {
      newOtpInputs[index] = '';
    }

    setOtpInputs(newOtpInputs);
    setOtpStatus('idle'); // Reset status whenever input changes

    // Move focus to the next input if a digit was entered and it's not the last input
    if (digit && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    } else if (!digit && index > 0 && otpInputRefs.current[index - 1]) { // Move focus back on backspace if empty
      // This part is handled by onKeyDown now, keeping this just in case, but primary logic is below
    }

    // Check if all digits are entered and trigger OTP verification check
    const fullOtp = newOtpInputs.join('');
    if (fullOtp.length === 6) {
      checkOtpVerificationStatus(fullOtp);
    }
  };

  const checkOtpVerificationStatus = async (otp) => {
    setOtpStatus('verifying');
    setRegisterError(''); // Clear previous errors related to registration submit
    setRegisterSuccess(''); // Clear previous success messages

    try {
      // Call the new backend endpoint to check OTP validity without completing registration
      const res = await axios.post(`${apiUrl}/api/register/check-otp`, {
        email: registerData.contactEmail,
        otp: otp,
        type: 'student' // Specify the type
      });

      if (res.data.valid) {
        setOtpStatus('verified');
        // Optional: Show a success message specifically for OTP verification
        // setRegisterSuccess('OTP verified successfully!');
      } else {
        // If backend says invalid, show error
        setOtpStatus('error');
        setRegisterError(res.data.error || 'Invalid OTP.');
         // Clear OTP inputs on error for security/usability
         setOtpInputs(Array(6).fill(''));
         if (otpInputRefs.current[0]) {
           otpInputRefs.current[0].focus(); // Focus first input
         }
      }
    } catch (err) {
      console.error('OTP verification check error:', err);
      // Handle network errors or other unexpected errors
      setOtpStatus('error');
      setRegisterError(err.response?.data?.error || 'Error verifying OTP.');
       // Clear OTP inputs on error
       setOtpInputs(Array(6).fill(''));
        if (otpInputRefs.current[0]) {
           otpInputRefs.current[0].focus(); // Focus first input
        }
    }
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
            color: "#3B82F6",
            fontSize: '4rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <FaUserGraduate />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1F2937',
            marginBottom: '1rem'
          }}>
            {showRegister ? (registerStep === 1 ? 'Register Student' : (registerStep === 2 ? 'Verify Email & Set Password' : '')) : 'Student Login'}
          </h1>
          <p style={{
            color: '#6B7280',
            fontSize: '1.1rem'
          }}>
            {showRegister ? (registerStep === 1 ? 'Fill the form to register your self' : 'Enter the OTP sent to your email and set a secure password') : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Conditionally render only one form at a time */}
        {!showRegister && (
          <>
            <LoginForm
              type="student"
              apiEndpoint="https://campusadmin.onrender.com/api/college-students/email"
              redirectPath="/dashboard"
            />
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowRegister(true)}
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
                Register student
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
                {registerStep === 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#374151' }}>Student Details</h3>
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
                )}
                <input name="university" value={registerData.university} onChange={handleRegisterChange} required placeholder="University Name" style={inputStyle} />
                <input name="name" value={registerData.name} onChange={handleRegisterChange} required placeholder="College Name" style={inputStyle} />
                <input name="studentName" value={registerData.studentName} onChange={handleRegisterChange} required placeholder="Student Name" style={inputStyle} />
                <input name="rollno" value={registerData.rollno} onChange={handleRegisterChange} required placeholder="Roll no" style={inputStyle} />
                <input name="contactEmail" value={registerData.contactEmail} onChange={handleRegisterChange} required placeholder="Contact Email" style={inputStyle} />
                <input name="contactPhone" value={registerData.contactPhone} onChange={handleRegisterChange} required placeholder="Contact Phone" style={inputStyle} />
                <input name="gender" value={registerData.gender} onChange={handleRegisterChange} required placeholder="Gender" style={inputStyle} />
                <input name="currentSem" value={registerData.currentSem} onChange={handleRegisterChange} required placeholder="Cureent Sem/Year" style={inputStyle} />
                <input name="adress" value={registerData.adress} onChange={handleRegisterChange} placeholder="Address" style={inputStyle} />
                <input name="branch" value={registerData.branch} onChange={handleRegisterChange} required placeholder="Branch" style={inputStyle} />
                {/* <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#f9fafb' }}>
                  <h4 style={{ margin: 0, color: '#F59E0B' }}>Placement Officer</h4>
                  <input name="placementOfficer.name" value={registerData.placementOfficer.name} onChange={handleRegisterChange} required placeholder="Officer Name" style={inputStyle} />
                  <input name="placementOfficer.email" value={registerData.placementOfficer.email} onChange={handleRegisterChange} required placeholder="Officer Email" style={inputStyle} />
                  <input name="placementOfficer.phone" value={registerData.placementOfficer.phone} onChange={handleRegisterChange} required placeholder="Officer Phone" style={inputStyle} />
                </div> */}
                {/* <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#f9fafb' }}>
                  <h4 style={{ margin: 0, color: '#F59E0B' }}>Departments</h4>
                  {registerData.departments.map((dept, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input name={`departments.${idx}.name`} value={dept.name} onChange={handleRegisterChange} required placeholder="Department Name" style={{ ...inputStyle, flex: 1 }} />
                      <input name={`departments.${idx}.code`} value={dept.code} onChange={handleRegisterChange} required placeholder="Code" style={{ ...inputStyle, width: 80 }} />
                      {registerData.departments.length > 1 && (
                        <button type="button" onClick={() => handleRemoveDepartment(idx)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>-</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddDepartment} style={{ background: 'blue', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', marginTop: '0.5rem' }}>+ Add Department</button>
                </div> */}
                {registerError && <div style={{ color: '#DC2626', background: '#FEE2E2', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>{registerError}</div>}
                <button type="submit" disabled={emailCheckLoading} style={{ ...inputStyle, background: '#F59E0B', color: 'white', fontWeight: 'bold', cursor: emailCheckLoading ? 'not-allowed' : 'pointer', opacity: emailCheckLoading ? 0.7 : 1 }}>
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
            {/* Step 2: Password and OTP */}
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
                {/* OTP Input Boxes, Resend Button, and Symbol */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}> {/* Adjusted margin-bottom for consistency */}
                  {Array(6).fill('').map((_, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el} // Assign ref
                      type="text"
                      maxLength="1"
                      value={otpInputs[index]} // Use state value
                      onChange={(e) => handleOtpInputChange(e, index)} // Use handler
                       onKeyDown={(e) => { // Handle backspace and other keys
                         if (e.key === 'Backspace' && !otpInputs[index] && index > 0 && otpInputRefs.current[index - 1]) {
                            otpInputRefs.current[index - 1].focus();
                         } else if (e.key === 'ArrowLeft' && index > 0 && otpInputRefs.current[index - 1]) {
                             otpInputRefs.current[index - 1].focus();
                         } else if (e.key === 'ArrowRight' && index < 5 && otpInputRefs.current[index + 1]) {
                              otpInputRefs.current[index + 1].focus();
                         }
                       }}
                      style={{
                        ...inputStyle,
                        width: '40px', // Adjusted size slightly for better appearance
                        height: '40px', // Added height for square boxes
                        textAlign: 'center',
                        padding: '0.5rem 0', // Adjusted padding
                        marginBottom: '0', // Remove bottom margin
                        borderColor: otpStatus === 'error' ? '#EF4444' : (otpStatus === 'verified' ? '#10B981' : inputStyle.borderColor), // Dynamic border color
                         boxShadow: otpStatus === 'error' ? '0 0 0 2px #FEE2E2' : (otpStatus === 'verified' ? '0 0 0 2px #D1FAE5' : 'none'), // Optional: Add shadow for status
                      }}
                    />
                  ))}
                  {/* OTP Verification Symbol */}
                  <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {/* Adjusted size */}
                     {otpStatus === 'verifying' && <span style={{ fontSize: '1.2rem' }}>...</span>} {/* Loading indicator */}
                     {otpStatus === 'verified' && <span style={{ color: '#10B981', fontSize: '1.5rem' }}>✅</span>} {/* Verified symbol */}
                     {otpStatus === 'error' && <span style={{ color: '#EF4444', fontSize: '1.5rem' }}>❌</span>} {/* Error symbol */}
                  </div>
                    {/* Resend OTP Button */}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendDisabled}
                      style={{
                        background: resendDisabled ? '#D1D5DB' : '#F59E0B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: resendDisabled ? 'not-allowed' : 'pointer',
                        marginTop: '0', // Align with OTP inputs
                        width: 'fit-content', // Adjust width
                        transition: 'background 0.2s',
                      }}
                    >
                      {resendDisabled ? `Resend OTP (${resendTime}s)` : 'Resend OTP'}
                    </button>
                </div>

                {/* Error/Success messages - Reserve space and animate opacity */}
                <div style={{
                  minHeight: '1.5rem', // Reserve space for one line of error
                  opacity: (registerError || registerSuccess) ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                  marginBottom: '1rem' // Space below messages
                }}>
                  {/* Display registration errors/success messages */}
                  {/* Only show error if not an OTP verification error, or show it below OTP inputs */} 
                  {registerError && otpStatus !== 'error' && ( 
                    <div style={{ color: '#DC2626', background: '#FEE2E2', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>{registerError}</div>
                  )} 
                   {/* Show OTP specific error below OTP inputs */} 
                  {otpStatus === 'error' && registerError && ( 
                     <div style={{ color: '#DC2626', fontSize: '0.9rem', textAlign: 'center' }}>{registerError}</div>
                  )}
                  {registerSuccess && <div style={{ color: '#059669', background: '#dcfce7', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>{registerSuccess}</div>}
                 </div>

                {/* Password Fields */}
                <input
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  placeholder="Set Password"
                  style={inputStyle}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  placeholder="Confirm Password"
                  style={inputStyle}
                />
                {/* Register and Back buttons */}
                <button type="submit" disabled={registerLoading || otpStatus !== 'verified'} style={{ ...inputStyle, background: '#4B5563', color: 'white', fontWeight: 'bold', cursor: (registerLoading || otpStatus !== 'verified') ? 'not-allowed' : 'pointer', opacity: (registerLoading || otpStatus !== 'verified') ? 0.7 : 1 }}>
                  {registerLoading ? 'Registering...' : 'Register Student'}
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterStep(1)}
                  style={{
                    background: '#4B5563',
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

export default StudentLogin; 