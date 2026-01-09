// src/app.js - VERSÃO COM LOGS LIMPOS
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('./config/env');
const { initDatabase } = require('./database/init');

const app = express();

// ========================
// Inicialização Silenciosa
// ========================
(async () => {
  try {
    await initDatabase();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Sistema inicializado');
    }
    
  } catch (err) {
    console.error('❌ Erro fatal:', err.message);
    process.exit(1);
  }
})();

// ========================
// Middlewares
// ========================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// Rotas
// ========================
app.use('/api/auth', require('./modules/auth/auth.routes'));

// ========================
// Health check
// ========================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ========================
// 404
// ========================
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Rota não encontrada'
  });
});

// ========================
// Error handler
// ========================
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Erro interno'
  });
});

module.exports = app;