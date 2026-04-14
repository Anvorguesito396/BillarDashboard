import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { Tables } from './screens/Tables';
import { TableSession } from './screens/TableSession';
import { Sales } from './screens/Sales';
import { Inventory } from './screens/Inventory';
import { CashRegister } from './screens/CashRegister';
import { useApp } from './context/AppContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tables',
    element: (
      <ProtectedRoute>
        <Tables />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tables/:tableId',
    element: (
      <ProtectedRoute>
        <TableSession />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sales',
    element: (
      <ProtectedRoute>
        <Sales />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory',
    element: (
      <ProtectedRoute>
        <Inventory />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cash-register',
    element: (
      <ProtectedRoute>
        <CashRegister />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
