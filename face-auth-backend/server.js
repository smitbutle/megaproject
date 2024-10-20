const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const port = 5000;
const THRESHOLD = 0.4;  // Distance threshold for verification if less then user is verified

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite Database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      embedding TEXT
    )`);
  }
});

app.post('/register', (req, res) => {
  const { username, embedding } = req.body;
  db.run(`INSERT INTO users (username, embedding) VALUES (?, ?)`, [username, JSON.stringify(embedding)], (err) => {
    if (err) {
      if (err.errno === 19) { // SQLite error code for UNIQUE constraint violation
        res.status(400).send('Username already exists.');
      } else {
        res.status(500).send('Error saving user.');
      }
    } else {
      res.status(200).send('User registered.');
    }
  });
});


// Define the threshold for verification
// Adjust this value as needed

// Verification route
app.post('/verify', (req, res) => {
  const { username, currentEmbedding } = req.body; // Removed threshold from request
  if (typeof currentEmbedding !== 'object' || currentEmbedding === null) {
    return res.status(400).send('Invalid current embedding.');
  }

  db.get(`SELECT embedding FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Error fetching user.');
    } else if (row) {
      let savedEmbedding;
      try {
        savedEmbedding = JSON.parse(row.embedding);
        if (typeof savedEmbedding !== 'object' || savedEmbedding === null) {
          throw new Error('Saved embedding is not an object.');
        }
      } catch (parseErr) {
        console.error('Error parsing saved embedding:', parseErr);
        return res.status(500).send('Error processing user data.');
      }

      const distance = euclideanDistance(currentEmbedding, savedEmbedding);
      const isVerified = distance < THRESHOLD; 

      console.log('Username:', username);
      console.log('Distance:', distance);
      console.log('Is verified:', isVerified);
      res.status(200).json({ isVerified });
    } else {
      res.status(404).send('User not found.');
    }
  });
});

// Get all data from the database for testing purposes
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM users';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


// Function to calculate Euclidean distance between two objects
function euclideanDistance(a, b) {
  const aValues = Object.values(a);
  const bValues = Object.values(b);
  return Math.sqrt(aValues.reduce((acc, val, i) => acc + (val - bValues[i]) ** 2, 0));
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});