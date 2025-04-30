import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function PlayerJoin () {

  // Collects user input for the login form
  const prePopulatedSessionId = useParams().sessionId;
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(prePopulatedSessionId || '');
  const [name, setName] = useState('');
  const [joinGameError, setJoinGameError] = useState('');

  const errorCheck = async (name) => {
    {/* no session ID */}
    if (sessionId === '') {
      setJoinGameError("Session name cannot be empty");
      return; 
    } else if (name === '') {
      setJoinGameError("Game Name cannot be empty");
    } else {
      try {
        {/* let the player join if all checks are good */}
        setJoinGameError("");
        const response = await axios.post(`http://localhost:5005/play/join/${sessionId}`, {
          name: name
        })
        const playerId = response.data.playerId
        navigate(`/playergame/${playerId}`)
      } catch (err) {
        console.log(err)
      }
        
    }
  }

  

  return (
    // bg-white p-8 rounded-lg shadow-md flex flex-col w-[80%] md:w-[40%]
    <div className="flex items-center justify-center min-h-screen bg-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-md flex flex-col">
        <form className='flex flex-col gap-3 w-[30vh]' onSubmit={(e) => {e.preventDefault(); errorCheck(name)}}>
          <label type="text"><b>Session ID</b></label>
          <input
            className="p-2 bg-gray-200 rounded-md"
            type="number"
            required placeholder="Session ID"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
          />
          <label type="text"><b>Name</b></label>
          <input
            className="p-2 bg-gray-200 rounded-md w-full"
            type="text"
            placeholder="Player Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button className=' btn btn-primary' onClick={() => errorCheck}>
                Join
          </button>
          {/* only show error if there was an error filling out the forms */}
          {joinGameError && (
            <div role="alert" className="alert alert-warning mt-2 mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{joinGameError}</span>
            </div>
          )}
        </form>

      </div>
    </div>
  )
}

export default PlayerJoin;