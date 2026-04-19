import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Send, User, Trophy, Clock, ArrowLeft, Share2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);

const ChessGame = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [status, setStatus] = useState('Waiting for opponent...');
  const [timers, setTimers] = useState({ white: 300, black: 300 });
  const [isGameStarted, setIsGameStarted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    socket.emit('joinRoom', { roomId, playerName: user.name, userId: user._id });

    socket.on('roomData', ({ players }) => {
      setPlayers(players);
      const currentPlayer = players.find(p => p.name === user.name);
      if (currentPlayer) {
        setOrientation(currentPlayer.color);
      }
    });

    socket.on('startGame', ({ white, black }) => {
      setStatus(`Playing: ${white} vs ${black}`);
      setIsGameStarted(true);
      toast.success('Match Started!');
      startTimer();
    });

    socket.on('move', (move) => {
      makeMove(move);
    });

    socket.on('chatMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('playerDisconnected', ({ playerName }) => {
      setStatus(`Opponent disconnected. Waiting for re-join...`);
      setIsGameStarted(false);
      toast.error('Opponent disconnected');
      clearInterval(timerRef.current);
    });

    socket.on('error', (err) => {
      toast.error(err);
      navigate('/chess');
    });

    return () => {
      socket.emit('leaveRoom', { roomId });
      socket.off('roomData');
      socket.off('startGame');
      socket.off('move');
      socket.off('chatMessage');
      socket.off('playerDisconnected');
      socket.off('error');
      clearInterval(timerRef.current);
    };
  }, [roomId, user.name]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimers(prev => {
        const turn = game.turn() === 'w' ? 'white' : 'black';
        if (prev[turn] <= 0) {
          clearInterval(timerRef.current);
          setStatus(`Game Over: ${turn === 'white' ? 'Black' : 'White'} wins on time!`);
          return prev;
        }
        return { ...prev, [turn]: prev[turn] - 1 };
      });
    }, 1000);
  };

  const makeMove = useCallback((move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        checkGameOver(gameCopy);
        return true;
      }
    } catch (e) {
      console.error('Invalid move', e);
      return false;
    }
    return false;
  }, [game]);

  const onDrop = (sourceSquare, targetSquare) => {
    if (!isGameStarted) return false;
    
    const turn = game.turn() === 'w' ? 'white' : 'black';
    if (turn !== orientation) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const moveMade = makeMove(move);
    if (moveMade) {
      socket.emit('move', { roomId, move });
    }
    return moveMade;
  };

  const checkGameOver = (currentGame) => {
    if (currentGame.isCheckmate()) {
      setStatus(`Checkmate! ${currentGame.turn() === 'w' ? 'Black' : 'White'} wins!`);
      toast.success('Game Over!');
      clearInterval(timerRef.current);
    } else if (currentGame.isDraw()) {
      setStatus('Draw!');
      clearInterval(timerRef.current);
    } else if (currentGame.isCheck()) {
      toast('Check!', { icon: '⚠️' });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      socket.emit('chatMessage', { roomId, message: inputMessage, sender: user.name });
      setInputMessage('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Room link copied!');
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 px-4">
      {/* Left Column: Board & Controls */}
      <div className="lg:col-span-8 space-y-6">
        <header className="flex items-center justify-between">
          <button onClick={() => navigate('/chess')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Lobby
          </button>
          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 flex flex-col items-center">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Room Code</span>
              <span className="text-sm font-mono font-bold text-blue-400">{roomId}</span>
            </div>
            <div className="glass px-4 py-2 flex items-center gap-2 h-full">
              <div className={`w-2 h-2 rounded-full ${players.length === 2 ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              <span className="text-sm font-medium text-white/80">{players.length}/2 Players</span>
            </div>
            <button 
              onClick={copyRoomLink} 
              className="p-3 rounded-xl glass hover:bg-white/10 text-blue-400 transition-all flex items-center gap-2"
              title="Copy Room Link"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Invite</span>
            </button>
          </div>
        </header>

        <div className="relative aspect-square max-w-[600px] mx-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl overflow-hidden shadow-2xl border-8 border-white/5"
          >
            <Chessboard 
              position={game.fen()} 
              onPieceDrop={onDrop} 
              boardOrientation={orientation}
              customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
              customLightSquareStyle={{ backgroundColor: '#334155' }}
            />
          </motion.div>
          
          <AnimatePresence>
            {game.isCheck() && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg"
              >
                CHECK!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="glass p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${game.turn() === 'w' ? 'bg-white text-black' : 'bg-black text-white'} border border-white/10`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Current Status</p>
              <h3 className="text-xl font-bold text-white">{status}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Players & Chat */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Opponents
          </h2>
          <div className="space-y-4">
            {players.map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{p.name}</p>
                    <p className="text-white/40 text-xs">{idx === 0 ? 'White' : 'Black'}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-xl font-mono font-bold ${timers[idx === 0 ? 'white' : 'black'] < 60 ? 'text-red-400' : 'text-white'}`}>
                  <Clock className="w-4 h-4" />
                  {formatTime(timers[idx === 0 ? 'white' : 'black'])}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col h-[400px]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-400" /> Game Chat
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === user.name ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-white/40 mb-1">{msg.sender}</span>
                <div className={`px-4 py-2 rounded-2xl text-sm ${msg.sender === user.name ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              placeholder="Send message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="input-premium pr-12 h-12"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
