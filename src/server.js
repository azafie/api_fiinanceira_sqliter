const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 Endpoints:');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/login');
    console.log('  POST /api/auth/refresh');
    console.log('  POST /api/auth/logout');
    console.log('  GET  /api/auth/profile');
  }
});
