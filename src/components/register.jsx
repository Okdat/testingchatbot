import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './register.css';
import axios from 'axios';
import usthLogo from '../assets/usthlogo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [re_password, setRePassword] = useState('');
  const [role, setRole] = useState('Student'); // Default to "Student"
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (password !== re_password) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!email || !username || !password) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/register`,
        {
          email: email,
          user_name: username,
          password: password,
          role: role,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Registration successful!");
        setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
      } else {
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Logo Section */}
        <div className="register-header">
          <img src={usthLogo} alt="USTH Logo" className="register-logo" />
        </div>

        {/* Form Section */}
        <div className="register-form-container">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            {/* Email Input */}
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Username Input */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Re-enter Password */}
            <div className="form-group">
              <input
                type="password"
                placeholder="Re-enter your password"
                value={re_password}
                onChange={(e) => setRePassword(e.target.value)}
                required
              />
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>

            {/* Submit Button */}
            <button type="submit" className="register-button">
              Register
            </button>
          </form>

          {/* Link to Login */}
          <div className="register-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Register;
