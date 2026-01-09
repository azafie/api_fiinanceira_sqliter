## ✨ Funcionalidades

- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Gestão de Usuários** (registro, login, perfil, logout)
- ✅ **Categorias** personalizadas (entrada/saída)
- ✅ **Transações** financeiras com categorização
- ✅ **Dashboard** com resumo financeiro
- ✅ **Cálculo Automático de Impostos** (regras configuráveis)
- ✅ **Configurações Dinâmicas** (sem necessidade de redeploy)
- ✅ **API RESTful** com documentação completa

## 🏗️ Arquitetura

## Estrutura do Projeto

                finance-api/
                ├── .env # Variáveis de ambiente
                ├── package.json # Dependências e scripts
                ├── database.db # Banco de dados SQLite
                ├── README.md # Documentação
                │
                └── src/
                ├── app.js # Configuração Express
                ├── server.js # Inicialização
                │
                ├── config/ # Configurações
                │ ├── database.js # Conexão SQLite
                │ ├── jwt.js # Config JWT
                │ └── env.js # Validação .env
                │
                ├── database/ # Migrações e seeds
                │ ├── migrations/
                │ └── seeders/
                │
                ├── modules/ # Módulos da aplicação
                │ ├── auth/ # Autenticação
                │ ├── user/ # Usuários
                │ ├── dashboard/ # Dashboard
                │ ├── transaction/ # Transações
                │ ├── category/ # Categorias
                │ ├── tax/ # Cálculo de impostos
                │ └── settings/ # Configurações
                │
                ├── models/ # Models Sequelize
                │ ├── User.js
                │ ├── RefreshToken.js
                │ ├── Transaction.js
                │ ├── Category.js
                │ ├── TaxRule.js
                │ └── Setting.js
                │
                ├── middlewares/ # Middlewares
                │ ├── auth.middleware.js
                │ └── error.middleware.js
                │
                ├── utils/ # Utilitários
                │ ├── hash.js # bcrypt helpers
                │ ├── jwt.js # JWT helpers
                │ └── date.js # helpers de data
                │
                └── validators/ # Validações
                └── index.js


## 📦 Tecnologias Utilizadas

- **Node.js** + **Express** - Backend API
- **SQLite3** + **Sequelize ORM** - Banco de dados
- **JWT (jsonwebtoken)** - Autenticação
- **bcryptjs** - Hash de senhas
- **helmet** + **cors** - Segurança
- **dotenv** - Variáveis de ambiente

## 🚀 Instalação e Configuração

