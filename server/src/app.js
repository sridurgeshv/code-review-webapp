const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const marked = require('marked');
require('dotenv').config();
const {Groq} = require("groq-sdk");
const mongoose = require('mongoose');
const groq = new Groq({ apiKey: process.env.Gorq_API_KEY });

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST']
  }
  });

// Enable CORS for the Express app
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Set up SQLite database
let db;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  
  // Create projects table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT,
      template TEXT,
      code TEXT,
      lastEdited TEXT
    )
  `);

  // Create collaborations table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS collaborations (
      id TEXT PRIMARY KEY,
      userId TEXT,
      collaboratorId TEXT,
      projectId TEXT,
      projectTitle TEXT,
      createdAt TEXT
    )
  `); 

})();


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  displayName: String,
  photoURL: String,
});

const User = mongoose.model('User', userSchema);

// Define Collaboration schema and model
const collaborationSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  userId: String,
  collaboratorId: String,
  projectId: String,
  projectTitle: String,
  createdAt: { type: Date, default: Date.now }
});

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

// Endpoint to save user data
app.post('/api/save-user', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;

  try {
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, email, displayName, photoURL });
      await user.save();
    }
    res.status(200).json({ message: 'User saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving user', error });
  }
});

// Endpoint to get collaborations for a user
app.get('/api/get-collaborations/:userId', async (req, res) => {
  try {
  const collaborations = await db.all(
  'SELECT DISTINCT collaboratorId, projectId, projectTitle, MAX(createdAt) as createdAt FROM collaborations WHERE userId = ? GROUP BY collaboratorId ORDER BY createdAt DESC LIMIT 5',
  req.params.userId
  );
  
  const collaboratorIds = collaborations.map(c => c.collaboratorId);
  const collaborators = await User.find({ uid: { $in: collaboratorIds } });
  
  const result = collaborations.map(c => {
  const collaborator = collaborators.find(user => user.uid === c.collaboratorId);
  return {
  id: c.projectId,
  projectTitle: c.projectTitle,
  createdAt: c.createdAt,
  collaborator: {
  uid: collaborator.uid,
  displayName: collaborator.displayName,
  photoURL: collaborator.photoURL
  }
  };
  });
  
  res.json(result);
  } catch (error) {
  res.status(500).json({ message: 'Error fetching collaborations', error: error.message });
  }
  });

/* Middleware to validate Gemini API key
const validateApiKey = (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Gemini API key is not configured'
    });
  }
  next();
}; */

// Middleware to validate Gorq API key
const validateApiKey = (req, res, next) => {
  if (!process.env.Gorq_API_KEY) {
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Groq API key is not configured'
    });
  }
  next();
};

// Store room state
const rooms = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint to execute code
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
      default:
          return res.status(400).json({ error: 'Unsupported language' });
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

// Function to get chat completion from Groq API
const getGroqChatCompletion = async (userMessageContent) => {
  return groq.chat.completions.create({
    messages: [
      {
        role: "assistant",
        content: "You are a professional programming assistant. Format your responses with clear code blocks and concise explanations. Always wrap code snippets in triple backticks with the appropriate language identifier..",
      },
      {
        role: "user",
        content: userMessageContent, // Dynamic message content
      },
    ],
    model: "llama3-8b-8192",
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    stop: null,
    stream: false,
  });
};

/* 
// AI endpoint
app.post('/api/ai/chat', validateApiKey, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Bad request',
        details: 'Message is required'
      });
    }

   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{text: "You are a professional programming assistant. Format your responses with clear code blocks and concise explanations. Always wrap code snippets in triple backticks with the appropriate language identifier."}]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const formattedMessage = `Provide a professional response with proper formatting for this programming question: ${message}`;
    const result = await chat.sendMessage([{text: formattedMessage}]);

    const response = result.response;
    const finalResponse = response.text()
      .replace(/```(\w+)\n/g, (match, lang) => `<code_block language="${lang}">`)
      .replace(/```/g, '</code_block>')
      .trim();

    // Split the response into text and code blocks
    const parts = finalResponse.split(/(<code_block.*?<\/code_block>)/);
    
    const processedParts = parts.map(part => {
      if (part.startsWith('<code_block')) {
        // Extract language and code from code blocks
        const match = part.match(/<code_block language="(\w+)">([\s\S]*?)<\/code_block>/);
        if (match) {
          return {
            type: 'code',
            language: match[1],
            content: match[2].trim()
          };
        }
      } else {
        // Process text parts
        return {
          type: 'text',
          content: part.trim()
           .replace(/\*\*(.*?)\*\/g, '<strong>$1</strong>') // Bold text
          //  .replace(/\*(.*?)\*g, '<em>$1</em>') // Italic text
          //  .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1 headers
          //  .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2 headers
          //  .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3 headers
          //  .replace(/^- (.*$)/gm, '<li>$1</li>') // Unordered list items
          //  .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>') // Ordered list items
       // };
     // }
   // }).filter(part => part && part.content.trim() !== '');

    /* res.json({ response: processedParts });

  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}); */

