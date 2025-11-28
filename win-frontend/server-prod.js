import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist/spa')));

// Fallback para SPA - todas as rotas retornam index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/spa/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WIN Marketplace frontend rodando em http://0.0.0.0:${PORT}`);
});
