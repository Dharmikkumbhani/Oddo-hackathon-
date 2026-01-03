import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Login />
          </div>
        } />
        <Route path="/signup" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Signup />
          </div>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
