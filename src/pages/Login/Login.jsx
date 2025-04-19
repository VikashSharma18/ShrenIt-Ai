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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: studentData, error: fetchError } = await supabase
        .from('student')
        .select('*')
        .ilike('email', email.trim().toLowerCase());

      if (fetchError) throw fetchError;
      if (!studentData?.length) throw new Error('No account found with this email');

      const student = studentData.find(s => s.password === password.trim());
      if (!student) throw new Error('Incorrect password');

      login(student);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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

          {error && <div className="error-message">{error}</div>}

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