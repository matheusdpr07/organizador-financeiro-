const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ACEITAR TUDO PARA TESTE
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => res.send('Backend Online e Pronto!'));

const dbURL = process.env.MYSQL_URL || process.env.MYSQL_URL; 

let connection;

function handleDisconnect() {
  console.log('Tentando conectar ao MySQL...');
  
  const config = dbURL || {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS,
    port: process.env.MYSQLPORT || 3306,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME
  };

  connection = mysql.createConnection(config);

  connection.connect(err => {
    if (err) {
      console.error('ERRO AO CONECTAR NO BANCO:', err.message);
      setTimeout(handleDisconnect, 2000); // Tenta de novo em 2s
    } else {
      console.log('CONECTADO AO MYSQL COM SUCESSO!');
      
      connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          avatar_url LONGTEXT
        )
      `);
      
      connection.query(`
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
      `);
    }
  });

  connection.on('error', err => {
    console.error('Erro no banco de dados:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results && results.length > 0) {
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
  connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'E-mail já cadastrado' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ name, email });
  });
});

app.get('/transactions/:email', (req, res) => {
  connection.query('SELECT * FROM transactions WHERE user_email = ? ORDER BY date DESC', [req.params.email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
});

app.post('/transactions', (req, res) => {
  const { id, user_email, description, amount, date, type, category } = req.body;
  connection.query(
    'INSERT INTO transactions (id, user_email, description, amount, date, type, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, user_email, description, amount, date, type, category],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
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
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/transactions/:id', (req, res) => {
  connection.query('DELETE FROM transactions WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put('/profile', (req, res) => {
  const { name, avatar_url, email } = req.body;
  connection.query('UPDATE users SET name = ?, avatar_url = ? WHERE email = ?', [name, avatar_url, email], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
