import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import Album from './pages/Album';
import ConnectPartner from './pages/ConnectPartner';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/Welcome';

function App() {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/welcome" element={!user ? <Welcome /> : <Navigate to="/" replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/album" element={<Album />} />
          <Route path="/connect" element={<ConnectPartner />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to={user ? '/' : '/welcome'} />} />
    </Routes>
  );
}

export default App;