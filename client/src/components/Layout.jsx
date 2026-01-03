import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { getCurrentUser, logout } from '../services/authService';
import { getTodayStatus, checkIn, checkOut } from '../services/attendanceService';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(getCurrentUser());
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser && location.pathname !== '/login' && location.pathname !== '/signup') {
            navigate('/login');
        } else {
            setUser(currentUser);
        }
    }, [location, navigate]);

    useEffect(() => {
        if (user) {
            fetchStatus();
        }
    }, [user]);

    const fetchStatus = async () => {
        try {
            const status = await getTodayStatus();
            // If checked in but not checked out, we are currently "Present/Checked In"
            // The logic: if checkIn exists and checkOut is null.
            setIsCheckedIn(!!status?.checkIn && !status?.checkOut);
        } catch (error) {
            console.error("Failed to fetch status", error);
        }
    };

    const handleCheckInToggle = async () => {
        try {
            if (isCheckedIn) {
                await checkOut();
            } else {
                await checkIn();
            }
            await fetchStatus();
            // Trigger a custom event so pages can listen if they want (optional)
            window.dispatchEvent(new Event('attendanceUpdated'));
        } catch (error) {
            console.error("Check-in/out failed", error);
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar
                user={user}
                handleLogout={handleLogout}
                isCheckedIn={isCheckedIn}
                toggleCheckIn={handleCheckInToggle}
            />
            <Outlet context={{ isCheckedIn, fetchStatusRefresh: fetchStatus }} />
        </div>
    );
};

export default Layout;
