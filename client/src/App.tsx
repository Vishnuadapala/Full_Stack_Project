import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { ProjectView } from './components/ProjectView';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="login" />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="signup" />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/projects/:id"
        element={user ? <ProjectView /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
