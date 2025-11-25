import { createBrowserRouter } from 'react-router-dom';
import { KanbanBoard } from './features/tasks/pages/KanbanBoard';
import { TaskDetails } from './features/tasks/pages/TaskDetails';
import { CreateTask } from './features/tasks/pages/CreateTask';
import { EditTask } from './features/tasks/pages/EditTask';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <KanbanBoard />,
  },
  {
    path: '/tasks',
    element: <KanbanBoard />,
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
    path: '/tasks/:id/edit',
    element: <EditTask />,
  },
]);
