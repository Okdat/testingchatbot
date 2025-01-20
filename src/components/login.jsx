import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios'; 
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/authContext';

import './login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).access_token : null;
    setError(''); // Clear any previous error message
    setLoading(true);

  

    try {
      // Call the login API
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        {
          email: email,
          password: password,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the response to see what's being returned
      console.log("API Response:", response);
      // If login is successful, call onLogin (you can pass additional user info if needed)
      if (response.status >= 200 && response.status < 300) {
        const responseBody = JSON.parse(response.data.body);
        
        const { access_token } = responseBody;
        console.log("User Data from API:", access_token);

        if (!access_token) {
          toast.error('Thông tin đăng nhập không hợp lệ');
          setLoading(false);
          return;
        }

        // Decode the JWT token
        const decodedToken = jwtDecode(access_token);
        console.log("Decoded JWT:", decodedToken);

        if (!decodedToken) {
          setError('Failed to decode token');
          return;
        }

        const user = {
          access_token,
          refresh_token: responseBody.refresh_token,
          user_id: decodedToken.user_id,
          user_name: decodedToken.user_name,
          role: decodedToken.role,
        };

        login(user); // Pass user data to the parent component

        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log("Login: User after login:", user);
        // Log the user role to check if it's being properly returned
        const role = decodedToken.role;
        console.log("User Role:", role);
        console.log("Role Type:", typeof role);

        if (role) {
          const trimmedRole = role.trim(); // Remove spaces if any
          console.log("Trimmed User Role:", trimmedRole);
  
          // Check role and navigate accordingly
          if (trimmedRole === 'Student') {
            console.log("Redirecting to Student Dashboard...");
            navigate('/student-dashboard');
          } else if (trimmedRole === 'Teacher') {
            console.log("Redirecting to Teacher Dashboard...");
            navigate('/teacher-dashboard');
          } else {
            console.error("Unknown role:", trimmedRole); // Log error if role is not found
            setError('Unknown role');
          }
        } else {
          console.error("Role is missing or invalid");
          setError('Role is missing or invalid');
        }
      } else {
        console.error("Login failed with status:", response.status);
        setError('Invalid credentials or something went wrong');
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError('Invalid credentials or something went wrong');
      toast.error('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome Back!</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
  
        <div className="register-section">
          <p>New to the platform?</p>
          <button className="register-button" onClick={handleRegister}>
            Create an Account
          </button>
        </div>
  
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
  
};

export default Login;