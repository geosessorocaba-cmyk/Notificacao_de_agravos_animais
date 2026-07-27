const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Espaço para importar as rotas do banco PostgreSQL
// const rotasAutomec = require('./src/routes/automecRoutes');
// app.use('/api', rotasAutomec);

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'API de logística reversa operando normalmente.' 
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
