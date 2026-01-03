import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Attendance from './pages/Attendance';
import Profile from './pages/Profile';

import AttendanceRecords from './pages/AttendanceRecords';
import Layout from './components/Layout';

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

        <Route element={<Layout />}>
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance-records" element={<AttendanceRecords />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
