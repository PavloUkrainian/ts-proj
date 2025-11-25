import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import taskRoutes from './routes/task.routes.js';
import { AppError } from './utils/AppError.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/', taskRoutes);

app.use((err: AppError | Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';
  const response: { error: string; details?: unknown } = { error: message };
  
  if (err instanceof AppError && err.details) {
    response.details = err.details;
  }
  
  res.status(statusCode).json(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



