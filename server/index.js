const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  
  console.log('Conectado ao MySQL! Preparando banco de dados...');
  
  connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
    if (err) throw err;
    
    connection.query(`USE ${process.env.DB_NAME}`, (err) => {
      if (err) throw err;
      
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          avatar_url LONGTEXT
        )
      `;
      
      const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(36) PRIMARY KEY,
          user_email VARCHAR(100) NOT NULL,
          description VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          type ENUM('income', 'expense') NOT NULL,
          category VARCHAR(50) DEFAULT 'Geral',
          FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
      `;
      
      connection.query(createUsersTable, (err) => {
        if (err) console.error('Erro ao criar tabela users:', err);
        connection.query(createTransactionsTable, (err) => {
          if (err) console.error('Erro ao criar tabela transactions:', err);
          console.log('Banco de dados e tabelas prontos para uso!');
        });
      });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length > 0) {
      const user = results[0];
      delete user.password;
      res.json(user);
    } else {
      res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }
  });
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'E-mail já cadastrado' });
      return res.status(500).json(err);
    }
    res.json({ name, email });
  });
});

app.get('/transactions/:email', (req, res) => {
  connection.query('SELECT * FROM transactions WHERE user_email = ? ORDER BY date DESC', [req.params.email], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post('/transactions', (req, res) => {
  const { id, user_email, description, amount, date, type, category } = req.body;
  connection.query(
    'INSERT INTO transactions (id, user_email, description, amount, date, type, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, user_email, description, amount, date, type, category],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

app.put('/transactions/:id', (req, res) => {
  const { description, amount, date, type } = req.body;
  connection.query(
    'UPDATE transactions SET description = ?, amount = ?, date = ?, type = ? WHERE id = ?',
    [description, amount, date, type, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

app.delete('/transactions/:id', (req, res) => {
  connection.query('DELETE FROM transactions WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.put('/profile', (req, res) => {
  const { name, avatar_url, email } = req.body;
  connection.query('UPDATE users SET name = ?, avatar_url = ? WHERE email = ?', [name, avatar_url, email], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
