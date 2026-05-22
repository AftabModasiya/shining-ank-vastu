import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_CREDENTIALS } from '../config/authConstants';
import './Login.css';

function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
      localStorage.setItem('isAuthenticated', 'true');
      setAuth(true);
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1>Shining Ank Vastu</h1>
            <p>Admin Portal Access</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn-login">
              Sign In to Dashboard
            </button>
          </form>

          <div className="login-footer">
            <p>Shining Ank Vastu - M : 9913961553</p>
            <p>Vedic Numerology Report</p>          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
