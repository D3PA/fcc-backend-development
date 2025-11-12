const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('connected to mongodb');
}).catch(err => {
  console.error('mongodb connection error:', err);
});

// schemas y models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST - create new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json(existingUser);
    }
    
    const newUser = new User({ username });
    await newUser.save();
    
    res.json({
      username: newUser.username,
      _id: newUser._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// GET - get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// POST - add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration are required' });
    }
    
    const durationNum = parseInt(duration);
    if (isNaN(durationNum)) {
      return res.status(400).json({ error: 'Duration must be a number' });
    }
    
    const exerciseData = {
      userId: user._id,
      username: user.username,
      description: description,
      duration: durationNum
    };
    
    if (date) {
      if (!isNaN(new Date(date).getTime())) {
        exerciseData.date = new Date(date);
      }
    }
    
    const newExercise = new Exercise(exerciseData);
    await newExercise.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding exercise' });
  }
});

// GET - get exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let query = { userId: user._id };
    
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    
    let exercisesQuery = Exercise.find(query, 'description duration date');
    
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum)) {
        exercisesQuery = exercisesQuery.limit(limitNum);
      }
    }
    
    const exercises = await exercisesQuery.exec();
    
    const log = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }));
    
    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching log' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
