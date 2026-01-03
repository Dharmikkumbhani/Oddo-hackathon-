import axios from 'axios';

const API_URL = 'http://localhost:5000/api/profile';

// Get profile
export const getProfile = async (id = 'me') => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
};

// Update profile
export const updateProfile = async (id, data) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = userData?.token;

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(`${API_URL}/${id}`, data, config);
    return response.data;
};
