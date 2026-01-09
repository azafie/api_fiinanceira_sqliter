require('dotenv').config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'DATABASE_PATH'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente ${envVar} não definida`);
  }
});

console.log('✓ Variáveis de ambiente carregadas');
module.exports = process.env;