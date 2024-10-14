const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
// const { OpenAI } = require("openai");
// const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const {Groq} = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.Gorq_API_KEY });

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST']
  }
  });

// Configure CORS with specific options
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

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

app.post('/api/ai/chat', validateApiKey, async (req, res) => {
  try {
    const { message } = req.body;

    // Validate incoming message
    if (!message) {
      return res.status(400).json({
        error: 'Bad request',
        details: 'Message is required',
      });
    }

    // Get the AI response from Groq
    const chatCompletion = await getGroqChatCompletion(message);
    
    // Handle the response and send it back to the frontend
    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    
    // Process the AI response
    const finalResponse = aiResponse
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
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
            .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1 headers
            .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2 headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3 headers
            .replace(/^- (.*$)/gm, '<li>$1</li>') // Unordered list items
            .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>') // Ordered list items
        };
      }
    }).filter(part => part && part.content.trim() !== '');

    // Send the processed response back
    res.json({ response: processedParts });
  } catch (error) {
    console.error('Error processing AI chat:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
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
  console.log(`CORS enabled for origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});