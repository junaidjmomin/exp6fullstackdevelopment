const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Task = require('./models/Task');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// Serve the plain HTML frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://junaidm:Junaid%402026@mongoprac.39tt8zp.mongodb.net/tasktracker?retryWrites=true&w=majority&appName=MongoPrac', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- APIs ---

// POST /tasks - Create task
app.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /tasks - Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id - Update task (e.g., status)
app.put('/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /tasks/:id - Delete task
app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
