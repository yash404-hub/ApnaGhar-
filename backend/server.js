const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB, db } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

const path = require('path');

dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'apnaghar_secret_key_123';
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);

// Complaints API
app.post('/api/complaints', (req, res) => {
  const { userId, name, subject, message } = req.body;
  const complaint = {
    _id: Math.random().toString(36).substr(2, 9),
    userId,
    name,
    subject,
    message,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  db.get('complaints').push(complaint).write();
  res.status(201).json(complaint);
});

app.get('/api/complaints', (req, res) => {
  res.json(db.get('complaints').value());
});

app.put('/api/complaints/:id', (req, res) => {
  const { status } = req.body;
  db.get('complaints').find({ _id: req.params.id }).assign({ status }).write();
  res.json({ message: 'Complaint status updated' });
});

// Config API
const { protect, ownerOnly } = require('./middleware/auth');

app.get('/api/config', (req, res) => {
  const config = db.get('config').value() || { ownerContact: '', emergencyContact: '' };
  res.json(config);
});

app.post('/api/config', protect, ownerOnly, (req, res) => {
  const { ownerContact, emergencyContact } = req.body;
  db.set('config', { ownerContact, emergencyContact }).write();
  res.json({ message: 'Configuration updated successfully', config: { ownerContact, emergencyContact } });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  const frontendPath = path.resolve(__dirname, '../frontend/dist');
  console.log('Serving frontend from:', frontendPath);
  
  if (require('fs').existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.error('Frontend build directory not found at:', frontendPath);
    app.get('*', (req, res) => {
      res.status(500).send('Frontend build is missing. Please run build script.');
    });
  }
} else {
  app.get('/', (req, res) => {
    res.send('ApnaGhar API is running with Socket.IO...');
  });
}

// Socket.IO for Chess
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId, playerName, userId }) => {
    const cleanRoomId = roomId.toLowerCase().trim();
    
    // Leave all other rooms before joining a new one
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
        handleLeaveRoom(room, socket.id);
      }
    });

    socket.join(cleanRoomId);
    
    if (!rooms.has(cleanRoomId)) {
      rooms.set(cleanRoomId, { players: [], game: null });
    }
    
    const room = rooms.get(cleanRoomId);
    
    // Check if player already in room by unique User ID (not just name)
    const existingPlayerIndex = room.players.findIndex(p => p.userId === userId);
    
    console.log(`Join attempt: Room=${cleanRoomId}, Player=${playerName}, UserId=${userId}, Existing=${existingPlayerIndex}, RoomSize=${room.players.length}`);

    if (existingPlayerIndex !== -1) {
      // Re-connecting: update the socket ID but keep the same player entry
      room.players[existingPlayerIndex].id = socket.id;
    } else if (room.players.length < 2) {
      // New player: Assign color based on position
      const color = room.players.length === 0 ? 'white' : 'black';
      room.players.push({ id: socket.id, name: playerName, userId, color });
    } else {
      console.log(`Room ${cleanRoomId} is full. Players:`, room.players.map(p => p.name));
      socket.emit('error', 'Room is full. Chess only supports 2 players.');
      return;
    }

    io.to(cleanRoomId).emit('roomData', { players: room.players });
    
    if (room.players.length === 2) {
      io.to(cleanRoomId).emit('startGame', { 
        white: room.players[0].name, 
        black: room.players[1].name 
      });
    }
  });

  const handleLeaveRoom = (roomId, socketId) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const playerIndex = room.players.findIndex(p => p.id === socketId);
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name;
        console.log(`Player ${playerName} left Room ${roomId}`);
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit('roomData', { players: room.players });
        io.to(roomId).emit('playerDisconnected', { playerName });
        if (room.players.length === 0) {
          rooms.delete(roomId);
        }
      }
    }
  };

  socket.on('leaveRoom', ({ roomId }) => {
    const cleanRoomId = roomId.toLowerCase().trim();
    socket.leave(cleanRoomId);
    handleLeaveRoom(cleanRoomId, socket.id);
  });

  socket.on('move', ({ roomId, move }) => {
    const cleanRoomId = roomId.toLowerCase().trim();
    socket.to(cleanRoomId).emit('move', move);
  });

  socket.on('chatMessage', ({ roomId, message, sender }) => {
    const cleanRoomId = roomId.toLowerCase().trim();
    io.to(cleanRoomId).emit('chatMessage', { message, sender });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name;
        console.log(`Player ${playerName} leaving Room ${roomId}`);
        
        // Remove player from room
        room.players.splice(playerIndex, 1);
        
        // Notify remaining player
        io.to(roomId).emit('roomData', { players: room.players });
        io.to(roomId).emit('playerDisconnected', { playerName });
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          console.log(`Room ${roomId} is now empty and deleted.`);
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

app.get('/', (req, res) => {
  res.send('ApnaGhar API is running with Socket.IO...');
});

const PORT = process.env.PORT || 5001;

// Use host 0.0.0.0 for Render
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
