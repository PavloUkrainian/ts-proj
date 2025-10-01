import { createBrowserRouter } from 'react-router-dom';
import { TasksList } from './features/tasks/pages/TasksList';
import { TaskDetails } from './features/tasks/pages/TaskDetails';
import { CreateTask } from './features/tasks/pages/CreateTask';

export const router = createBrowserRouter([
  {
    path: '/tasks',
    element: <TasksList />,
  },
  {
    path: '/tasks/:id',
    element: <TaskDetails />,
  },
  {
    path: '/tasks/create',
    element: <CreateTask />,
  },
  {
    path: '/',
    element: <TasksList />,
  },
]);
