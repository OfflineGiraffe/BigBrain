import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

import Gamecard from '../components/GameCard';
import CreateGameModal from '../components/CreateGameModal';
import ViewResultsModal from '../components/ViewResultsModal';

function Dashboard({ token, activeStatus, setActiveStatus}) {
  const defaultImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
  const [games, setGames] = useState([]);
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [createPopuUp, setCreatePopUp] = useState(false);
  const [createGameError, setCreateGameError] = useState('');
  const [imageError, setimageError] = useState(false);
  const [sessionPopUp, setSessionPopUp] = useState(false);
  const [resultsPopUp, setResultsPopUp] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  {/* gets the dashboard games from the backend */}
  const getDashboardGames = async (token) => {
    try {
      const response = await axios.get('http://localhost:5005/admin/games', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      setGames(response.data.games)
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  {/* navigates to the sessionId after it has ended */}
  const navigateSession = () => {
    navigate(`/session/${localStorage.getItem("sessionId")}`)
  }

  {/* handles uploading a file */}
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

      if (!validImageTypes.includes(selectedFile.type)) {
        setimageError(true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnail(event.target.result); 
      };
      reader.readAsDataURL(selectedFile);
    } 
  };

  {/* if the user refreshes and there isn't a token, go back to login page */}
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    getDashboardGames(token);
  }, [token, navigate]);

  {/* Check for active game in localStorage */}
  useEffect(() => {
    const storedActiveStatus = localStorage.getItem('activeStatus') === 'true';
    
    if (storedActiveStatus) {
      setActiveStatus(true);
    }
  }, []);

  {/* creates a new game */}
  const createNewGame = async () => {
    if (name === '') {
      setCreateGameError("Game Name cannot be empty");
      return; 
    } 

    const isDuplicate = games.some(game => game.name === name);
    if (isDuplicate) {
      setCreateGameError("Game Name is already taken");
      return; 
    }

    if (imageError) {
      setCreateGameError("Invalid file type");
      resetFileInput();
      setimageError(false);
      return;
    }
    
    {/* new game data */}
    const newGame = {
      id: Math.floor(Math.random() * 1001),
      name: name,
      owner: localStorage.getItem('email'),
      questions: [],
      thumbnail: thumbnail || defaultImg
    };

    games.push(newGame)

    try {
      await axios.put('http://localhost:5005/admin/games', {
        games: games
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      getDashboardGames(token);
      setName('');
      setThumbnail('');
      resetFileInput();
      setCreateGameError('');
      return true;
    } catch (err) {
      setCreateGameError(err.response.data.error);
      return false;
    }
  }

  {/* Deletes a game by removing it from the array */}
  const deleteGame = async (id) => {
    let newGamesArray = []

    games.map(game => {
      if (game.id !== id) {
        newGamesArray.push(game);
      }
    })

    try {
      await axios.put('http://localhost:5005/admin/games', {
        games: newGamesArray
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      getDashboardGames(token);
      setName('');
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  {/* end the active session */}
  const endGameMutate = async (token) => {
    try {
      {/* find an active game by iterating through to check game.active */}
      let activeGameId = false;

      const getGameIdResponse = await axios.get('http://localhost:5005/admin/games', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      let games = getGameIdResponse.data.games
      
      activeGameId = games.find(game => game.active !== null);

      await axios.post(`http://localhost:5005/admin/game/${activeGameId.id}/mutate`, {
        mutationType: "END"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      localStorage.removeItem('activeStatus');
      setResultsPopUp(true);
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  {/* go to results page */}
  const goToResultPage = () => {
    navigate(`/session/${localStorage.getItem('sessionId')}`)
    localStorage.setItem("gameState", "results")
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; 
    }
  }

  return (
    <div className='m-4'>
      <div className='flex flex-row justify-between'>
        <h1>Dashboard</h1>
        <div className='flex flex-row'>
        </div>
      </div>
        
      <table className='w-full'>
        <tbody>
          <tr className='flex justify-between items-center'>
            <td className='flex gap-2 flex-col'>
              {/* create a new game, opening up the CreateGameModal */}
              <button className="btn btn-primary" onClick={() => setCreatePopUp(true)}>
                Create New Game
              </button>
              
              <CreateGameModal
                open={createPopuUp}
                onClose={() => {
                  setCreatePopUp(false);
                  setName(''); 
                  setThumbnail(''); 
                  resetFileInput();
                  setCreateGameError(''); 
                }}
                name={name}
                setName={setName}
                handleFileChange={handleFileChange}
                onCreate={async () => {
                  const success = await createNewGame();
                  if (success) {
                    setCreatePopUp(false); 
                  }
                }}
                error={createGameError}
                editing={false}
                fileInputRef={fileInputRef}
              />
            </td>
            <td className="ml-auto flex flex-col md:flex-row justify-between items-center gap-2">
              {/* Includes two buttons and one informative block. Buttons only appear after a session is started */}
              <p className={`p-2 rounded-md text-white ${activeStatus ? "bg-[#29a742]" : "!bg-red-700"}`}><b>{activeStatus ? "Session: Active" : "Session: Inactive"}</b></p>
              {
                activeStatus && (
                  <p className={`p-2 rounded-md text-white !bg-yellow-600 hover:cursor-pointer hover:!bg-yellow-900`}
                    onClick={() => {
                      navigateSession()
                    }}
                  >
                    <b>
                      Go To Session
                    </b>
                  </p>
                )
              }
              {
                activeStatus && (
                  <p className={`p-2 rounded-md text-white !bg-red-600 mr-2 hover:cursor-pointer hover:!bg-red-900`}
                    name="End session"
                    onClick={() => {
                      setActiveStatus(false);
                      endGameMutate(token);
                    }}
                  >
                    <b>
                      End Session
                    </b>
                  </p>
                )
              }
              <ViewResultsModal open={resultsPopUp} onClose={() => setResultsPopUp(false)}>
                <div className='btn btn-primary'
                  name="view results"
                  onClick={() => {
                    goToResultPage();
                  }}>
                  View Game Results
                </div>
              </ViewResultsModal>
            </td>
          </tr>
        </tbody>
          
      </table>
        
        
      {/* if game length is 0, show no games found. otherwise, show game card */}
      {games.length === 0 ? (
        <div role="alert" className="alert alert-error mt-6 !bg-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No Games Found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 bg-blue-200">
          {games.map(game => (
            <Gamecard key={game.id}
              token={token}
              game={game}
              activeStatus={activeStatus}
              setActiveStatus={setActiveStatus}
              sessionPopUp={sessionPopUp}
              setSessionPopUp={setSessionPopUp}
              selectedGameId={selectedGameId}
              setSelectedGameId={setSelectedGameId}
              onDelete={() => {deleteGame(game.id)}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard