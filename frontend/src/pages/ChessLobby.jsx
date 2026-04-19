import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Plus, Users, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const ChessLobby = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 7);
    navigate(`/chess/${newRoomId}`);
    toast.success('Room created! Share the link with a friend.');
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/chess/${roomCode.trim().toLowerCase()}`);
    } else {
      toast.error('Please enter a room code');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex p-4 rounded-3xl bg-blue-500/20 text-blue-400 mb-6">
          <Gamepad2 className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">ApnaGhar Chess</h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Challenge fellow tenants to a game of strategy. Create a room and share the link to start playing instantly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-10 flex flex-col items-center text-center space-y-8"
        >
          <div className="p-6 rounded-full bg-green-500/10 text-green-400">
            <Plus className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Create New Game</h2>
            <p className="text-white/40">Start a fresh match and invite anyone with a unique link.</p>
          </div>
          <button onClick={createRoom} className="btn-premium w-full flex items-center justify-center gap-2 h-14 text-lg">
            Create Room <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-10 flex flex-col items-center text-center space-y-8"
        >
          <div className="p-6 rounded-full bg-purple-500/10 text-purple-400">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Join Existing Game</h2>
            <p className="text-white/40">Have a room code? Enter it below to join the battle.</p>
          </div>
          <form onSubmit={joinRoom} className="w-full space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Paste code (e.g. xg2dwk6)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="input-premium h-14 text-center text-xl font-mono tracking-widest uppercase"
              />
            </div>
            <button type="submit" className="w-full h-14 rounded-full glass border border-white/20 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2">
              <ArrowRight className="w-5 h-5" /> Join Match
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ChessLobby;
