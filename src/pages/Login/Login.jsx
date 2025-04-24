import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from "../../services/supabase";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Retry strategy for failed requests
  const retryRequest = async (requestFn, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Exponential backoff: 1s, 2s, 4s...
        if (i > 0) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i - 1)));
        }
        return await requestFn();
      } catch (err) {
        lastError = err;
        console.log(`Attempt ${i+1} failed, ${i < maxRetries - 1 ? 'retrying...' : 'giving up.'}`);
      }
    }
    throw lastError;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setConnectionError(false);

    try {
      // Use retry mechanism for the request
      const { data: studentData, error: fetchError } = await retryRequest(() => 
        supabase
          .from('student')
          .select('*')
          .ilike('email', email.trim().toLowerCase())
      );

      if (fetchError) throw fetchError;
      if (!studentData?.length) throw new Error('No account found with this email');

      const student = studentData.find(s => s.password === password.trim());
      if (!student) throw new Error('Incorrect password');

      login(student);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.includes('fetch') || 
          err.message?.includes('network') || 
          err.message?.includes('timeout') ||
          err instanceof TypeError) {
        setConnectionError(true);
        setError('Connection error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glassmorphism">
        <h2 className="login-title">Student Portal Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>University Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={`error-message ${connectionError ? 'connection-error' : ''}`}>
              {error}
              {connectionError && (
                <div className="retry-suggestion">
                  The server might be down or unreachable. You can try:
                  <ul>
                    <li>Checking your internet connection</li>
                    <li>Waiting a few minutes and trying again</li>
                    <li>Contacting your administrator if the problem persists</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>

          <div className="contact-admin">
            Need access? <a href="/contact-admin">Contact Administrator</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;