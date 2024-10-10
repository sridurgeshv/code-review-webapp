const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store room state
const rooms = new Map();

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Code execution endpoint
app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;
  const tempDir = path.join(__dirname, 'temp');
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    let fileName, command;
    switch(language) {
      case 'Python':
          fileName = 'program.py';
          command = 'python';
          break;
      case 'Node.js':
          fileName = 'program.js';
          command = 'node';
          break;
          case 'C':
            fileName = 'program.c';
            command = 'gcc program.c -o program && program';
            break;
        case 'C++':
            fileName = 'program.cpp';
            command = 'g++ program.cpp -o program && program'; 
            break;
      case 'Java':
          fileName = 'Program.java';
          command = 'javac Program.java && java Program';
          break;
      case 'React':
          fileName = 'App.jsx'; // Adjust as needed
          command = 'npm start'; // Assumes a React setup
          break;
      case 'HTML':
          fileName = 'index.html';
          command = 'start index.html'; // Open in default browser
          break;
      case 'CSS':
          fileName = 'styles.css';
          command = 'start index.html'; // Open in default browser
          break;
      case 'JS':
          fileName = 'script.js';
          command = 'node script.js'; // For running JS files
          break;
      default:
          return res.status(400).json({ error: 'Unsupported language' });
  }
  
  // For HTML, CSS, and JS to run together, ensure they are served correctly.
  if (language === 'HTML' || language === 'CSS' || language === 'JS') {
      command = 'start index.html'; // Adjust as needed to serve all files together
  }  

  const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code);
    
    exec(`cd ${tempDir} && ${command} ${fileName}`, (error, stdout, stderr) => {
      // Clean up temp files
      fs.unlink(filePath).catch(console.error);
      if (error) {
        return res.json({ output: stderr });
      }
      res.json({ output: stdout });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {

  // Handle room joining
  socket.on('join-room', ({ roomId, user, template, projectTitle }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        code: '',
        version: 0,
        template,
        title: projectTitle || 'New Project'
      });
    }
  
    const room = rooms.get(roomId);

    // Remove any existing entries for this user
  for (const [socketId, existingUser] of room.users.entries()) {
    if (existingUser.uid === user.uid) {
      room.users.delete(socketId);
    }
  }
  
  room.users.set(socket.id, user);
    
    // Send room state including template to new user
    socket.emit('init-room', {
      code: room.code,
      version: room.version,
      template: room.template,
      users: Array.from(room.users.values()),
      title: room.title
    });

    io.to(roomId).emit('room-users', {
      users: Array.from(room.users.values())
    });
  });

  socket.on('update-title', ({ roomId, title }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.title = title;
      io.to(roomId).emit('title-update', { title });
    }
  });

  // Handle code changes
  socket.on('code-save', ({ roomId, code, version, userId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.code = code;
    room.version = version;

    // Broadcast to ALL clients in the room (including sender for confirmation)
    io.in(roomId).emit('code-update', {
      code,
      version,
      userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        
        io.to(roomId).emit('room-users', {
          users: Array.from(room.users.values())
        });

        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});