// Configure marked options for Markdown parsing
marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, language) {
    const hljs = require('highlight.js');
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(validLanguage, code).value;
  },
  gfm: true,
  breaks: true, // Enable line breaks
  smartLists: true,
  xhtml: false
});

// Function to format AI response
function formatAIResponse(htmlContent) {
  return htmlContent; // Remove the wrapping div
}

// Endpoint for AI chat
app.post('/api/ai/chat', validateApiKey, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Bad request',
        details: 'Message is required',
      });
    }

    const chatCompletion = await getGroqChatCompletion(message);
    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    
    // Convert markdown to HTML with custom options
    const htmlResponse = marked.parse(aiResponse);

    // Wrap the response in a consistent structure
    const formattedResponse = formatAIResponse(htmlResponse);

    // Send the formatted HTML response back
    res.json({ response: formattedResponse });
  } catch (error) {
    console.error('Error processing AI chat:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Endpoint to update user information
app.post('/api/update-user', async (req, res) => {
  const { uid, displayName, photoURL } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { displayName, photoURL },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit a socket event to notify clients of the user update
    io.emit('user-update', { uid, displayName, photoURL });

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Save project endpoint
app.post('/api/save-project', async (req, res) => {
  const { id, title, template, code, lastEdited } = req.body;
  try {
    await db.run(
      'INSERT OR REPLACE INTO projects (id, title, template, code, lastEdited) VALUES (?, ?, ?, ?, ?)',
      [id, title, template, code, lastEdited]
    );
    res.json({ message: 'Project saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get a specific project
app.get('/api/get-project/:id', async (req, res) => {
  try {
    const project = await db.get('SELECT * FROM projects WHERE id = ?', req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get all projects
app.get('/api/get-all-projects', async (req, res) => {
  try {
    const projects = await db.all('SELECT id, title, template, lastEdited FROM projects');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  socket.on('join-room', async ({ roomId, user, template, projectTitle }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      const project = await db.get('SELECT * FROM projects WHERE id = ?', roomId);
      rooms.set(roomId, {
        users: new Map(),
        code: project ? project.code : '',
        version: 0,
        template: project ? project.template : template,
        title: project ? project.title : (projectTitle || 'New Project')
      });
    }
  
    const room = rooms.get(roomId);
  
    // Record collaboration for each existing user in the room
    for (const [, existingUser] of room.users) {
      if (existingUser.uid !== user.uid) {
        const id = uuidv4();
        const createdAt = new Date().toISOString();
  
        await db.run(`
          INSERT OR REPLACE INTO collaborations 
          (id, userId, collaboratorId, projectId, projectTitle, createdAt) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [id, existingUser.uid, user.uid, roomId, room.title, createdAt]);
  
        await db.run(`
          INSERT OR REPLACE INTO collaborations 
          (id, userId, collaboratorId, projectId, projectTitle, createdAt) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [uuidv4(), user.uid, existingUser.uid, roomId, room.title, createdAt]);
      }
    }

    room.users.set(socket.id, user);

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

    // Handle title updates
  socket.on('update-title', ({ roomId, title }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.title = title;
      io.to(roomId).emit('title-update', { title });
    }
  });

  // Handle code changes
  socket.on('code-save', async ({ roomId, code, version, userId, projectDetails }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.code = code;
    room.version = version;

    await db.run(
      'INSERT OR REPLACE INTO projects (id, title, template, code, lastEdited) VALUES (?, ?, ?, ?, ?)',
      [roomId, projectDetails.title, projectDetails.language, code, projectDetails.lastEdited]
    );

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
  console.log(`CORS enabled for origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});