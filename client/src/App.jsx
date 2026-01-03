import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
