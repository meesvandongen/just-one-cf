import { useState, useEffect } from "react";
import { useGameRoom } from "@/hooks/useGameRoom";
import { GameState, GamePhase } from "../../game/logic";
import QRCode from "react-qr-code";

interface GameProps {
  username: string;
  roomId: string;
}

const Game = ({ username, roomId }: GameProps) => {
  const { gameState, dispatch } = useGameRoom(username, roomId);
  
  // Local state for UI interactions
  const [clueInput, setClueInput] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const [selectedInvalidClues, setSelectedInvalidClues] = useState<string[]>([]);
  const [gameCodeInput, setGameCodeInput] = useState("");
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Indicated that the game is loading
  if (gameState === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <p className="text-xl">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  const currentUser = gameState.users.find(user => user.id === username);
  const isHost = currentUser?.isHost || false;
  const isCurrentGuesser = gameState.currentGuesser === username;
  const isCurrentChecker = gameState.currentChecker === username;

  // Handle joining a session
  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCodeInput.length === 8 && playerNameInput.trim()) {
      dispatch({
        type: "join-session",
        gameCode: gameCodeInput.toUpperCase(),
        playerName: playerNameInput.trim()
      });
      setShowJoinForm(false);
    }
  };

  // Handle clue submission
  const handleSubmitClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (clueInput.trim() && gameState.gamePhase === 'writing-clues' && !isCurrentGuesser) {
      dispatch({
        type: "submit-clue",
        clue: clueInput.trim()
      });
      setClueInput("");
    }
  };

  // Handle guess submission
  const handleSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (guessInput.trim() && gameState.gamePhase === 'guessing' && isCurrentGuesser) {
      dispatch({
        type: "submit-guess",
        guess: guessInput.trim()
      });
      setGuessInput("");
    }
  };

  // Handle duplicate checking
  const handleMarkInvalidClues = () => {
    if (gameState.gamePhase === 'checking-duplicates' && isCurrentChecker) {
      dispatch({
        type: "mark-invalid-clues",
        invalidClues: selectedInvalidClues
      });
      setSelectedInvalidClues([]);
    }
  };

  // Toggle clue selection for duplicate checking
  const toggleClueSelection = (clue: string) => {
    setSelectedInvalidClues(prev => 
      prev.includes(clue) 
        ? prev.filter(c => c !== clue)
        : [...prev, clue]
    );
  };

  // Render different phases
  const renderGameContent = () => {
    switch (gameState.gamePhase) {
      case 'lobby':
        return renderLobby();
      case 'writing-clues':
        return renderWritingClues();
      case 'checking-duplicates':
        return renderCheckingDuplicates();
      case 'reviewing-clues':
        return renderReviewingClues();
      case 'guessing':
        return renderGuessing();
      case 'round-end':
        return renderRoundEnd();
      case 'set-end':
        return renderSetEnd();
      default:
        return <div>Unknown game phase</div>;
    }
  };

  const renderLobby = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🎯 Just One</h1>
        <p className="text-lg text-gray-600 mb-6">Cooperative word guessing game</p>
        
        {!currentUser && (
          <div className="mb-6">
            <button
              onClick={() => setShowJoinForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
            >
              Join Game
            </button>
          </div>
        )}

        {showJoinForm && (
          <form onSubmit={handleJoinSession} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Join Game</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Game Code (8 letters)"
                value={gameCodeInput}
                onChange={(e) => setGameCodeInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {currentUser && (
        <>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Game Code</h2>
              <div className="bg-black text-white text-3xl font-mono p-4 rounded-lg mb-4">
                {gameState.gameCode}
              </div>
              <p className="text-sm text-gray-600">Share this code with other players</p>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">QR Code</h2>
              <div className="flex justify-center mb-4">
                <QRCode 
                  value={`${window.location.origin}?join=${gameState.gameCode}`}
                  size={150}
                />
              </div>
              <p className="text-sm text-gray-600">Scan to join quickly</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Players ({gameState.users.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {gameState.users.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg border ${user.isHost ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100'}`}
                >
                  <div className="font-semibold">{user.name}</div>
                  {user.isHost && <div className="text-sm text-yellow-700">👑 Host</div>}
                </div>
              ))}
            </div>
          </div>

          {isHost && gameState.users.length >= 3 && (
            <div className="text-center">
              <button
                onClick={() => dispatch({ type: "start-set" })}
                className="bg-green-500 text-white px-8 py-4 rounded-lg text-xl hover:bg-green-600"
              >
                Start Game
              </button>
            </div>
          )}

          {gameState.users.length < 3 && (
            <div className="text-center text-gray-600">
              Need at least 3 players to start the game
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderWritingClues = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">✏️ Writing Clues</h1>
        <div className="text-lg mb-4">
          Score: {gameState.setScore}/{gameState.gamesAttempted} | Target: {gameState.setTarget}
        </div>
        
        {isCurrentGuesser ? (
          <div className="bg-blue-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">You are the guesser!</h2>
            <p className="text-lg">Wait while others write clues for you...</p>
            <div className="mt-4 text-6xl">🤔</div>
          </div>
        ) : (
          <div className="bg-green-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">The word is:</h2>
            <div className="text-4xl font-bold mb-4">{gameState.currentWord}</div>
            <p className="text-lg mb-4">
              Write ONE word clue for {gameState.users.find(u => u.id === gameState.currentGuesser)?.name}
            </p>
            
            {!gameState.submittedClues[username] ? (
              <form onSubmit={handleSubmitClue} className="flex gap-2 justify-center">
                <input
                  type="text"
                  value={clueInput}
                  onChange={(e) => setClueInput(e.target.value)}
                  placeholder="Enter one word clue"
                  className="px-4 py-2 border rounded-lg text-lg"
                  maxLength={30}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Submit Clue
                </button>
              </form>
            ) : (
              <div className="text-lg text-green-700">
                ✓ Clue submitted! Waiting for others...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Progress</h3>
        <div className="text-sm">
          {Object.keys(gameState.submittedClues).length} of {gameState.users.length - 1} clues submitted
        </div>
      </div>

      {isHost && (
        <div className="mt-8 text-center">
          <button
            onClick={() => dispatch({ type: "pass-word" })}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
          >
            Skip Word
          </button>
          <button
            onClick={() => dispatch({ type: "end-round" })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            End Round
          </button>
        </div>
      )}
    </div>
  );

  const renderCheckingDuplicates = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🔍 Checking Duplicates</h1>
        
        {isCurrentChecker ? (
          <div className="bg-orange-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">You are checking for duplicates!</h2>
            <p className="text-lg mb-4">Mark any clues that should be removed:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
              {gameState.validClues.map((clue, index) => (
                <button
                  key={index}
                  onClick={() => toggleClueSelection(clue)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedInvalidClues.includes(clue)
                      ? 'bg-red-200 border-red-400 text-red-800'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {clue}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleMarkInvalidClues}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
            >
              Finish Checking ({selectedInvalidClues.length} marked invalid)
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Duplicate Check in Progress</h2>
            <p className="text-lg">
              {gameState.users.find(u => u.id === gameState.currentChecker)?.name} is checking for duplicates...
            </p>
            <div className="mt-4 text-4xl">⏳</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReviewingClues = () => (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">📋 Clues Ready</h1>
      <p className="text-lg mb-4">Preparing clues for the guesser...</p>
      <div className="text-4xl">✨</div>
    </div>
  );

  const renderGuessing = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🎯 Guessing Time</h1>
        <div className="text-lg mb-4">
          Score: {gameState.setScore}/{gameState.gamesAttempted} | Target: {gameState.setTarget}
        </div>
        
        {isCurrentGuesser ? (
          <div className="bg-blue-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your turn to guess!</h2>
            <p className="text-lg mb-6">Here are the clues:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {gameState.validClues.map((clue, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border-2 border-blue-300 text-lg font-semibold"
                >
                  {clue}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSubmitGuess} className="flex gap-2 justify-center">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="What's your guess?"
                className="px-4 py-3 border rounded-lg text-lg"
                required
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
              >
                Guess!
              </button>
            </form>
            
            <button
              onClick={() => dispatch({ type: "submit-guess", guess: "PASS" })}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Pass
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              {gameState.users.find(u => u.id === gameState.currentGuesser)?.name} is guessing...
            </h2>
            <div className="text-4xl">🤔</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRoundEnd = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">📊 Round Complete</h1>
        
        <div className={`p-6 rounded-lg ${gameState.lastGuessCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="text-6xl mb-4">
            {gameState.lastGuessCorrect ? '🎉' : '😔'}
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {gameState.lastGuessCorrect ? 'Correct!' : 'Incorrect'}
          </h2>
          <p className="text-lg mb-2">
            The word was: <strong>{gameState.currentWord}</strong>
          </p>
          <p className="text-lg mb-4">
            Guess: <strong>{gameState.lastGuess}</strong>
          </p>
          <div className="text-xl">
            Score: {gameState.setScore}/{gameState.gamesAttempted}
          </div>
        </div>
      </div>

      {isHost && (
        <div className="text-center">
          <button
            onClick={() => dispatch({ type: "next-round" })}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Next Round
          </button>
        </div>
      )}
    </div>
  );

  const renderSetEnd = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🏆 Set Complete!</h1>
        
        <div className="bg-purple-100 p-6 rounded-lg mb-6">
          <div className="text-6xl mb-4">🎊</div>
          <h2 className="text-3xl font-semibold mb-4">Final Score</h2>
          <div className="text-4xl font-bold mb-2">
            {gameState.setScore} / {gameState.setTarget}
          </div>
          
          <div className="text-lg">
            {gameState.setScore >= 13 ? 'Excellent!' : 
             gameState.setScore >= 11 ? 'Very Good!' :
             gameState.setScore >= 8 ? 'Good!' : 'Keep trying!'}
          </div>
        </div>

        {gameState.setHistory.length > 1 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Previous Sets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {gameState.setHistory.slice(0, -1).map((set, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded">
                  Set {index + 1}: {set.score}/{set.target}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isHost && (
        <div className="text-center space-x-4">
          <button
            onClick={() => dispatch({ type: "start-set" })}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Play Another Set
          </button>
          <button
            onClick={() => dispatch({ type: "end-session" })}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderGameContent()}
      
      {/* Game Log */}
      {gameState.log.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 bg-white border rounded-lg shadow-lg p-4 max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Game Log</h3>
          {gameState.log.map((logEntry, i) => (
            <p key={logEntry.dt} className="text-sm text-gray-600 mb-1">
              {logEntry.message}
            </p>
          ))}
        </div>
      )}

      {/* Host Controls */}
      {isHost && gameState.gamePhase !== 'lobby' && (
        <div className="fixed bottom-4 left-4 bg-white border rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-2">Host Controls</h3>
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: "end-set" })}
              className="block w-full bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
            >
              End Set
            </button>
            <button
              onClick={() => dispatch({ type: "end-session" })}
              className="block w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
