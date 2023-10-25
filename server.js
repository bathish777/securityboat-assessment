const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the Task model
const Task = mongoose.model('Task', {
  title: String,
  description: String,
  completed: Boolean,
  userId: String,
});

app.use(express.json());

// Sample middleware for JWT authentication
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// CRUD operations for tasks
app.post('/tasks', authenticateToken, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.user.id });
  await task.save();
  io.emit('task-created', task);
  res.status(201).json(task);
});

app.get('/tasks', authenticateToken, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit('task-updated', updatedTask);
  res.json(updatedTask);
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  const deletedTask = await Task.findByIdAndDelete(req.params.id);
  io.emit('task-deleted', deletedTask);
  res.sendStatus(204);
});

// Serve static files
app.use(express.static('public'));

// Socket.io real-time functionality
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


