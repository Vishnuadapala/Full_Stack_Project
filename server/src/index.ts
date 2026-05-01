import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import authMiddleware from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);

// ✅ ADD THIS HERE (outside)
app.get('/', (req, res) => {
  res.send("Backend running successfully");
});

// Serve static files (optional)
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(process.cwd(), 'client', 'dist');

  console.log("Serving frontend from:",clientBuildPath);
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
