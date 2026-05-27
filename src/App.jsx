import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ReportView from './pages/ReportView';
import ClientHistory from './pages/ClientHistory';
import Login from './pages/Login';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={<Login setAuth={setIsAuthenticated} />} 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report/:id" 
              element={
                <ProtectedRoute>
                  <ReportView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <ClientHistory />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
