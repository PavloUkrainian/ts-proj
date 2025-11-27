import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { UserProvider } from './shared/contexts/UserContext';
import { ToastProvider } from './shared/contexts/ToastContext';
import './App.css';

function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </UserProvider>
  );
}

export default App;
