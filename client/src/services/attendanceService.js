import axios from 'axios';

const API_URL = 'http://localhost:5001/api/attendance';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };
};

export const checkIn = async () => {
    const response = await axios.post(`${API_URL}/checkin`, {}, getAuthHeader());
    return response.data;
};

export const checkOut = async () => {
    const response = await axios.post(`${API_URL}/checkout`, {}, getAuthHeader());
    return response.data;
};

export const getAttendance = async (params) => {
    const response = await axios.get(API_URL, {
        ...getAuthHeader(),
        params
    });
    return response.data;
};

export const getTodayStatus = async () => {
    const response = await axios.get(`${API_URL}/status`, getAuthHeader());
    return response.data;
};