### 1. Clonar e instalar dependências
```bash
git clone <seu-repositorio>
cd finance-api
npm install
2. Configurar ambiente
bash
Copiar código
cp .env.example .env
# Edite o .env com suas configurações
3. Executar migrações
bash
Copiar código
npm run migrate
4. Iniciar servidor
bash
Copiar código
# Desenvolvimento
npm run dev

# Produção
npm start
🔐 Sistema de Autenticação
Fluxo JWT + Refresh Token

Login → Gera Access Token (15min) + Refresh Token (7 dias)

Access Token expira → Usa Refresh Token para obter novo

Refresh Token expira → Usuário precisa fazer login novamente

Logout → Revoga Refresh Token

Endpoints de Autenticação

POST /api/auth/register - Registrar novo usuário

POST /api/auth/login - Login com email/senha

POST /api/auth/refresh - Renovar access token

POST /api/auth/logout - Logout (revoga token)

GET /api/auth/profile - Perfil do usuário (protegido)

📡 Endpoints da API
Autenticação (Públicas)

bash
Copiar código
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
Usuário (Protegidas)

bash
Copiar código
GET    /api/auth/profile
POST   /api/auth/logout
POST   /api/auth/logout-all
Transações (Protegidas)

bash
Copiar código
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
Categorias (Protegidas)

bash
Copiar código
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
Dashboard (Protegidas)

pgsql
Copiar código
GET    /api/dashboard/summary
GET    /api/dashboard/monthly
GET    /api/dashboard/categories
Impostos (Protegidas)

bash
Copiar código
GET    /api/tax/calculate
GET    /api/tax/rules
POST   /api/tax/rules
PUT    /api/tax/rules/:id
Configurações (Admin)

bash
Copiar código
GET    /api/settings
PUT    /api/settings/:key
🗄️ Modelos do Banco de Dados
Users

bash
Copiar código
id, name, email, password_hash, created_at, updated_at
RefreshTokens

bash
Copiar código
id, user_id, token, expires_at, revoked, created_at, updated_at
Categories

bash
Copiar código
id, user_id, name, type, color, icon, created_at, updated_at
Transactions

bash
Copiar código
id, user_id, category_id, description, amount, type, transaction_date, notes, created_at, updated_at
TaxRules

pgsql
Copiar código
id, version, name, min_value, max_value, percentage, active, created_at, updated_at
Settings

bash
Copiar código
id, key, value, description, created_at, updated_at
🔒 Segurança
Senhas hasheadas com bcrypt

JWT com expiração curta (15min)

Refresh tokens revogáveis

HTTPS recomendado em produção

Helmet.js para headers de segurança

CORS configurado

Validação de entrada em todos os endpoints

🧪 Testes
bash
Copiar código
# Testar models
node test-all-models.js

# Testar autenticação
node test-auth-complete.js

# Testar API completa
node test-complete-api.js
📊 Regras de Impostos Dinâmicas
javascript
Copiar código
// Exemplo de regras no banco
{
  name: "Faixa Isenta",
  min_value: 0,
  max_value: 1903.98,
  percentage: 0,
  active: true
}
🚨 Tratamento de Erros
json
Copiar código
{
  "success": true/false,
  "data": {}, // ou "error": "mensagem"
  "code": "ERROR_CODE" // opcional
}
Códigos de erro comuns:

MISSING_TOKEN - Token não fornecido

INVALID_TOKEN - Token inválido ou expirado

USER_NOT_FOUND - Usuário não existe

VALIDATION_ERROR - Dados inválidos

📈 Dashboard
Saldo total (entradas - saídas)

Total por mês (gráfico temporal)

Distribuição por categoria (gráfico pizza)

Top 5 transações (maiores valores)

Impostos estimados (cálculo automático)

🔄 Scripts NPM
json
Copiar código
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "migrate": "node src/database/migrate.js",
  "test:models": "node test-all-models.js",
  "test:auth": "node test-auth-complete.js",
  "test:api": "node test-complete-api.js"
}
🌐 Deploy
Preparação

bash
Copiar código
npm ci --only=production
npm run migrate
Variáveis de ambiente (produção)

ini
Copiar código
NODE_ENV=production
PORT=3000
JWT_SECRET=seu_super_secret_forte_aqui
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
DATABASE_PATH=./database.prod.db
PM2 (recomendado)

bash
Copiar código
npm install -g pm2
pm2 start src/server.js --name finance-api
pm2 save
pm2 startup
🤝 Contribuição
Fork o projeto

Crie uma branch (git checkout -b feature/nova-funcionalidade)

Commit suas mudanças (git commit -m 'Adiciona nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

👥 Autores
Emerson Oliveira - skydrean@gmail.com

🆘 Suporte
📧 Email: sskydrean@gmail.com

🐛 Issues: GitHub Issues

📖 Wiki: Documentação completa

🎯 Status do Projeto
✅ COMPLETO

Estrutura do projeto

Banco de dados SQLite + Sequelize

Migrações automáticas

Models completos

Autenticação JWT com refresh tokens

Middleware de proteção

API de autenticação (register, login, refresh, logout)

Sistema de hash de senhas

Testes unitários

Documentação README completa

Scripts NPM configurados

Configuração de ambiente (.env)

🚧 EM DESENVOLVIMENTO

Dashboard financeiro

CRUD de transações

CRUD de categorias

Cálculo de impostos

Configurações administrativas

Frontend React/Next.js

📋 PLANEJADO

Exportação para PDF/Excel

Gráficos interativos

API documentation (Swagger)

Docker deployment

Testes E2E

CI/CD pipeline

⭐ Se este projeto foi útil, deixe uma estrela no GitHub!
