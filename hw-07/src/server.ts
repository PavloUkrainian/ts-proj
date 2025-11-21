import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import taskRoutes from './routes/task.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/', taskRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



