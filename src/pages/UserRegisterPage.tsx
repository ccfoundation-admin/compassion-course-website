import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const UserRegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  // Redirect to portal when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/portal', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h2>Compassion Course Registration</h2>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return null; // useEffect will handle navigation
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      // Navigation will be handled by useEffect
    } catch (error: any) {
      console.error('Registration error:', error);
      // Provide more specific error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Compassion Course Registration</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
              minLength={6}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default UserRegisterPage;
