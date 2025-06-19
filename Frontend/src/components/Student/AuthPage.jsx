import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthPage = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("login"); // "login" or "signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Reset form on view toggle
  const switchView = (view) => {
    setCurrentView(view);
    setFormData({ name: "", email: "", password: "" });
    setErrors({});
    setMessage({ type: "", text: "" });
    setShowPassword(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (currentView === "signup" && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (currentView === "signup" && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const endpoint =
        currentView === "login"
          ? `${apiUrl}/api/student/login`
          : `${apiUrl}/api/student/signup`;
      const payload =
        currentView === "login"
          ? { email: formData.email, password: formData.password }
          : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // CRUCIAL for session cookies
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Optionally store studentId for UI logic
        if (data.studentId) {
          localStorage.setItem("studentId", data.studentId);
        }
        setMessage({
          type: "success",
          text:
            currentView === "login"
              ? "Login successful! Redirecting..."
              : "Account created! Redirecting...",
        });

        setTimeout(() => {
          navigate("/dashboard"); // or wherever you want to redirect
        }, 1000);

        if (onAuthSuccess) onAuthSuccess(data);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Something went wrong",
        });
      }
    } catch  {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 rounded-2xl shadow-lg px-8 py-10">
        <div className="text-center">
          <img
            alt="Logo"
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            className="mx-auto w-16 h-16 mb-2"
          />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {currentView === "login"
              ? "Sign In to your Account"
              : "Create your Account"}
          </h2>
          <p className="text-gray-500 mt-2 text-base">
            {currentView === "login"
              ? "Welcome back! Please login to continue."
              : "Sign up to get started."}
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          {currentView === "signup" && (
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.name ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter your full name"
                autoComplete="off"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="Enter your email"
              autoComplete="off"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter your password"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.38.283-2.694.793-3.88m2.387-3.274A9.978 9.978 0 0112 3c5.523 0 10 4.477 10 10 0 1.446-.31 2.824-.863 4.042M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 01-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.22.424 4.563 1.17M19.542 12C18.268 16.057 14.477 19 10 19c-1.657 0-3.22-.424-4.563-1.17" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {message.text && (
            <div
              className={`rounded-md p-4 text-center ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading
                ? currentView === "login"
                  ? "Signing In..."
                  : "Creating Account..."
                : currentView === "login"
                ? "Sign In"
                : "Sign Up"}
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            {currentView === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() =>
                switchView(currentView === "login" ? "signup" : "login")
              }
              className="font-bold text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              {currentView === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Campus Recruitment Portal
        </div>
      </div>
    </div>
  );
}; 
