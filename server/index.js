import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function initDB() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco RDS com sucesso!');

    // Criar tabela de transações se não existir
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tabela "transactions" verificada/criada.');
    await connection.end();
  } catch (err) {
    console.error('❌ Erro ao conectar ou criar tabela:', err.message);
  }
}

// Rota para buscar transações
app.get('/api/transactions/:user_id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.params.user_id]
    );
    await connection.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para salvar transação
app.post('/api/transactions', async (req, res) => {
  const { id, description, amount, date, type, user_id } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(
      'INSERT INTO transactions (id, description, amount, date, type, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, description, amount, date, type, user_id]
    );
    await connection.end();
    res.status(201).json({ message: 'Transação salva!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para deletar transação
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json({ message: 'Transação removida!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend rodando na porta ${PORT}`);
  initDB();
});
