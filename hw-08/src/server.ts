import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import morgan from 'morgan';
import taskRoutes from './routes/task.routes.js';
import { connectDatabase, syncDatabase } from './config/database.js';
import { AppError } from './utils/AppError.js';
import './models/User.model.js';
import './models/Task.model.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/', taskRoutes);

app.use(
  (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    console.error('Error:', err);

    if (err instanceof AppError) {
      const response: Record<string, unknown> = {
        error: err.message,
      };
      if (err.details) {
        response.details = err.details;
      }
      res.status(err.statusCode).json(response);
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      });
    }
  }
);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
