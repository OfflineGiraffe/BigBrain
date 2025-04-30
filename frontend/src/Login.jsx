import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login ({ successJob, token,}) {
  // Collects user input for the login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  // Checks if the user is already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);
  
  // Runs whenever the user submits the login form
  const login = async () => {
    setError('');

    try {
      // Sends the inputted data to the backend 
      const response = await axios.post('http://localhost:5005/admin/auth/login', {
        email: email,
        password: password
      })

      // The returned token is stored in local storage with the email and password
      const token = response.data.token;
      successJob(token, email, password)
      
    } catch (err) {
      // Displays an error message if one is encountered
      setError(err.response.data.error);
    }
  };

  // Allows the user to submit the login form by pressing the enter button
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-200">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend text-center text-3xl">Login</legend>
        
        <label className="fieldset-label text-slate-900">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyPress} type="email" className="input" placeholder="Email" />
        
        <label className="fieldset-label text-slate-900">Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyPress} type="password" className="input" placeholder="Password" />

        {/* Only shows when an error has been stored */}
        {error && (
          <div role="alert" className="alert alert-warning mt-2 mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button onClick={login} className="btn btn-primary md:btn-md flex-1 mt-2" name="login-button">Login</button>
        <div className="flex gap-x-1 w-full mt-3"> 
          Dont have an account? <Link to="/register">Register</Link>
        </div>
      </fieldset>
    </div>
  )
}

export default Login;