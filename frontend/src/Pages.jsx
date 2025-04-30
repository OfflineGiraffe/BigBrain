import { useState, useEffect } from 'react';
import axios from 'axios';

import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import EditGame from './EditGame';
import Session from './Session';
import PlayerJoin from './PlayerJoin';
import PlayerGame from './Playergame';

import 'bootstrap/dist/css/bootstrap.min.css'

import {
  Routes,
  Route,
  useNavigate,
  useLocation 
} from "react-router-dom"

function App() {
  const [token, setToken] = useState(null);
  const [activeStatus, setActiveStatus] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
 
  useEffect(() => {
    setToken(localStorage.getItem('token'));

  }, []);

  useEffect(() => {
    // Check if we're at the root path
    if (window.location.pathname === '/') {
      navigate('/login');
    }
  }, [navigate]);

  {/* successful login or register */}
  const successJob = (token, email, password) => {
    localStorage.setItem('token', token)
    localStorage.setItem('email', email)
    localStorage.setItem('password', password)
    setToken(token);
    navigate('/dashboard');
  }
  
  const logout = async () => {
    try {
      await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      localStorage.removeItem('NumberOfQuestions');
      localStorage.removeItem('currentQuestionPosition');
      localStorage.removeItem('gameState');
      localStorage.removeItem('localNumberOfQuestions');
      localStorage.removeItem('activeStatus');
      localStorage.removeItem('questionTimer')
      localStorage.removeItem('sessionId');
      localStorage.removeItem('activeGameId')

      setToken(null);
      navigate('/login');
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  return (
    <div data-theme="nord" className="fixed inset-0 bg-blue-200 overflow-y-auto">
      {token && !location.pathname.startsWith('/playerjoin') && !location.pathname.startsWith('/playergame') && (
        <button name="logoutdashboardbutton" onClick={logout} className="btn btn-lg bg-secondary hover:!bg-zinc-700 text-white absolute top-2 right-6">
          Logout
        </button>
      )}
      <Routes>
        <Route path="/register" element={<Register successJob={successJob} token={token}/>} />
        <Route path="/login" element={<Login successJob={successJob} token={token}/>} />
        <Route path="/dashboard" element={<Dashboard token={token} activeStatus={activeStatus} setActiveStatus={setActiveStatus}/>} />
        <Route path="/game/:gameId" element={<EditGame token={token} />} />
        <Route path="/session/:sessionId" element={<Session token={token} setActiveStatus={setActiveStatus}/>} />
        <Route path="/playerjoin" element={<PlayerJoin token={token} />} />
        <Route path="/playerjoin/:sessionId" element={<PlayerJoin token={token} />} />
        <Route path="/playergame/:playerId" element={<PlayerGame token={token} />} />
      </Routes>
    </div>
  )
}

export default App
