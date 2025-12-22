import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import teamsRouter from './routes/teams.js';
import newsRouter from './routes/news.js';
import announcementRouter from './routes/announcement.js';
import uploadRouter from './routes/upload.js';
import blobDeleteRouter from './routes/blob-delete.js';
import initRouter from './routes/init.js';
import migrateRouter from './routes/migrate.js';
import testEnvRouter from './routes/test-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API 路由
app.use('/api/teams', teamsRouter);
app.use('/api/news', newsRouter);
app.use('/api/announcement', announcementRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/blob-delete', blobDeleteRouter);
app.use('/api/init', initRouter);
app.use('/api/migrate', migrateRouter);
app.use('/api/test-env', testEnvRouter);

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../../dist');
  app.use(express.static(distPath));
  
  // SPA 路由回退
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

