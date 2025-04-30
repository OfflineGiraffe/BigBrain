import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StartSessionModal from './StartSessionModal';
import { useEffect, useState } from 'react';

const GameCard = ({
  token,
  game, 
  activeStatus, 
  setActiveStatus, 
  sessionPopUp, 
  setSessionPopUp,
  selectedGameId,
  setSelectedGameId,
  onDelete
}) => {

  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');


  useEffect(() => {
    const storedActiveStatus = localStorage.getItem('activeStatus') === 'true';
    const storedSessionId = localStorage.getItem('sessionId');
        
    // Update state if there's an active game in localStorage
    if (storedActiveStatus) {
      setActiveStatus(true);
      setSessionId(storedSessionId)
    }
  }, [setActiveStatus, setSelectedGameId]);

  const handleClick = () => {
    navigate(`/game/${game.id}`);
  };

  const startGameMutate = async (token) => {
    try {
      setActiveStatus(true);
      setSelectedGameId(game.id);

      const response = await axios.post(`http://localhost:5005/admin/game/${game.id}/mutate`, {
        mutationType: "START"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      const newSessionId = response.data.data.sessionId;
      localStorage.setItem('activeStatus', 'true');
      localStorage.setItem('sessionId', newSessionId);
      localStorage.setItem('gameState', 'waitForPlayersJoin');
      localStorage.setItem('currentQuestionPosition', -1);
      localStorage.setItem('NumberOfQuestions', -1);

      setSessionId(newSessionId);
        
      // Now show the modal after everything is ready
      setSessionPopUp(true);
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  const getTotalDuration = (questions) => {
    let totalDuration = 0;
    for (const question of questions) {
      totalDuration += Number(question.duration);
    }

    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;
    const parts = [];

    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    }

    return parts.join(' and ');
  }

  return (
    <div className="card bg-base-100 w-100 shadow-sm mt-6"> 
      <figure className="px-10 pt-10 mb-0">
        {/* display the image */}
        <img
          src={game.thumbnail} 
          alt="Game Thumbnail"
          className="rounded-xl border-2 border-black w-[100%]" />
      </figure>
      <div className="card-body items-center text-center flex flex-col justify-between">
        {/* display the game name */}
        <h2 className="card-title text-center flex justify-center break-words break-all">{game.name}</h2>
        <div className="input-group justify-center mt-auto mb-0">
          {/* display the number of questions*/}
          <span className="bg-base-200 text-gray-600 rounded-l-md px-4 py-2">Number of Questions</span>
          <span className="bg-base-100 text-black rounded-r-md px-4 py-2 border border-l-0">{game.questions.length}</span>
        </div>
        <div className="input-group justify-center mt-2 mb-2">
          {/* display the total duration*/}
          <span className="bg-base-200 text-gray-600 rounded-l-md px-4 py-2">Total Duration</span>
          <span className="bg-base-100 text-black rounded-r-md px-4 py-2 border border-l-0">{getTotalDuration(game.questions)}</span>
        </div>
        <div className="card-actions">
          <button onClick={handleClick} className="btn btn-primary mt-auto">Edit Game</button>

          {!activeStatus && (
            <button 
              className="btn !bg-[#29a742] !text-white hover:!bg-green-700 hover:!bg-green-800"
              name="start game"
              onClick={() => {
                startGameMutate(token);
              }}>
                            Start Game
            </button>
          )}
          <button onClick={onDelete} className="btn btn-danger !bg-red-600 hover:!bg-red-900">Delete Game</button>
                    
          {/* Always render the modal, controlled by open prop */}
          <StartSessionModal 
            open={selectedGameId === game.id && sessionPopUp} 
            onClose={() => setSessionPopUp(false)} 
            className='flex flex-row justify-center items-center'
          >
            <div>
              <p>
                                    SessionID: {`${sessionId}`}    
              </p>
              <p className='btn btn-soft btn-primary w-[20vh]'
                onClick={() => {navigator.clipboard.writeText(`http://localhost:3000/playerjoin/${sessionId}`)}}>
                                    Copy Link
              </p>
            </div>
          </StartSessionModal>
        </div>
      </div>
    </div>
        
  )
    
}

export default GameCard;