const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto-js");
const app = express();
const cors = require("cors");
const port = 5000;
const THRESHOLD = 0.4;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      embedding TEXT
    )`);
  }
});

const decryptionKey = "YOUR_SECRET_KEY_HERE";

const decryptData = (encryptedData) => {
  const bytes = crypto.AES.decrypt(encryptedData, decryptionKey);
  return JSON.parse(bytes.toString(crypto.enc.Utf8));
};

app.post("/register", (req, res) => {
  const { username, embedding } = req.body;
  const decryptedEmbedding = decryptData(embedding);

  db.run(
    `INSERT INTO users (username, embedding) VALUES (?, ?)`,
    [username, JSON.stringify(decryptedEmbedding)],
    (err) => {
      if (err) {
        if (err.errno === 19) {
          res.status(400).send("Username already exists.");
        } else {
          res.status(500).send("Error saving user.");
        }
      } else {
        res.status(200).send("User registered.");
      }
    }
  );
});

app.post("/verify", (req, res) => {
  const { username, currentEmbedding } = req.body;
  const decryptedCurrentEmbedding = decryptData(currentEmbedding);

  db.get(`SELECT embedding FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error("Error fetching user:", err);
      res.status(500).send("Error fetching user.");
    } else if (row) {
      let savedEmbedding = JSON.parse(row.embedding);
      const distance = euclideanDistance(decryptedCurrentEmbedding, savedEmbedding);
      const isVerified = distance < THRESHOLD;

      res.status(200).json({ isVerified });
    } else {
      res.status(404).send("User not found.");
    }
  });
});

function euclideanDistance(a, b) {
  return Math.sqrt(
    Object.values(a).reduce((acc, val, i) => acc + (val - Object.values(b)[i]) ** 2, 0)
  );
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
