import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import CreatePercentageChart from "../components/CreatePercentageChart";
import CreateAverageTimeChart from "../components/CreateAverageTimeChart";

const Session = ({ token, setActiveStatus }) => {
  const linkedSession = useParams();
  const navigate = useNavigate();

  const [numberOfQuestions, setNumberOfQuestions] = useState(parseInt(localStorage.getItem('NumberOfQuestions')));
  const [currentQuestionPosition, setCurrentQuestionPosition] = useState(parseInt(localStorage.getItem('currentQuestionPosition')));
  const [gameState, setGameState] = useState(localStorage.getItem("gameState"));
  const [hasResults, setHasResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionTimer, setQuestionTimer] = useState(localStorage.getItem("questionTimer"));
  const [results, setResults] = useState([])

  const activeStatus = localStorage.getItem('activeStatus');
  const sessionId = localStorage.getItem('sessionId');
  const localToken = localStorage.getItem('token');
  const localGameState = localStorage.getItem('gameState');
  const localCurrentQuestionPosition = parseInt(localStorage.getItem('currentQuestionPosition'));
  const localNumberOfQuestions = parseInt(localStorage.getItem('NumberOfQuestions'));

  {/* Question timer, decrementing by 1 */}
  useEffect(() => {
    if (questionTimer <= 0) return;
    
    const intervalId = setInterval(() => {
      setQuestionTimer((prev) => prev - 1);
    }, 1000);
    
    // Cleanup when component unmounts or timer ends
    return () => clearInterval(intervalId);
  }, [questionTimer]);

  {/* Only check for results if no active session is running */}
  useEffect(() => {
    const checkResults = async () => {
      if (!activeStatus) {
        const success = await getResults(localToken);
        setHasResults(success);
      }
    };
    checkResults();
  }, [localToken, activeStatus]);  // Re-check when the activeStatus changes

  useEffect(() => {
    setCurrentQuestionPosition(localCurrentQuestionPosition)
    setNumberOfQuestions(localNumberOfQuestions)
    setGameState(localGameState)

  }, []);

  {/* Update gameState based on currentQuestionPosition */}
  useEffect(() => {
    if (currentQuestionPosition === -1) {
      setGameState("waitForPlayersJoin");
    } else if (currentQuestionPosition === 0) {
      setGameState("displayQuestions");
    } else if (currentQuestionPosition + 1 > numberOfQuestions) {
      localStorage.removeItem('activeStatus');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('gameState');
      localStorage.removeItem('currentQuestionPosition');
      localStorage.removeItem('localNumberOfQuestions');
      setGameState("results");
    }
  }, [currentQuestionPosition]);

  {/* Get player ranking by points */}
  const getPointRanking = () => {  
    let rankings = [];
  
    results.forEach(player => {
      let totalPoints = 0;
  
      player.answers.forEach((answerObj, index) => {
        const question = questions[index];
        const isCorrect = answerObj.correct;
  
        if (isCorrect && question) {
          totalPoints += parseInt(question.points);
        }
      });
  
      rankings.push({
        name: player.name,
        points: totalPoints
      });
    });
  
    // Sort descending by points
    rankings.sort((a, b) => b.points - a.points);
  
    return rankings;
  };

  {/* render the content for the lobby, displaying questions and the results */}
  const renderGameContent = () => {
    if (gameState === "waitForPlayersJoin" && hasResults) {
      setGameState("results");
    }

    switch(gameState) {
    case "waitForPlayersJoin":
      localStorage.setItem('gameState', 'waitForPlayersJoin');
      return (
        <div className="flex flex-col justify-center items-center mt-40">
          <h1>Waiting for players to connect</h1>
        </div>
      
      )
    case "displayQuestions":
      localStorage.setItem('gameState', 'displayQuestions');
      return (
        <div className="flex flex-col items-center justify-center mt-40">
          <div className="flex flex-row gap-4 bg-white rounded-[20px] p-4 border-solid border-2 border-blue-300" >
            {questionTimer > 0
              ? <h1>{`Duration: ${questionTimer}s`}</h1>
              : <h1 className="">Question is finished</h1>}
            <h1 className="">Question position: {currentQuestionPosition + 1} / {numberOfQuestions} </h1>
          </div>
        </div>
      )
    case "results": {
      localStorage.setItem('gameState', 'results');
      let playerRanking = getPointRanking();
      return (
        <div className="flex flex-col gap-6 mt-10 px-4 mt-30">
          {/* Make table scrollable on smaller screens */}
          <div className="overflow-x-auto">
            <table className="table w-full min-w-[300px]">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {playerRanking.map((player, index) => (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <td>{player.name}</td>
                    <td>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      
          {/* Wrap charts in a responsive flex container */}
          <div className="flex flex-col lg:flex-row justify-center items-center gap-4 w-full">
            <div className="relative w-full lg:w-1/2">
              <CreatePercentageChart results={results} />
            </div>
            <div className="relative w-full lg:w-1/2">
              <CreateAverageTimeChart results={results} />
            </div>
          </div>
        </div>
      );
    }
      
    }
  }
  {/* when a game is finished, remove some localstorage items */}
  const endGameFunctionality = async () => {
    localStorage.removeItem('activeStatus');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('gameState');
    localStorage.removeItem('currentQuestionPosition');
    setActiveStatus(false);
  }

  {/* when the game is closed */}
  const endGameMutate = async (token) => {
    try {

      {/* find gameId from active property */}
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
      });
      endGameFunctionality()
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  {/* advance in the game, continuining on to the next question */}
  const advanceGame = async (token) => {
    {/* finding gameid based on active game */}
    let activeGameId = false;

    const getGameIdResponse = await axios.get('http://localhost:5005/admin/games', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    let games = getGameIdResponse.data.games
      
    activeGameId = games.find(game => game.active !== null);

    try {
      const response = await axios.post(`http://localhost:5005/admin/game/${activeGameId.id}/mutate`, {
        mutationType: "ADVANCE"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
            
      getStatus(token);
      const newPosition = response.data.data.position;
      localStorage.setItem('currentQuestionPosition', newPosition.toString())
      setCurrentQuestionPosition(newPosition);
      if (newPosition === numberOfQuestions) {
        endGameFunctionality()
      }
            
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  {/* gets the current status of the session */}
  const getStatus = async (token) => {
    try {
      const response = await axios.get(`http://localhost:5005/admin/session/${sessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {  // If you need to send the sessionId as a query parameter
          sessionid: sessionId
        }
      })
      const lngth = response.data.results.questions.length;
      setQuestions(response.data.results.questions)
      setNumberOfQuestions(lngth);
      localStorage.setItem('NumberOfQuestions', lngth.toString());
      {/* if response is good and some math to determine that the currentposition wont be out of bounds */}
      if (response && 
                localCurrentQuestionPosition + 1 < lngth && 
                localCurrentQuestionPosition >= -1) {
        setQuestionTimer(response.data.results.questions[localCurrentQuestionPosition + 1].duration);
        localStorage.setItem('questionTimer', response.data.results.questions[localCurrentQuestionPosition + 1].duration)
      }
            
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  {/* gets the results of the current session */}
  const getResults = async (token) => {
    try {
      const response = await axios.get(`http://localhost:5005/admin/session/${linkedSession.sessionId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          sessionid: linkedSession.sessionId
        }
      })
      setResults(response.data.results)
      return true;
    } catch (err) {
      alert(err.response.data.error);
      return false;
    }
  }

  const navigate_to_dashboard = async () => {
    navigate('/dashboard');
  }

    
  return (
    <>
      <button onClick={navigate_to_dashboard} className="btn bg-primary hover:!bg-blue-600 text-white absolute top-16 right-6 sm:top-2 sm:right-[8.25rem] sm:btn-lg btn-lg">Dashboard</button>
      {((activeStatus && linkedSession.sessionId === sessionId)) ? (
        <div>
          <div>
            {/* show game content */}
            {renderGameContent()}
          </div>
          <div className="flex justify-center mt-2">
            {/* if the user wants to end teh sesssion */}
            <p className={`p-2 rounded-md text-white !bg-red-600 mr-2 hover:cursor-pointer hover:!bg-red-900 w-auto`}
              onClick={() => {
                endGameMutate(token);
                setGameState("results")
              }}
            >
              <b>End Session</b>
            </p>
            {/* if the gamestate is results, show button for results. if not, advance the game state with next question */}
            <p className={`${gameState === "results" ? "" : "p-2 rounded-md text-white !bg-green-600 mr-2 hover:cursor-pointer hover:!bg-green-900 w-auto"}`}
              onClick={() => {
                advanceGame(token);
                getStatus(localToken)
              }}
            >
              <b>
                {gameState === "results" 
                  ? "" 
                  : gameState === "waitForPlayersJoin" 
                    ? "Start" 
                    : (gameState === "displayQuestions" && currentQuestionPosition + 1 === numberOfQuestions) 
                      ? "View Results" 
                      : "Next Question"}
              </b>
            </p>
          </div>
          
        </div>
                
      ) : (
        <div className="flex flex-col items-center mt-3">
          <h1>{renderGameContent()}</h1>
        </div>
      )}
    </>
  );
};

export default Session;